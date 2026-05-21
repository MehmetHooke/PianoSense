// app/processing/[jobId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { ResultProcessingSkeleton } from "@/src/components/result/ResultProcessingSkeleton";
import { ResultStateView } from "@/src/components/result/ResultStateView";
import { listenAnalysisJob } from "@/src/services/analysisJobService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

const MIN_PROCESSING_SCREEN_MS = 1400;
const COMPLETED_ANIMATION_MS = 1250;

const completedAnimation = require("@/src/assets/animations/succes.json");

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

  const completedJobIdRef = useRef<string | null>(null);
  const hasNavigatedRef = useRef(false);
  const completedAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const navigateToResult = useCallback(
    (targetJobId: string) => {
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;

      router.replace({
        pathname: "/result/[jobId]",
        params: { jobId: targetJobId },
      });
    },
    [router]
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayPassed(true);
    }, MIN_PROCESSING_SCREEN_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!showCompletedAnimation) return;
    if (!minDelayPassed) return;
    if (!completedJobIdRef.current) return;
    if (hasNavigatedRef.current) return;

    if (completedAnimationTimerRef.current) {
      clearTimeout(completedAnimationTimerRef.current);
    }

    completedAnimationTimerRef.current = setTimeout(() => {
      if (!completedJobIdRef.current) return;
      navigateToResult(completedJobIdRef.current);
    }, COMPLETED_ANIMATION_MS);

    return () => {
      if (completedAnimationTimerRef.current) {
        clearTimeout(completedAnimationTimerRef.current);
        completedAnimationTimerRef.current = null;
      }
    };
  }, [showCompletedAnimation, minDelayPassed, navigateToResult]);

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
          setScreenError("Analiz işi bulunamadı.");
          return;
        }

        if (updatedJob.status === "completed") {
          completedJobIdRef.current = jobId;
          setShowCompletedAnimation(true);
          return;
        }

        if (updatedJob.status === "failed") {
          setShowCompletedAnimation(false);

          setFailedMessage(
            updatedJob.errorMessage ??
              "Analiz sırasında bir sorun oluştu. Daha sessiz bir ortamda tekrar kayıt almayı deneyebilirsin."
          );
        }
      },
      () => {
        setScreenError("Analiz durumu dinlenirken bir sorun oluştu.");
      }
    );

    return unsubscribe;
  }, [jobId]);

  useEffect(() => {
    return () => {
      if (completedAnimationTimerRef.current) {
        clearTimeout(completedAnimationTimerRef.current);
        completedAnimationTimerRef.current = null;
      }
    };
  }, []);

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