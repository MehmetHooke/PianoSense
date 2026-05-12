// src/services/songService.ts

import { db } from "@/src/services/firebase";
import type { Song, SongLevel } from "@/src/types/song";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

function mapSong(id: string, data: any): Song {
  return {
    id,
    title: data.title ?? "Untitled Song",
    description: data.description,
    level: data.level,
    order: data.order,
    durationSec: data.durationSec,
    noteCount: data.noteCount,
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

type SeedSong = {
  id: string;
  title: string;
  description: string;
  level: SongLevel;
  order: number;
  durationSec: number;
  noteCount: number;
  originalAudioPath: string;
};

const DEFAULT_SONGS: SeedSong[] = Array.from({ length: 20 }, (_, index) => {
  const number = index + 1;
  const padded = String(number).padStart(3, "0");
  const id = `song_${padded}`;

  return {
    id,
    title: `Egzersiz ${number}`,
    description: "Kısa tek melodi piyano egzersizi.",
    level: number <= 7 ? "beginner" : number <= 14 ? "easy" : "medium",
    order: number,
    durationSec: 10,
    noteCount: 4,
    originalAudioPath: `system/songs/${id}/original.wav`,
  };
});

export async function seedDefaultSongs() {
  const writes = DEFAULT_SONGS.map((song) => {
    const songRef = doc(db, "songs", song.id);

    return setDoc(
      songRef,
      {
        title: song.title,
        description: song.description,
        level: song.level,
        order: song.order,
        durationSec: song.durationSec,
        noteCount: song.noteCount,
        isActive: true,
        originalAudioPath: song.originalAudioPath,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  await Promise.all(writes);
}
