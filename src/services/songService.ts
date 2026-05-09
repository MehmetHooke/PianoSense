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

export async function getActiveSongs(): Promise<Song[]> {
  const songsRef = collection(db, "songs");

  const q = query(songsRef, where("isActive", "==", true));

  const snapshot = await getDocs(q);

  const songs: Song[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      title: data.title ?? "Untitled Song",
      isActive: data.isActive ?? false,
      originalAudioPath: data.originalAudioPath ?? "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });

  return songs.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getSongById(songId: string): Promise<Song | null> {
  const songRef = doc(db, "songs", songId);
  const snapshot = await getDoc(songRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: data.title ?? "Untitled Song",
    isActive: data.isActive ?? false,
    originalAudioPath: data.originalAudioPath ?? "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
