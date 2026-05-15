// src/components/result/ResultMetricGrid.tsx

import type { AppColors } from "@/src/theme/colors";
import type { AnalysisResult } from "@/src/types/analysisJob";
import { alpha } from "@/src/utils/resultUtils";
import { Text, View } from "react-native";

type Props = {
  result: AnalysisResult;
  colors: AppColors;
};

export function ResultMetricGrid({ result, colors }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 22,
      }}
    >
      <MetricCard
        label="Doğru"
        value={result.correctNotes}
        color={colors.correctNote}
        colors={colors}
      />
      <MetricCard
        label="Yanlış"
        value={result.wrongNotes}
        color={colors.wrongNote}
        colors={colors}
      />
      <MetricCard
        label="Kaçan"
        value={result.missedNotes}
        color={colors.missedNote}
        colors={colors}
      />
      <MetricCard
        label="Fazla"
        value={result.extraNotes}
        color={colors.extraNote}
        colors={colors}
      />
      <MetricCard
        label="Erken"
        value={result.timingEarlyNotes ?? 0}
        color={colors.timingEarly}
        colors={colors}
      />
      <MetricCard
        label="Geç"
        value={result.timingLateNotes ?? 0}
        color={colors.timingLate}
        colors={colors}
      />
    </View>
  );
}

function MetricCard({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: number;
  color: string;
  colors: AppColors;
}) {
  return (
    <View
      style={{
        width: "31%",
        minWidth: 96,
        flexGrow: 1,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 28,
          height: 5,
          borderRadius: 999,
          backgroundColor: alpha(color, 0.8),
          marginBottom: 10,
        }}
      />

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 12,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color,
          fontSize: 24,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}