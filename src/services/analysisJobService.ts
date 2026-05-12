// src/services/analysisJobService.ts

import { db, functions } from "@/src/services/firebase";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

type CreateAnalysisJobParams = {
  songId: string;
  recordingId: string;
  recordedAudioPath: string;
};

type CreateAnalysisJobCallablePayload = {
  songId: string;
  recordingId: string;
  recordedAudioPath: string;
};

type CreateAnalysisJobCallableResponse = {
  ok: boolean;
  jobId: string;
};

export async function createAnalysisJob({
  songId,
  recordingId,
  recordedAudioPath,
}: CreateAnalysisJobParams): Promise<string> {
  const callable = httpsCallable<
    CreateAnalysisJobCallablePayload,
    CreateAnalysisJobCallableResponse
  >(functions, "createAnalysisJob");

  const response = await callable({
    songId,
    recordingId,
    recordedAudioPath,
  });

  return response.data.jobId;
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
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        failedAt: data.failedAt,
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
    startedAt: data.startedAt,
    completedAt: data.completedAt,
    failedAt: data.failedAt,
    errorCode: data.errorCode,
    errorMessage: data.errorMessage,
    result: data.result,
  };
}
