// src/types/analysisJob.ts

import type { Timestamp } from "firebase/firestore";

export type AnalysisJobStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export type AnalysisResultItemStatus =
  | "correct"
  | "wrongNote"
  | "missed"
  | "extra"
  | "timingEarly"
  | "timingLate";

export type AnalysisResultItem = {
  expectedNote: string | null;
  playedNote: string | null;
  expectedStart: number | null;
  playedStart: number | null;
  status: AnalysisResultItemStatus;
  timingOffsetMs?: number | null;
};

export type AnalysisDebugNote = {
  note: string;
  midi: number;
  start: number;
  end: number;
  duration: number;
  confidence: number;
};

export type AnalysisResult = {
  overallScore: number;
  pitchScore: number;
  timingScore: number;

  totalNotes: number;
  correctNotes: number;
  wrongNotes: number;
  missedNotes: number;
  extraNotes: number;

  timingEarlyNotes?: number;
  timingLateNotes?: number;

  items: AnalysisResultItem[];

  debug?: {
    originalNotes?: AnalysisDebugNote[];
    recordedNotes?: AnalysisDebugNote[];
  };
};

export type AnalysisJob = {
  id: string;

  userId: string;
  songId: string;
  recordingId: string;

  originalAudioPath: string;
  recordedAudioPath: string;

  status: AnalysisJobStatus;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;

  errorCode?: string;
  errorMessage?: string;

  result?: AnalysisResult;
};
