import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";

admin.initializeApp();

setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 300,
  memory: "1GiB",
});

type CreateAnalysisJobPayload = {
  songId: string;
  recordingId: string;
  recordedAudioPath: string;
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

export const createAnalysisJob = onCall<CreateAnalysisJobPayload>(
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

    const { songId, recordingId, recordedAudioPath } = request.data;

    if (!songId || !recordingId || !recordedAudioPath) {
      throw new HttpsError(
        "invalid-argument",
        "songId, recordingId ve recordedAudioPath zorunludur.",
      );
    }

    const expectedRecordedPrefix = `users/${uid}/songs/${songId}/recordings/`;

    if (!recordedAudioPath.startsWith(expectedRecordedPrefix)) {
      throw new HttpsError(
        "permission-denied",
        "Bu kayıt dosyası bu kullanıcıya veya bu parçaya ait değil.",
      );
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

    const jobRef = db.collection("analysisJobs").doc();

    await jobRef.set({
      userId: uid,
      songId,
      songTitle,
      recordingId,
      originalAudioPath,
      recordedAudioPath,
      status: "processing",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      startedAt: FieldValue.serverTimestamp(),
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
      console.error("createAnalysisJob error:", error);

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
