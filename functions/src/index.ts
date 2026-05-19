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
