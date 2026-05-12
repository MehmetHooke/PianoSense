// src/types/song.ts

import type { Timestamp } from "firebase/firestore";

export type SongLevel = "beginner" | "easy" | "medium" | "hard";

export type Song = {
  id: string;
  title: string;
  description?: string;
  level?: SongLevel;
  order?: number;
  durationSec?: number;
  noteCount?: number;

  isActive: boolean;
  originalAudioPath: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
