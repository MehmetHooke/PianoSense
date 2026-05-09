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
  expectedNote: string;
  playedNote: string | null;
  expectedStart: number;
  playedStart: number | null;
  status: AnalysisResultItemStatus;
  timingOffsetMs?: number;
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

  items: AnalysisResultItem[];
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

  errorCode?: string;
  errorMessage?: string;

  result?: AnalysisResult;
};
