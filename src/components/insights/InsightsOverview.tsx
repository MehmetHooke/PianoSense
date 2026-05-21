// src/components/insights/InsightsOverview.tsx

import { RecentAnalysisList } from "@/src/components/insights/RecentAnalysisList";
import { listenCompletedAnalysisJobsByUserId } from "@/src/services/analysisJobService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  userId: string;
};

export function InsightsOverview({ userId }: Props) {
  const { colors } = useAppTheme();

  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setErrorMessage("");

    const unsubscribe = listenCompletedAnalysisJobsByUserId(
      userId,
      (nextJobs) => {
        setJobs(nextJobs);
        setLoading(false);
      },
      (error) => {
        console.log("INSIGHTS JOBS LISTEN ERROR:", error);
        setErrorMessage("Analiz geçmişi yüklenemedi.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const stats = useMemo(() => {
    const completedJobs = jobs.filter((job) => job.status === "completed");

    const totalScore = completedJobs.reduce((sum, job) => {
      return sum + (job.result?.overallScore ?? 0);
    }, 0);

    const averageScore =
      completedJobs.length > 0
        ? Math.round(totalScore / completedJobs.length)
        : 0;

    return {
      totalAnalysis: completedJobs.length,
      averageScore,
    };
  }, [jobs]);

  function openJob(jobId: string) {
    router.push({
      pathname: "/result/[jobId]",
      params: { jobId },
    });
  }

  if (loading) {
    return (
      <View
        style={{
          marginTop: 28,
          backgroundColor: colors.card,
          borderRadius: 26,
          padding: 22,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} />

        <Text
          style={{
            marginTop: 12,
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "700",
          }}
        >
          Analiz geçmişi yükleniyor...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View
        style={{
          marginTop: 28,
          backgroundColor: colors.card,
          borderRadius: 26,
          padding: 22,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          Bir sorun oluştu
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
          {errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View
        style={{
          marginTop: 24,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "800",
            }}
          >
            Ortalama
          </Text>

          <Text
            style={{
              marginTop: 8,
              color: colors.text,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: -0.6,
            }}
          >
            %{stats.averageScore}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "800",
            }}
          >
            Analiz
          </Text>

          <Text
            style={{
              marginTop: 8,
              color: colors.text,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: -0.6,
            }}
          >
            {stats.totalAnalysis}
          </Text>
        </View>
      </View>

      {jobs.length === 0 ? (
        <View
          style={{
            marginTop: 32,
            backgroundColor: colors.card,
            borderRadius: 26,
            padding: 22,
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
            Öğrenci analiz yaptığında sonuçlar burada görünecek.
          </Text>
        </View>
      ) : (
        <RecentAnalysisList jobs={jobs} onOpenJob={openJob} />
      )}
    </View>
  );
}