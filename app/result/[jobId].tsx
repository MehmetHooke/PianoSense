// app/result/[jobId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { ResultEmptyNotesCard } from "@/src/components/result/ResultEmptyNotesCard";
import { ResultHeroCard } from "@/src/components/result/ResultHeroCard";
import { ResultMetricGrid } from "@/src/components/result/ResultMetricGrid";
import { ResultNoteDetailItem } from "@/src/components/result/ResultNoteDetailItem";
import { ResultScoreBreakdown } from "@/src/components/result/ResultScoreBreakdown";
import { ResultStateView } from "@/src/components/result/ResultStateView";
import { ResultTopBar } from "@/src/components/result/ResultTopBar";
import { getAnalysisJobById } from "@/src/services/analysisJobService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { getMainFeedback } from "@/src/utils/resultUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function ResultScreen() {
  return (
    <AuthGate>
      <ResultScreenContent />
    </AuthGate>
  );
}

function ResultScreenContent() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/insights");
  }

  useEffect(() => {
    let mounted = true;

    async function loadResult() {
      try {
        setLoadError(false);

        if (!jobId) {
          setJob(null);
          return;
        }

        const foundJob = await getAnalysisJobById(jobId);

        if (!mounted) return;

        setJob(foundJob);
      } catch (error) {
        console.log("Load result error:", error);

        if (!mounted) return;

        setLoadError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      mounted = false;
    };
  }, [jobId]);

  const feedback = useMemo(() => {
    if (!job) return "";
    return getMainFeedback(job);
  }, [job]);

  if (loading) {
    return (
      <ResultStateView
        colors={colors}
        type="loading"
        title="Sonuç hazırlanıyor"
        description="Performans detayların yükleniyor. Birkaç saniye içinde sonucu göreceksin."
      />
    );
  }

  if (loadError) {
    return (
      <ResultStateView
        colors={colors}
        type="error"
        title="Sonuç yüklenemedi"
        description="Analiz sonucu alınırken bir sorun oluştu. Bağlantını kontrol edip tekrar deneyebilirsin."
        actionLabel="Geri dön"
        onActionPress={goBack}
      />
    );
  }

  if (!job || !job.result) {
    return (
      <ResultStateView
        colors={colors}
        type="empty"
        title="Sonuç bulunamadı"
        description="Analiz tamamlanmamış veya sonuç kaydedilememiş olabilir."
        actionLabel="Geri dön"
        onActionPress={goBack}
      />
    );
  }

  const result = job.result;
  const items = result.items ?? [];

  return (
    <FlatList
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 36,
      }}
      data={items}
      keyExtractor={(_, index) => `${job.id}-${index}`}
      ListHeaderComponent={
        <View>
          <ResultTopBar colors={colors} onBackPress={goBack} />

          <ResultHeroCard job={job} colors={colors} feedback={feedback} />

          <ResultScoreBreakdown result={result} colors={colors} />

          <ResultMetricGrid result={result} colors={colors} />

          <View
            style={{
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 21,
                  fontWeight: "900",
                  letterSpacing: -0.3,
                }}
              >
                Nota Detayları
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 13,
                  lineHeight: 19,
                  marginTop: 3,
                }}
              >
                Hangi notada ne olduğunu buradan takip edebilirsin.
              </Text>
            </View>

            <Text
              style={{
                color: colors.subtleText,
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              {items.length} kayıt
            </Text>
          </View>

          {items.length === 0 ? <ResultEmptyNotesCard colors={colors} /> : null}
        </View>
      }
      renderItem={({ item, index }) => (
        <ResultNoteDetailItem item={item} index={index} colors={colors} />
      )}
    />
  );
}