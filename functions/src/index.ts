import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";

admin.initializeApp();

setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 500,
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

type CloudRunAnalyzeResponse = {
  ok: boolean;
  source: string;
  jobId: string;
  userId: string;
  songId: string;
  result: unknown;
};

const CLOUD_RUN_ANALYZE_URL = process.env.CLOUD_RUN_ANALYZE_URL;
const STORAGE_BUCKET =
  process.env.STORAGE_BUCKET ?? "pianosense-64bc1.firebasestorage.app";

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
      status: "processing",
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    try {
      const cloudRunResponse = await fetch(CLOUD_RUN_ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobRef.id,
          userId: uid,
          songId,
          originalAudioPath,
          recordedAudioPath,
          bucketName: STORAGE_BUCKET,
          deleteRecordedAfterAnalysis: false,
        }),
      });

      const responseText = await cloudRunResponse.text();

      if (!cloudRunResponse.ok) {
        await jobRef.update({
          status: "failed",
          errorCode: "CLOUD_RUN_ANALYZE_FAILED",
          errorMessage: responseText,
          updatedAt: FieldValue.serverTimestamp(),
          failedAt: FieldValue.serverTimestamp(),
        });

        throw new HttpsError(
          "internal",
          "Ses analizi başarısız oldu.",
          responseText,
        );
      }

      const cloudRunData = JSON.parse(responseText) as CloudRunAnalyzeResponse;

      if (!cloudRunData.ok || !cloudRunData.result) {
        await jobRef.update({
          status: "failed",
          errorCode: "INVALID_ANALYZE_RESPONSE",
          errorMessage: "Cloud Run geçersiz analiz sonucu döndürdü.",
          updatedAt: FieldValue.serverTimestamp(),
          failedAt: FieldValue.serverTimestamp(),
        });

        throw new HttpsError(
          "internal",
          "Cloud Run geçersiz analiz sonucu döndürdü.",
        );
      }

      await jobRef.update({
        status: "completed",
        result: cloudRunData.result,
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: FieldValue.serverTimestamp(),
      });

      return {
        ok: true,
        jobId: jobRef.id,
      };
    } catch (error) {
      console.error("startAnalysisJob error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Bilinmeyen analiz hatası oluştu.";

      await jobRef.update({
        status: "failed",
        errorCode: "ANALYSIS_JOB_FAILED",
        errorMessage: message,
        updatedAt: FieldValue.serverTimestamp(),
        failedAt: FieldValue.serverTimestamp(),
      });

      throw new HttpsError(
        "internal",
        "Analiz başlatılırken bir sorun oluştu.",
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
