// src/services/storageService.ts

import { storage } from "@/src/services/firebase";
import { getDownloadURL, ref } from "firebase/storage";

export async function getStorageFileUrl(path: string): Promise<string> {
  if (!path) {
    throw new Error("Storage path is empty.");
  }

  const fileRef = ref(storage, path);
  return getDownloadURL(fileRef);
}
