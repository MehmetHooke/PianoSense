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
  originalAudioPath: string;
  recordedAudioPath: string;
};

type AnalysisItemStatus =
  | "correct"
  | "wrongNote"
  | "missed"
  | "extra"
  | "timingEarly"
  | "timingLate";

type MockAnalysisItem = {
  expectedNote: string;
  playedNote: string | null;
  expectedStart: number;
  playedStart: number | null;
  status: AnalysisItemStatus;
  timingOffsetMs?: number;
};

const createMockResult = () => {
  const items: MockAnalysisItem[] = [
    {
      expectedNote: "C4",
      playedNote: "C4",
      expectedStart: 0.5,
      playedStart: 0.52,
      status: "correct",
      timingOffsetMs: 20,
    },
    {
      expectedNote: "D4",
      playedNote: "E4",
      expectedStart: 1.1,
      playedStart: 1.08,
      status: "wrongNote",
      timingOffsetMs: -20,
    },
    {
      expectedNote: "F4",
      playedNote: null,
      expectedStart: 1.8,
      playedStart: null,
      status: "missed",
    },
    {
      expectedNote: "G4",
      playedNote: "G4",
      expectedStart: 2.4,
      playedStart: 2.7,
      status: "timingLate",
      timingOffsetMs: 300,
    },
  ];

  return {
    overallScore: 78,
    pitchScore: 84,
    timingScore: 70,

    totalNotes: items.length,
    correctNotes: items.filter((item) => item.status === "correct").length,
    wrongNotes: items.filter((item) => item.status === "wrongNote").length,
    missedNotes: items.filter((item) => item.status === "missed").length,
    extraNotes: items.filter((item) => item.status === "extra").length,

    items,
  };
};

export const createAnalysisJob = onCall<CreateAnalysisJobPayload>(
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "Analiz başlatmak için giriş yapılmalı.",
      );
    }

    const { songId, recordingId, originalAudioPath, recordedAudioPath } =
      request.data;

    if (!songId || !recordingId || !originalAudioPath || !recordedAudioPath) {
      throw new HttpsError(
        "invalid-argument",
        "songId, recordingId, originalAudioPath ve recordedAudioPath zorunludur.",
      );
    }

    const expectedRecordedPrefix = `users/${uid}/`;

    if (!recordedAudioPath.startsWith(expectedRecordedPrefix)) {
      throw new HttpsError(
        "permission-denied",
        "Bu kayıt dosyası bu kullanıcıya ait değil.",
      );
    }

    const db = admin.firestore();
    const jobRef = db.collection("analysisJobs").doc();

    await jobRef.set({
      userId: uid,
      songId,
      recordingId,
      originalAudioPath,
      recordedAudioPath,
      status: "processing",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const mockResult = createMockResult();

    await jobRef.update({
      status: "completed",
      result: mockResult,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      jobId: jobRef.id,
    };
  },
);
