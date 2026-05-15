// src/types/song.ts

import type { Timestamp } from "firebase/firestore";

export type Song = {
  id: string;
  title: string;
  description?: string;
  order?: number;

  bpm?: number;
  beatsBeforeRecording?: number;
  durationSec?: number;

  isActive: boolean;
  originalAudioPath: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
