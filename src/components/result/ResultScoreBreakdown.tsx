// src/components/result/ResultScoreBreakdown.tsx

import type { AppColors } from "@/src/theme/colors";
import type { AnalysisResult } from "@/src/types/analysisJob";
import {
    alpha,
    formatScore,
    getScoreColor,
    safeNumber,
} from "@/src/utils/resultUtils";
import { Text, View } from "react-native";

type Props = {
  result: AnalysisResult;
  colors: AppColors;
};

export function ResultScoreBreakdown({ result, colors }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
      }}
    >
      <ScoreMiniCard
        label="Nota doğruluğu"
        value={result.pitchScore}
        colors={colors}
      />

      <ScoreMiniCard
        label="Zamanlama"
        value={result.timingScore}
        colors={colors}
      />
    </View>
  );
}

function ScoreMiniCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: number;
  colors: AppColors;
}) {
  const score = safeNumber(value);
  const scoreColor = getScoreColor(score, colors);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
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
          color: colors.text,
          fontSize: 24,
          fontWeight: "900",
          marginTop: 6,
        }}
      >
        {formatScore(score)}
      </Text>

      <View
        style={{
          height: 7,
          borderRadius: 999,
          backgroundColor: colors.progressTrack,
          marginTop: 12,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.min(Math.max(score, 0), 100)}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: scoreColor,
          }}
        />
      </View>

      <View
        style={{
          marginTop: 10,
          alignSelf: "flex-start",
          backgroundColor: alpha(scoreColor, 0.13),
          borderRadius: 999,
          paddingVertical: 5,
          paddingHorizontal: 9,
        }}
      >
        <Text
          style={{
            color: scoreColor,
            fontSize: 11,
            fontWeight: "900",
          }}
        >
          {score >= 75 ? "Güçlü" : "Çalışılmalı"}
        </Text>
      </View>
    </View>
  );
}