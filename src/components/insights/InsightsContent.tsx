// src/components/insights/InsightsContent.tsx

import { InsightsEmptyState } from "@/src/components/insights/InsightsEmptyState";
import { InsightsErrorState } from "@/src/components/insights/InsightsErrorState";
import { InsightsHeroCard } from "@/src/components/insights/InsightsHeroCard";
import { InsightsLoadingState } from "@/src/components/insights/InsightsLoadingState";
import { InsightsMetricGrid } from "@/src/components/insights/InsightsMetricGrid";
import { RecentAnalysisList } from "@/src/components/insights/RecentAnalysisList";
import { WeakAreaCard } from "@/src/components/insights/WeakAreaCard";
import { getCompletedAnalysisJobsByUser } from "@/src/services/analysisJobService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { calculateInsightsSummary } from "@/src/utils/insights";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

type Props = {
  targetUserId: string;
  mode?: "self" | "teacher";
  refreshToken?: number;
  onRefreshEnd?: () => void;
};

export function InsightsContent({
  targetUserId,
  mode = "self",
  refreshToken = 0,
  onRefreshEnd,
}: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const summary = useMemo(() => {
    return calculateInsightsSummary(jobs);
  }, [jobs]);

  const loadInsights = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!targetUserId) {
        setJobs([]);
        setLoading(false);
        onRefreshEnd?.();
        return;
      }

      try {
        if (!options?.silent) {
          setLoading(true);
        }

        setHasError(false);

        const completedJobs = await getCompletedAnalysisJobsByUser(
          targetUserId,
          30,
        );

        setJobs(completedJobs);
      } catch (error) {
        console.log("Load insights error:", error);
        setHasError(true);
      } finally {
        setLoading(false);
        onRefreshEnd?.();
      }
    },
    [targetUserId, onRefreshEnd],
  );

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights]),
  );

  useEffect(() => {
    if (refreshToken === 0) return;

    loadInsights({ silent: true });
  }, [refreshToken, loadInsights]);

  const handleOpenJob = (jobId: string) => {
    router.push(`/result/${jobId}`);
  };

  const handleStartPractice = () => {
    router.push("/practice");
  };

  const handleRetry = () => {
    loadInsights();
  };

  if (loading) {
    return <InsightsLoadingState />;
  }

  if (hasError) {
    return <InsightsErrorState onRetry={handleRetry} />;
  }

  if (jobs.length === 0) {
    return (
      <>
        <InsightsHeroCard summary={summary} />

        {mode === "self" ? (
          <InsightsEmptyState onStartPractice={handleStartPractice} />
        ) : (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 26,
              padding: 20,
              marginTop:32,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              Henüz analiz yok
            </Text>

            <Text
              style={{
                marginTop: 8,
                color: colors.mutedText,
                fontSize: 14,
                fontWeight: "600",
                lineHeight: 20,
              }}
            >
              Bu öğrenci henüz tamamlanmış bir analiz oluşturmadı.
            </Text>
          </View>
        )}
      </>
    );
  }

  return (
    <>
      <InsightsHeroCard summary={summary} mode={mode} />

      <InsightsMetricGrid summary={summary} />

      <WeakAreaCard weakestArea={summary.weakestArea} />

      <RecentAnalysisList jobs={jobs} onOpenJob={handleOpenJob} />
    </>
  );
}