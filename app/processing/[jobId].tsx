// app/processing/[jobId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { ResultProcessingSkeleton } from "@/src/components/result/ResultProcessingSkeleton";
import { ResultStateView } from "@/src/components/result/ResultStateView";
import { listenAnalysisJob } from "@/src/services/analysisJobService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

const MIN_PROCESSING_SCREEN_MS = 2200;
const COMPLETED_ANIMATION_MS = 1250;

const completedAnimation = require("@/src/assets/animations/succes.json");

const processingCompleteSound = require("@/src/assets/sound/processingComplete.wav");

export default function ProcessingScreen() {
  return (
    <AuthGate>
      <ProcessingScreenContent />
    </AuthGate>
  );
}

function ProcessingScreenContent() {
  const router = useRouter();
  const { colors, theme } = useAppTheme();
  const params = useLocalSearchParams<{ jobId: string }>();

  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;

  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const [minDelayPassed, setMinDelayPassed] = useState(false);
  const [showCompletedAnimation, setShowCompletedAnimation] = useState(false);

  const [completedAnimationFinished, setCompletedAnimationFinished] =
    useState(false);

  const [completionSoundFinished, setCompletionSoundFinished] =
    useState(false);


  const completePlayer = useAudioPlayer(processingCompleteSound);

  const completePlayerStatus = useAudioPlayerStatus(completePlayer);

  const completedJobIdRef = useRef<string | null>(null);
  const hasNavigatedRef = useRef(false);
  const completionStartedRef = useRef(false);

  const completedAnimationTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const navigateToResult = useCallback(
    (targetJobId: string) => {
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;

      router.replace({
        pathname: "/result/[jobId]",
        params: { jobId: targetJobId },
      });
    },
    [router],
  );

  function goHome() {
    router.replace("/(student)");
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    goHome();
  }

  // ---------------------------------------------------------
  // Minimum processing screen duration
  // ---------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayPassed(true);
    }, MIN_PROCESSING_SCREEN_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // ---------------------------------------------------------
  // Prepare audio mode for completion sound
  // ---------------------------------------------------------

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
      shouldPlayInBackground: false,
      interruptionMode: "doNotMix",
    }).catch((error) => {
      console.log("[ProcessingScreen] Audio mode error:", error);
    });
  }, []);


  // ---------------------------------------------------------
  // Listen analysis job
  // ---------------------------------------------------------

  useEffect(() => {
    if (!jobId) {
      setScreenError("Analiz işi bilgisi bulunamadı.");
      return;
    }

    const unsubscribe = listenAnalysisJob(
      jobId,
      (updatedJob) => {
        setJob(updatedJob);

        if (!updatedJob) {
          try {

            completePlayer.pause();
          } catch {
            // Ignore audio cleanup errors.
          }

          setScreenError("Analiz işi bulunamadı.");
          return;
        }

        // ---------------------------------------------------
        // COMPLETED
        // ---------------------------------------------------

        if (updatedJob.status === "completed") {
          // Firestore aynı completed snapshot'ını tekrar gönderirse
          // completion sesini/animasyonunu tekrar başlatma.
          if (completionStartedRef.current) {
            return;
          }

          completionStartedRef.current = true;
          completedJobIdRef.current = jobId;

          console.log("[ProcessingScreen] Analysis completed", {
            jobId,
          });



          // Completion durumlarını sıfırla.
          setCompletedAnimationFinished(false);
          setCompletionSoundFinished(false);

          // Animasyonu göster.
          setShowCompletedAnimation(true);

          // Ardından çınlama sesini bir kez oynat.
          try {
            completePlayer.loop = false;
            completePlayer.seekTo(0);
            completePlayer.play();

            console.log("[ProcessingScreen] Completion sound started");
          } catch (error) {
            console.log(
              "[ProcessingScreen] Completion sound start error:",
              error,
            );

            // Ses herhangi bir nedenle başlayamazsa kullanıcıyı
            // processing ekranında sonsuza kadar tutma.
            setCompletionSoundFinished(true);
          }

          return;
        }

        // ---------------------------------------------------
        // FAILED
        // ---------------------------------------------------

        if (updatedJob.status === "failed") {
          try {

            completePlayer.pause();
            completePlayer.loop = false;
          } catch {
            // Ignore audio cleanup errors.
          }

          setShowCompletedAnimation(false);

          setFailedMessage(
            updatedJob.errorMessage ??
            "Analiz sırasında bir sorun oluştu. Daha sessiz bir ortamda tekrar kayıt almayı deneyebilirsin.",
          );
        }
      },
      () => {
        try {

          completePlayer.pause();
        } catch {
          // Ignore audio cleanup errors.
        }

        setScreenError("Analiz durumu dinlenirken bir sorun oluştu.");
      },
    );

    return unsubscribe;
  }, [jobId, completePlayer]);

  // ---------------------------------------------------------
  // Completion animation timer
  // Timer KALIYOR.
  // ---------------------------------------------------------

  useEffect(() => {
    if (!showCompletedAnimation) return;

    if (completedAnimationTimerRef.current) {
      clearTimeout(completedAnimationTimerRef.current);
    }

    completedAnimationTimerRef.current = setTimeout(() => {
      setCompletedAnimationFinished(true);

      console.log("[ProcessingScreen] Completion animation finished");
    }, COMPLETED_ANIMATION_MS);

    return () => {
      if (completedAnimationTimerRef.current) {
        clearTimeout(completedAnimationTimerRef.current);
        completedAnimationTimerRef.current = null;
      }
    };
  }, [showCompletedAnimation]);

  // ---------------------------------------------------------
  // Detect actual end of completion sound
  // ---------------------------------------------------------

  useEffect(() => {
    if (!completionStartedRef.current) return;
    if (!showCompletedAnimation) return;
    if (!completePlayerStatus.didJustFinish) return;

    console.log("[ProcessingScreen] Completion sound finished");

    setCompletionSoundFinished(true);
  }, [completePlayerStatus.didJustFinish, showCompletedAnimation]);

  // ---------------------------------------------------------
  // Navigate only when EVERYTHING is finished
  // ---------------------------------------------------------

  useEffect(() => {
    if (!minDelayPassed) return;
    if (!completedAnimationFinished) return;
    if (!completionSoundFinished) return;
    if (!completedJobIdRef.current) return;
    if (hasNavigatedRef.current) return;

    console.log("[ProcessingScreen] Ready to navigate to result", {
      jobId: completedJobIdRef.current,
    });

    navigateToResult(completedJobIdRef.current);
  }, [
    minDelayPassed,
    completedAnimationFinished,
    completionSoundFinished,
    navigateToResult,
  ]);


  useEffect(() => {
    return () => {
      if (completedAnimationTimerRef.current) {
        clearTimeout(completedAnimationTimerRef.current);
        completedAnimationTimerRef.current = null;
      }


      try {
        completePlayer.pause();
        completePlayer.loop = false;
      } catch {
        // Ignore cleanup audio errors.
      }
    };
  }, [completePlayer]);

  // ---------------------------------------------------------
  // Error states
  // ---------------------------------------------------------

  if (screenError) {
    return (
      <ResultStateView
        colors={colors}
        type="error"
        title="Analiz bulunamadı"
        description={screenError}
        actionLabel="Ana sayfaya dön"
        onActionPress={goHome}
      />
    );
  }

  if (failedMessage) {
    return (
      <ResultStateView
        colors={colors}
        type="error"
        title="Analiz başarısız oldu"
        description={failedMessage}
        actionLabel="Geri dön"
        onActionPress={goBack}
      />
    );
  }

  // ---------------------------------------------------------
  // Processing screen
  // ---------------------------------------------------------

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ResultProcessingSkeleton
        colors={colors}
        status={job?.status}
        isDark={theme === "dark"}
      />

      {showCompletedAnimation ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LottieView
            source={completedAnimation}
            autoPlay
            loop={false}
            style={{
              width: 140,
              height: 140,
            }}
          />
        </View>
      ) : null}
    </View>
  );
}