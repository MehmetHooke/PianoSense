// src/services/audioUploadService.ts

import { auth, storage } from "@/src/services/firebase";

import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

import { getDownloadURL, getMetadata, ref } from "firebase/storage";

type UploadRecordingAudioParams = {
  userId: string;
  songId: string;
  localUri: string;
  recordingId?: string;
};

type UploadRecordingAudioResult = {
  recordingId: string;
  recordedAudioPath: string;
  downloadUrl: string;
};

export async function uploadRecordingAudio({
  userId,
  songId,
  localUri,
  recordingId: providedRecordingId,
}: UploadRecordingAudioParams): Promise<UploadRecordingAudioResult> {
  const recordingId = providedRecordingId ?? `${Date.now()}`;

  const localFile = new File(localUri);

  console.log("[AudioUpload] Local recording before upload", {
    uri: localUri,
    exists: localFile.exists,
    sizeBytes: localFile.size,
    sizeKB: localFile.size / 1024,
    type: localFile.type,
  });

  if (!localFile.exists) {
    throw new Error("Local recording file does not exist.");
  }

  if (localFile.size <= 0) {
    throw new Error("Local recording file is empty.");
  }

  /*
   * Firebase Storage path
   */
  const recordedAudioPath = `users/${userId}/songs/${songId}/recordings/${recordingId}.m4a`;

  /*
   * Firebase user token
   */
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Firebase user is not authenticated.");
  }

  const idToken = await currentUser.getIdToken();

  /*
   * Firebase Storage bucket
   */
  const bucket = storage.app.options.storageBucket;

  if (!bucket) {
    throw new Error("Firebase Storage bucket is not configured.");
  }

  /*
   * Firebase Storage REST media upload endpoint.
   *
   * name parametresine Storage'daki tam object path gider.
   */
  const uploadUrl =
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
      bucket,
    )}/o` +
    `?uploadType=media` +
    `&name=${encodeURIComponent(recordedAudioPath)}`;

  console.log("[AudioUpload] Native file upload starting", {
    recordedAudioPath,
    bucket,
    localFileSizeBytes: localFile.size,
  });

  /*
   * ÖNEMLİ:
   *
   * Blob yok
   * Base64 yok
   * ArrayBuffer yok
   * Uint8Array yok
   *
   * Expo File direkt native request body.
   */
  const response = await fetch(uploadUrl, {
    method: "POST",

    headers: {
      Authorization: `Firebase ${idToken}`,

      "Content-Type": "audio/mp4",
    },

    body: localFile,
  });

  const responseText = await response.text();

  console.log("[AudioUpload] Firebase REST response", {
    status: response.status,

    ok: response.ok,

    response: responseText,
  });

  if (!response.ok) {
    throw new Error(
      `Firebase Storage REST upload failed. HTTP ${response.status}: ${responseText}`,
    );
  }

  /*
   * Upload başarılı olduktan sonra
   * normal Firebase SDK ile metadata okuyabiliriz.
   *
   * Burada binary upload yapılmadığı için
   * uploadBytes problemine girmiyoruz.
   */
  const fileRef = ref(storage, recordedAudioPath);

  const metadata = await getMetadata(fileRef);

  console.log("[AudioUpload] Firebase upload completed", {
    localFileSizeBytes: localFile.size,

    firebaseSizeBytes: metadata.size,

    firebaseSizeKB: metadata.size / 1024,

    contentType: metadata.contentType,

    recordedAudioPath,
  });

  /*
   * Kritik doğrulama:
   * cihazdaki M4A ile Storage'daki object
   * byte byte aynı boyutta olmalı.
   */
  if (metadata.size !== localFile.size) {
    throw new Error(
      `Recording upload size mismatch. Local=${localFile.size}, Firebase=${metadata.size}`,
    );
  }

  const downloadUrl = await getDownloadURL(fileRef);

  return {
    recordingId,
    recordedAudioPath,
    downloadUrl,
  };
}
