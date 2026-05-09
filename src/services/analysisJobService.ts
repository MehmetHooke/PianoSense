// src/services/analysisJobService.ts

import { db } from "@/src/services/firebase";
import type { AnalysisJob, AnalysisResult } from "@/src/types/analysisJob";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

type CreateAnalysisJobParams = {
  userId: string;
  songId: string;
  recordingId: string;
  originalAudioPath: string;
  recordedAudioPath: string;
};

export async function createAnalysisJob({
  userId,
  songId,
  recordingId,
  originalAudioPath,
  recordedAudioPath,
}: CreateAnalysisJobParams): Promise<string> {
  const jobsRef = collection(db, "analysisJobs");

  const jobDoc = await addDoc(jobsRef, {
    userId,
    songId,
    recordingId,
    originalAudioPath,
    recordedAudioPath,
    status: "processing",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return jobDoc.id;
}

export function listenAnalysisJob(
  jobId: string,
  onChange: (job: AnalysisJob | null) => void,
  onError?: (error: Error) => void,
) {
  const jobRef = doc(db, "analysisJobs", jobId);

  return onSnapshot(
    jobRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }

      const data = snapshot.data();

      onChange({
        id: snapshot.id,
        userId: data.userId,
        songId: data.songId,
        recordingId: data.recordingId,
        originalAudioPath: data.originalAudioPath,
        recordedAudioPath: data.recordedAudioPath,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        result: data.result,
      });
    },
    (error) => {
      console.log("Listen analysis job error:", error);
      onError?.(error);
    },
  );
}

export async function getAnalysisJobById(
  jobId: string,
): Promise<AnalysisJob | null> {
  const jobRef = doc(db, "analysisJobs", jobId);
  const snapshot = await getDoc(jobRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    userId: data.userId,
    songId: data.songId,
    recordingId: data.recordingId,
    originalAudioPath: data.originalAudioPath,
    recordedAudioPath: data.recordedAudioPath,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    errorCode: data.errorCode,
    errorMessage: data.errorMessage,
    result: data.result,
  };
}

function getMockAnalysisResult(): AnalysisResult {
  return {
    overallScore: 82,
    pitchScore: 86,
    timingScore: 76,

    totalNotes: 8,
    correctNotes: 5,
    wrongNotes: 1,
    missedNotes: 1,
    extraNotes: 1,

    items: [
      {
        expectedNote: "C4",
        playedNote: "C4",
        expectedStart: 0.4,
        playedStart: 0.42,
        status: "correct",
        timingOffsetMs: 20,
      },
      {
        expectedNote: "D4",
        playedNote: "D4",
        expectedStart: 1.0,
        playedStart: 1.12,
        status: "timingLate",
        timingOffsetMs: 120,
      },
      {
        expectedNote: "E4",
        playedNote: "F4",
        expectedStart: 1.6,
        playedStart: 1.61,
        status: "wrongNote",
        timingOffsetMs: 10,
      },
      {
        expectedNote: "F4",
        playedNote: null,
        expectedStart: 2.2,
        playedStart: null,
        status: "missed",
      },
      {
        expectedNote: "G4",
        playedNote: "G4",
        expectedStart: 2.8,
        playedStart: 2.77,
        status: "correct",
        timingOffsetMs: -30,
      },
      {
        expectedNote: "A4",
        playedNote: "A4",
        expectedStart: 3.4,
        playedStart: 3.4,
        status: "correct",
        timingOffsetMs: 0,
      },
      {
        expectedNote: "B4",
        playedNote: "B4",
        expectedStart: 4.0,
        playedStart: 3.89,
        status: "timingEarly",
        timingOffsetMs: -110,
      },
      {
        expectedNote: "C5",
        playedNote: "C5",
        expectedStart: 4.6,
        playedStart: 4.62,
        status: "correct",
        timingOffsetMs: 20,
      },
    ],
  };
}

export async function completeAnalysisJobWithMockResult(jobId: string) {
  const jobRef = doc(db, "analysisJobs", jobId);

  await updateDoc(jobRef, {
    status: "completed",
    result: getMockAnalysisResult(),
    updatedAt: serverTimestamp(),
  });
}
