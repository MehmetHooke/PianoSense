import { CloudTasksClient } from "@google-cloud/tasks";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";

admin.initializeApp();

setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 120,
  memory: "1GiB",
});

type CreatePendingAnalysisJobPayload = {
  songId: string;
};

type StartAnalysisJobPayload = {
  jobId: string;
  recordingId: string;
  recordedAudioPath: string;
};

type MarkAnalysisJobFailedPayload = {
  jobId: string;
  errorCode: string;
  errorMessage: string;
};

const tasksClient = new CloudTasksClient();

const CLOUD_RUN_ANALYZE_URL = process.env.CLOUD_RUN_ANALYZE_URL;
const STORAGE_BUCKET =
  process.env.STORAGE_BUCKET ?? "pianosense-64bc1.firebasestorage.app";

const TASKS_PROJECT_ID = process.env.TASKS_PROJECT_ID ?? "pianosense-64bc1";
const TASKS_LOCATION = process.env.TASKS_LOCATION ?? "europe-west1";
const TASKS_QUEUE = process.env.TASKS_QUEUE ?? "analysis-jobs";
const TASKS_SERVICE_ACCOUNT = process.env.TASKS_SERVICE_ACCOUNT;

export const createPendingAnalysisJob = onCall<CreatePendingAnalysisJobPayload>(
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "Analiz başlatmak için giriş yapılmalı.",
      );
    }

    const { songId } = request.data;

    if (!songId) {
      throw new HttpsError("invalid-argument", "songId zorunludur.");
    }

    const db = admin.firestore();

    const songRef = db.collection("songs").doc(songId);
    const songSnapshot = await songRef.get();

    if (!songSnapshot.exists) {
      throw new HttpsError("not-found", "Seçilen parça bulunamadı.");
    }

    const songData = songSnapshot.data();

    if (!songData?.originalAudioPath) {
      throw new HttpsError(
        "failed-precondition",
        "Seçilen parçanın orijinal ses dosyası tanımlı değil.",
      );
    }

    if (songData.isActive === false) {
      throw new HttpsError(
        "failed-precondition",
        "Bu parça şu anda analiz için aktif değil.",
      );
    }

    const originalAudioPath = songData.originalAudioPath as string;
    const songTitle =
      typeof songData.title === "string" && songData.title.trim().length > 0
        ? songData.title.trim()
        : "Piyano egzersizi";

    const recordingId = `${Date.now()}`;
    const jobRef = db.collection("analysisJobs").doc();

    await jobRef.set({
      userId: uid,
      songId,
      songTitle,
      recordingId,
      originalAudioPath,
      recordedAudioPath: null,
      status: "uploading",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      jobId: jobRef.id,
      recordingId,
    };
  },
);

export const startAnalysisJob = onCall<StartAnalysisJobPayload>(
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "Analiz başlatmak için giriş yapılmalı.",
      );
    }

    if (!CLOUD_RUN_ANALYZE_URL) {
      throw new HttpsError(
        "failed-precondition",
        "Cloud Run analiz URL'i yapılandırılmamış.",
      );
    }

    if (!TASKS_SERVICE_ACCOUNT) {
      throw new HttpsError(
        "failed-precondition",
        "Cloud Tasks servis hesabı yapılandırılmamış.",
      );
    }

    const { jobId, recordingId, recordedAudioPath } = request.data;

    if (!jobId || !recordingId || !recordedAudioPath) {
      throw new HttpsError(
        "invalid-argument",
        "jobId, recordingId ve recordedAudioPath zorunludur.",
      );
    }

    const db = admin.firestore();

    const jobRef = db.collection("analysisJobs").doc(jobId);
    const jobSnapshot = await jobRef.get();

    if (!jobSnapshot.exists) {
      throw new HttpsError("not-found", "Analiz işi bulunamadı.");
    }

    const jobData = jobSnapshot.data();

    if (jobData?.userId !== uid) {
      throw new HttpsError(
        "permission-denied",
        "Bu analiz işi bu kullanıcıya ait değil.",
      );
    }

    if (jobData?.recordingId !== recordingId) {
      throw new HttpsError(
        "permission-denied",
        "Kayıt bilgisi analiz işiyle eşleşmiyor.",
      );
    }

    const songId = jobData.songId as string;
    const originalAudioPath = jobData.originalAudioPath as string;

    const expectedRecordedPrefix = `users/${uid}/songs/${songId}/recordings/`;

    if (!recordedAudioPath.startsWith(expectedRecordedPrefix)) {
      throw new HttpsError(
        "permission-denied",
        "Bu kayıt dosyası bu kullanıcıya veya bu parçaya ait değil.",
      );
    }

    await jobRef.update({
      recordedAudioPath,
      status: "queued",
      updatedAt: FieldValue.serverTimestamp(),
    });

    const queuePath = tasksClient.queuePath(
      TASKS_PROJECT_ID,
      TASKS_LOCATION,
      TASKS_QUEUE,
    );

    const taskPayload = {
      jobId,
      userId: uid,
      songId,
      originalAudioPath,
      recordedAudioPath,
      bucketName: STORAGE_BUCKET,
      deleteRecordedAfterAnalysis: false,
    };

    try {
      await tasksClient.createTask({
        parent: queuePath,
        task: {
          httpRequest: {
            httpMethod: "POST",
            url: CLOUD_RUN_ANALYZE_URL,
            headers: {
              "Content-Type": "application/json",
            },
            body: Buffer.from(JSON.stringify(taskPayload)).toString("base64"),
            oidcToken: {
              serviceAccountEmail: TASKS_SERVICE_ACCOUNT,
            },
          },
        },
      });

      return {
        ok: true,
        jobId,
      };
    } catch (error) {
      console.error("Cloud Tasks createTask error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Analiz görevi kuyruğa eklenemedi.";

      await jobRef.update({
        status: "failed",
        errorCode: "CLOUD_TASK_CREATE_FAILED",
        errorMessage: message,
        updatedAt: FieldValue.serverTimestamp(),
        failedAt: FieldValue.serverTimestamp(),
      });

      throw new HttpsError(
        "internal",
        "Analiz görevi kuyruğa eklenemedi.",
        message,
      );
    }
  },
);

export const markAnalysisJobFailed = onCall<MarkAnalysisJobFailedPayload>(
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "Analiz işini güncellemek için giriş yapılmalı.",
      );
    }

    const { jobId, errorCode, errorMessage } = request.data;

    if (!jobId || !errorCode || !errorMessage) {
      throw new HttpsError(
        "invalid-argument",
        "jobId, errorCode ve errorMessage zorunludur.",
      );
    }

    const db = admin.firestore();

    const jobRef = db.collection("analysisJobs").doc(jobId);
    const jobSnapshot = await jobRef.get();

    if (!jobSnapshot.exists) {
      throw new HttpsError("not-found", "Analiz işi bulunamadı.");
    }

    const jobData = jobSnapshot.data();

    if (jobData?.userId !== uid) {
      throw new HttpsError(
        "permission-denied",
        "Bu analiz işi bu kullanıcıya ait değil.",
      );
    }

    await jobRef.update({
      status: "failed",
      errorCode,
      errorMessage,
      updatedAt: FieldValue.serverTimestamp(),
      failedAt: FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      jobId,
    };
  },
);

type FirestoreDb = ReturnType<typeof admin.firestore>;

async function deleteDocsInBatches(
  db: FirestoreDb,
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
) {
  const batchSize = 400;

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + batchSize);

    for (const doc of chunk) {
      batch.delete(doc.ref);
    }

    await batch.commit();
  }
}

async function deleteStudentRelations(db: FirestoreDb, studentId: string) {
  console.log(`[deleteMyAccount] Cleaning student relations: ${studentId}`);

  // ---------------------------------------------------------
  // 1. Öğrencinin bulunduğu tüm sınıflardan çıkar
  //
  // classes/{classId}/students/{studentId}
  // ---------------------------------------------------------
  const classMemberships = await db
    .collectionGroup("students")
    .where("studentId", "==", studentId)
    .get();

  for (const membershipDoc of classMemberships.docs) {
    const classRef = membershipDoc.ref.parent.parent;

    if (!classRef) {
      continue;
    }

    await db.runTransaction(async (transaction) => {
      const [membershipSnap, classSnap] = await Promise.all([
        transaction.get(membershipDoc.ref),
        transaction.get(classRef),
      ]);

      if (!membershipSnap.exists) {
        return;
      }

      const membershipData = membershipSnap.data();
      const wasActive = membershipData?.status === "active";

      transaction.delete(membershipDoc.ref);

      if (classSnap.exists && wasActive) {
        const classData = classSnap.data();

        const currentStudentCount =
          typeof classData?.studentCount === "number"
            ? classData.studentCount
            : 0;

        transaction.update(classRef, {
          studentCount: Math.max(0, currentStudentCount - 1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });
  }

  console.log(
    `[deleteMyAccount] Student class memberships deleted: ${classMemberships.size}`,
  );

  // ---------------------------------------------------------
  // 2. Bütün öğretmenlerin takip listelerinden öğrenciyi çıkar
  //
  // teachers/{teacherId}/followedStudents/{studentId}
  //
  // Öğretmen öğrenciyi sınıf dışında doğrudan kod ile de
  // takip edebildiği için collectionGroup kullanıyoruz.
  // ---------------------------------------------------------
  const followedStudentSnapshot = await db
    .collectionGroup("followedStudents")
    .where("studentId", "==", studentId)
    .get();

  await deleteDocsInBatches(db, followedStudentSnapshot.docs);

  console.log(
    `[deleteMyAccount] Teacher follow relations deleted: ${followedStudentSnapshot.size}`,
  );

  // ---------------------------------------------------------
  // 3. Veli bağlantılarını temizle
  //
  // parentLinks/{parentId}_{studentId}
  //
  // ve
  //
  // parents/{parentId}/children/{studentId}
  // ---------------------------------------------------------
  const parentLinksSnapshot = await db
    .collection("parentLinks")
    .where("studentId", "==", studentId)
    .get();

  for (const linkDoc of parentLinksSnapshot.docs) {
    const linkData = linkDoc.data();
    const parentId = linkData.parentId;

    if (typeof parentId === "string" && parentId.length > 0) {
      const parentChildRef = db
        .collection("parents")
        .doc(parentId)
        .collection("children")
        .doc(studentId);

      await parentChildRef.delete();
    }

    await linkDoc.ref.delete();
  }

  console.log(
    `[deleteMyAccount] Parent relations deleted: ${parentLinksSnapshot.size}`,
  );

  // users/{studentId}/classes/*
  // users/{studentId}/parentLinks/*
  //
  // ayrıca silmeye gerek yok.
  // En sonda users/{uid} recursiveDelete yapılacak.
}

async function deleteParentRelations(db: FirestoreDb, parentId: string) {
  console.log(`[deleteMyAccount] Cleaning parent relations: ${parentId}`);

  // ---------------------------------------------------------
  // parentLinks üzerinden velinin bütün çocuklarını bul
  // ---------------------------------------------------------
  const linksSnapshot = await db
    .collection("parentLinks")
    .where("parentId", "==", parentId)
    .get();

  for (const linkDoc of linksSnapshot.docs) {
    const linkData = linkDoc.data();
    const studentId = linkData.studentId;

    // Öğrencinin kendi hesabındaki veli bağlantısını kaldır
    //
    // users/{studentId}/parentLinks/{parentId}
    if (typeof studentId === "string" && studentId.length > 0) {
      const studentParentLinkRef = db
        .collection("users")
        .doc(studentId)
        .collection("parentLinks")
        .doc(parentId);

      await studentParentLinkRef.delete();
    }

    // Global parentLinks kaydını kaldır
    await linkDoc.ref.delete();
  }

  // ---------------------------------------------------------
  // parents/{parentId}
  // ve children subcollection'ı tamamen sil
  // ---------------------------------------------------------
  const parentRef = db.collection("parents").doc(parentId);

  await db.recursiveDelete(parentRef);

  console.log(
    `[deleteMyAccount] Parent relations deleted: ${linksSnapshot.size}`,
  );
}

async function deleteTeacherRelations(db: FirestoreDb, teacherId: string) {
  console.log(`[deleteMyAccount] Cleaning teacher relations: ${teacherId}`);

  // ---------------------------------------------------------
  // Öğretmenin oluşturduğu bütün sınıfları bul
  // ---------------------------------------------------------
  const classesSnapshot = await db
    .collection("classes")
    .where("teacherId", "==", teacherId)
    .get();

  for (const classDoc of classesSnapshot.docs) {
    const classId = classDoc.id;

    // -------------------------------------------------------
    // Önce sınıftaki öğrencileri bul.
    //
    // Her öğrencinin:
    // users/{studentId}/classes/{classId}
    //
    // kaydını kaldıracağız.
    // -------------------------------------------------------
    const studentsSnapshot = await classDoc.ref.collection("students").get();

    for (const studentDoc of studentsSnapshot.docs) {
      const studentId =
        typeof studentDoc.data().studentId === "string"
          ? studentDoc.data().studentId
          : studentDoc.id;

      const studentClassRef = db
        .collection("users")
        .doc(studentId)
        .collection("classes")
        .doc(classId);

      await studentClassRef.delete();
    }

    // -------------------------------------------------------
    // Sonra sınıfı ve students alt koleksiyonunu tamamen sil
    // -------------------------------------------------------
    await db.recursiveDelete(classDoc.ref);

    console.log(`[deleteMyAccount] Teacher class deleted: ${classId}`);
  }

  // ---------------------------------------------------------
  // teachers/{teacherId}
  //
  // Bunun altındaki followedStudents da recursive olarak gider.
  // ---------------------------------------------------------
  const teacherRef = db.collection("teachers").doc(teacherId);

  await db.recursiveDelete(teacherRef);

  console.log(
    `[deleteMyAccount] Teacher classes deleted: ${classesSnapshot.size}`,
  );
}

async function deleteAnalysisJobs(db: FirestoreDb, uid: string) {
  const analysisJobsSnapshot = await db
    .collection("analysisJobs")
    .where("userId", "==", uid)
    .get();

  await deleteDocsInBatches(db, analysisJobsSnapshot.docs);

  console.log(
    `[deleteMyAccount] analysisJobs deleted: ${analysisJobsSnapshot.size}`,
  );
}

export const deleteMyAccount = onCall(async (request) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Hesabı silmek için giriş yapılmalı.",
    );
  }

  const db = admin.firestore();
  const bucket = admin.storage().bucket(STORAGE_BUCKET);

  try {
    console.log(`[deleteMyAccount] Account deletion started: ${uid}`);

    // =====================================================
    // 1. Kullanıcı profilini oku ve rolünü öğren
    // =====================================================
    const userRef = db.collection("users").doc(uid);

    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      throw new HttpsError("not-found", "Kullanıcı profili bulunamadı.");
    }

    const userData = userSnapshot.data();
    const role = userData?.role;

    if (role !== "student" && role !== "teacher" && role !== "parent") {
      throw new HttpsError("failed-precondition", "Kullanıcı rolü geçersiz.");
    }

    console.log(`[deleteMyAccount] User role: ${role}`);

    // =====================================================
    // 2. Role göre başka kullanıcılarda / koleksiyonlarda
    //    bulunan ilişkileri temizle
    // =====================================================
    if (role === "student") {
      await deleteStudentRelations(db, uid);
    }

    if (role === "teacher") {
      await deleteTeacherRelations(db, uid);
    }

    if (role === "parent") {
      await deleteParentRelations(db, uid);
    }

    // =====================================================
    // 3. Kullanıcıya ait analiz kayıtlarını sil
    // =====================================================
    await deleteAnalysisJobs(db, uid);

    // =====================================================
    // 4. Storage'daki bütün kullanıcı dosyalarını sil
    //
    // users/{uid}/...
    //
    // Buna piyano kayıtları dahil.
    // =====================================================
    const userStoragePrefix = `users/${uid}/`;

    await bucket.deleteFiles({
      prefix: userStoragePrefix,
    });

    console.log(
      `[deleteMyAccount] Storage files deleted: ${userStoragePrefix}`,
    );

    // =====================================================
    // 5. users/{uid} profilini ve bütün alt koleksiyonlarını
    //    sil
    //
    // student:
    //   users/{uid}/classes/*
    //   users/{uid}/parentLinks/*
    //
    // dahil.
    // =====================================================
    await db.recursiveDelete(userRef);

    console.log(`[deleteMyAccount] User document recursively deleted: ${uid}`);

    // =====================================================
    // 6. Firebase Authentication hesabını EN SON sil
    // =====================================================
    await admin.auth().deleteUser(uid);

    console.log(`[deleteMyAccount] Firebase Auth user deleted: ${uid}`);

    console.log(`[deleteMyAccount] Account deletion completed: ${uid}`);

    return {
      ok: true,
    };
  } catch (error) {
    console.error("[deleteMyAccount] Account deletion error:", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Hesap silinirken bilinmeyen bir hata oluştu.";

    throw new HttpsError(
      "internal",
      "Hesap silinirken bir sorun oluştu.",
      message,
    );
  }
});
