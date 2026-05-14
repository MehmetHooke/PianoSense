import type { InsightsSummary } from "@/src/utils/insights";
import { View } from "react-native";
import { InsightsMetricCard } from "./InsightsMetricCard";

type Props = {
  summary: InsightsSummary;
};

function formatPercent(value: number) {
  return `%${value}`;
}

export function InsightsMetricGrid({ summary }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 16,
      }}
    >
      <InsightsMetricCard
        title="Ortalama Skor"
        value={formatPercent(summary.averageScore)}
        description="Tüm tamamlanan analizlerin genel ortalaması"
        icon="stats-chart"
      />

      <InsightsMetricCard
        title="Nota Doğruluğu"
        value={formatPercent(summary.averagePitchScore)}
        description="Doğru nota çalma performansın"
        icon="musical-notes"
      />

      <InsightsMetricCard
        title="Zamanlama"
        value={formatPercent(summary.averageTimingScore)}
        description="Notalara doğru zamanda basma başarın"
        icon="timer"
      />

      <InsightsMetricCard
        title="Toplam Analiz"
        value={`${summary.totalAnalyses}`}
        description="Tamamlanan çalışma sayısı"
        icon="analytics"
      />
    </View>
  );
}