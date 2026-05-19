// src/services/analysisSubmissionService.ts

import {
    createPendingAnalysisJob,
    markAnalysisJobFailed,
    startAnalysisJob,
} from "@/src/services/analysisJobService";
import { uploadRecordingAudio } from "@/src/services/audioUploadService";

type SubmitRecordingForAnalysisParams = {
  userId: string;
  songId: string;
  localUri: string;
};

type SubmitRecordingForAnalysisResult = {
  jobId: string;
  recordingId: string;
};

export async function submitRecordingForAnalysis({
  userId,
  songId,
  localUri,
}: SubmitRecordingForAnalysisParams): Promise<SubmitRecordingForAnalysisResult> {
  const { jobId, recordingId } = await createPendingAnalysisJob({
    songId,
  });

  runUploadAndStartAnalysisInBackground({
    userId,
    songId,
    localUri,
    jobId,
    recordingId,
  });

  return {
    jobId,
    recordingId,
  };
}

function runUploadAndStartAnalysisInBackground({
  userId,
  songId,
  localUri,
  jobId,
  recordingId,
}: {
  userId: string;
  songId: string;
  localUri: string;
  jobId: string;
  recordingId: string;
}) {
  void (async () => {
    try {
      const uploadResult = await uploadRecordingAudio({
        userId,
        songId,
        localUri,
        recordingId,
      });

      await startAnalysisJob({
        jobId,
        recordingId: uploadResult.recordingId,
        recordedAudioPath: uploadResult.recordedAudioPath,
      });
    } catch (error) {
      console.log("Analysis submission background error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Kayıt yüklenirken veya analiz başlatılırken bilinmeyen bir hata oluştu.";

      try {
        await markAnalysisJobFailed({
          jobId,
          errorCode: "CLIENT_SUBMISSION_FAILED",
          errorMessage: message,
        });
      } catch (markError) {
        console.log("Failed to mark analysis job failed:", markError);
      }
    }
  })();
}
