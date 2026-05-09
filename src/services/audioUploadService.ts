// src/services/audioUploadService.ts

import { storage } from "@/src/services/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

type UploadRecordingAudioParams = {
  userId: string;
  songId: string;
  localUri: string;
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
}: UploadRecordingAudioParams): Promise<UploadRecordingAudioResult> {
  const recordingId = `${Date.now()}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const recordedAudioPath = `users/${userId}/songs/${songId}/recordings/${recordingId}.m4a`;

  const fileRef = ref(storage, recordedAudioPath);

  await uploadBytes(fileRef, blob, {
    contentType: "audio/mp4",
  });

  const downloadUrl = await getDownloadURL(fileRef);

  return {
    recordingId,
    recordedAudioPath,
    downloadUrl,
  };
}
