// src/services/songService.ts

import { db } from "@/src/services/firebase";
import type { Song } from "@/src/types/song";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

function mapSong(id: string, data: any): Song {
  return {
    id,
    title: data.title ?? "Egzersiz",
    description: data.description,
    order: typeof data.order === "number" ? data.order : undefined,

    bpm: typeof data.bpm === "number" ? data.bpm : undefined,
    durationSec:
      typeof data.durationSec === "number" ? data.durationSec : undefined,

    isActive: data.isActive ?? false,
    originalAudioPath: data.originalAudioPath ?? "",

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getActiveSongs(): Promise<Song[]> {
  const songsRef = collection(db, "songs");
  const q = query(songsRef, where("isActive", "==", true));

  const snapshot = await getDocs(q);

  const songs = snapshot.docs.map((docSnap) =>
    mapSong(docSnap.id, docSnap.data()),
  );

  return songs.sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.title.localeCompare(b.title);
  });
}

export async function getSongById(songId: string): Promise<Song | null> {
  const songRef = doc(db, "songs", songId);
  const snapshot = await getDoc(songRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapSong(snapshot.id, snapshot.data());
}
