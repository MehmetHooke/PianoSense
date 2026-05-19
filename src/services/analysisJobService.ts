// src/services/analysisJobService.ts

import { db, functions } from "@/src/services/firebase";
import type { AnalysisJob } from "@/src/types/analysisJob";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

type CreatePendingAnalysisJobParams = {
  songId: string;
};

type CreatePendingAnalysisJobCallablePayload = {
  songId: string;
};

type CreatePendingAnalysisJobCallableResponse = {
  ok: boolean;
  jobId: string;
  recordingId: string;
};

type StartAnalysisJobParams = {
  jobId: string;
  recordingId: string;
  recordedAudioPath: string;
};

type StartAnalysisJobCallablePayload = {
  jobId: string;
  recordingId: string;
  recordedAudioPath: string;
};

type StartAnalysisJobCallableResponse = {
  ok: boolean;
  jobId: string;
};

type MarkAnalysisJobFailedParams = {
  jobId: string;
  errorCode: string;
  errorMessage: string;
};

type MarkAnalysisJobFailedCallablePayload = MarkAnalysisJobFailedParams;

type MarkAnalysisJobFailedCallableResponse = {
  ok: boolean;
  jobId: string;
};

export async function createPendingAnalysisJob({
  songId,
}: CreatePendingAnalysisJobParams): Promise<{
  jobId: string;
  recordingId: string;
}> {
  const callable = httpsCallable<
    CreatePendingAnalysisJobCallablePayload,
    CreatePendingAnalysisJobCallableResponse
  >(functions, "createPendingAnalysisJob");

  const response = await callable({
    songId,
  });

  return {
    jobId: response.data.jobId,
    recordingId: response.data.recordingId,
  };
}

export async function startAnalysisJob({
  jobId,
  recordingId,
  recordedAudioPath,
}: StartAnalysisJobParams): Promise<string> {
  const callable = httpsCallable<
    StartAnalysisJobCallablePayload,
    StartAnalysisJobCallableResponse
  >(functions, "startAnalysisJob");

  const response = await callable({
    jobId,
    recordingId,
    recordedAudioPath,
  });

  return response.data.jobId;
}

export async function markAnalysisJobFailed({
  jobId,
  errorCode,
  errorMessage,
}: MarkAnalysisJobFailedParams): Promise<string> {
  const callable = httpsCallable<
    MarkAnalysisJobFailedCallablePayload,
    MarkAnalysisJobFailedCallableResponse
  >(functions, "markAnalysisJobFailed");

  const response = await callable({
    jobId,
    errorCode,
    errorMessage,
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
        songTitle: data.songTitle,
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
    songTitle: data.songTitle,
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

export async function getCompletedAnalysisJobsByUser(
  userId: string,
  maxCount = 20,
): Promise<AnalysisJob[]> {
  const jobsRef = collection(db, "analysisJobs");

  const q = query(
    jobsRef,
    where("userId", "==", userId),
    where("status", "==", "completed"),
    orderBy("completedAt", "desc"),
    limit(maxCount),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      userId: data.userId,
      songId: data.songId,
      songTitle: data.songTitle,
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
  });
}
