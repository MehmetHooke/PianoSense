import { InsightsEmptyState } from "@/src/components/insights/InsightsEmptyState";
import { InsightsErrorState } from "@/src/components/insights/InsightsErrorState";
import { InsightsHeroCard } from "@/src/components/insights/InsightsHeroCard";
import { InsightsLoadingState } from "@/src/components/insights/InsightsLoadingState";
import { InsightsMetricGrid } from "@/src/components/insights/InsightsMetricGrid";
import { RecentAnalysisList } from "@/src/components/insights/RecentAnalysisList";
import { WeakAreaCard } from "@/src/components/insights/WeakAreaCard";
import { useAuth } from "@/src/context/AuthContext";
import { getCompletedAnalysisJobsByUser } from "@/src/services/analysisJobService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { calculateInsightsSummary } from "@/src/utils/insights";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

export default function InsightsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const summary = useMemo(() => {
    return calculateInsightsSummary(jobs);
  }, [jobs]);

  const loadInsights = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.uid) {
        setJobs([]);
        setLoading(false);
        return;
      }

      try {
        if (!options?.silent) {
          setLoading(true);
        }

        setHasError(false);

        const completedJobs = await getCompletedAnalysisJobsByUser(user.uid, 30);
        setJobs(completedJobs);
      } catch (error) {
        console.log("Load insights error:", error);
        setHasError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.uid],
  );

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights({ silent: true });
  };

  const handleOpenJob = (jobId: string) => {
    router.push(`/result/${jobId}`);
  };

  const handleStartPractice = () => {
    router.push("/practice");
  };

  const handleRetry = () => {
    loadInsights();
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingTop: 40,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.8,
          }}
        >
          Analizler
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 21,
            marginTop: 5,
          }}
        >
          Çalışmalarındaki skorları, nota doğruluğunu ve zamanlama gelişimini
          takip et.
        </Text>
      </View>

      {loading ? (
        <InsightsLoadingState />
      ) : hasError ? (
        <InsightsErrorState onRetry={handleRetry} />
      ) : jobs.length === 0 ? (
        <>
          <InsightsHeroCard summary={summary} />
          <InsightsEmptyState onStartPractice={handleStartPractice} />
        </>
      ) : (
        <>
          <InsightsHeroCard summary={summary} />

          <InsightsMetricGrid summary={summary} />

          <WeakAreaCard weakestArea={summary.weakestArea} />

          <RecentAnalysisList jobs={jobs} onOpenJob={handleOpenJob} />
        </>
      )}
    </ScrollView>
  );
}