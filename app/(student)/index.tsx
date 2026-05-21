import { HomeHeroCard } from "@/src/components/home/HomeHeroCard";
import { HomeLastResultCard } from "@/src/components/home/HomeLastResultCard";
import { HomeStatsRow } from "@/src/components/home/HomeStatsRow";
import { useAuth } from "@/src/context/AuthContext";
import { getCompletedAnalysisJobsByUser } from "@/src/services/analysisJobService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

function safeScore(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;

  return Math.round(value);
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.uid) {
        setJobs([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (!options?.silent) {
          setLoading(true);
        }

        const completedJobs = await getCompletedAnalysisJobsByUser(user.uid, 10);
        setJobs(completedJobs);
      } catch (error) {
        console.log("Load home data error:", error);
        setJobs([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.uid],
  );

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  const stats = useMemo(() => {
    const scores = jobs
      .map((job) => safeScore(job.result?.overallScore))
      .filter((score): score is number => score !== null);

    const totalAnalyses = jobs.length;

    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
        : null;

    const bestScore = scores.length > 0 ? Math.max(...scores) : null;

    return {
      totalAnalyses,
      averageScore,
      bestScore,
    };
  }, [jobs]);

  const lastResult = useMemo(() => {
    const lastJob = jobs[0];

    if (!lastJob?.result) {
      return null;
    }

    return {
      jobId: lastJob.id,
      exerciseTitle: lastJob.songTitle ?? "Piyano egzersizi",
      overallScore: Math.round(lastJob.result.overallScore),
      pitchScore: Math.round(lastJob.result.pitchScore),
      timingScore: Math.round(lastJob.result.timingScore),
    };
  }, [jobs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData({ silent: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 40,
          paddingBottom: 130,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <HomeHeroCard
          onStartPractice={() => {
            router.push("/(student)/practice");
          }}
        />

        <HomeStatsRow
          totalAnalyses={stats.totalAnalyses}
          averageScore={stats.averageScore}
          bestScore={stats.bestScore}
          onPress={() => {
            router.push("/(student)/insights");
          }}
        />

        <HomeLastResultCard
          result={lastResult}
          loading={loading}
          onOpenResult={(jobId) => {
            router.push(`/result/${jobId}`);
          }}
          onStartPractice={() => {
            router.push("/(student)/practice");
          }}
        />
      </ScrollView>
    </View>
  );
}