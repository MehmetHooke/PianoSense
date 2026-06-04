// src\components\insights\RecentAnalysisCard.tsx
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  job: AnalysisJob;
  index: number;
  onPress: () => void;
};

function formatDate(job: AnalysisJob) {
  const date =
    job.completedAt?.toDate?.() ??
    job.updatedAt?.toDate?.() ??
    job.createdAt?.toDate?.();

  if (!date) {
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getJobTitle(job: AnalysisJob) {
  if (job.songTitle?.trim()) {
    return job.songTitle.trim();
  }


  return "Analiz sonucu";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Çok iyi";
  if (score >= 65) return "İyi";
  if (score >= 45) return "Gelişiyor";
  return "Tekrar çalış";
}

function getScoreColor(score: number, colors: ReturnType<typeof useAppTheme>["colors"]) {
  if (score >= 85) return colors.scoreExcellent;
  if (score >= 65) return colors.scoreGood;
  if (score >= 45) return colors.scoreMedium;
  return colors.scoreWeak;
}

export function RecentAnalysisCard({ job, index, onPress }: Props) {
  const { colors } = useAppTheme();

  const score = job.result?.overallScore ?? 0;
  const pitchScore = job.result?.pitchScore ?? 0;
  const timingScore = job.result?.timingScore ?? 0;
  const scoreColor = getScoreColor(score, colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 15,
        borderWidth: 1,
        borderColor: colors.softBorder,
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        shadowColor: colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 19,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            {index + 1}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              fontWeight: "900",
            }}
            numberOfLines={1}
          >
            {getJobTitle(job)}
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "600",
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {formatDate(job)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 7,
              marginTop: 10,
            }}
          >
            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 11,
                  fontWeight: "800",
                }}
              >
                Nota %{pitchScore}
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: colors.infoSoft,
              }}
            >
              <Text
                style={{
                  color: colors.infoForeground,
                  fontSize: 11,
                  fontWeight: "800",
                }}
              >
                Zamanlama %{timingScore}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <View
            style={{
              minWidth: 58,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: colors.elevatedCard,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.softBorder,
            }}
          >
            <Text
              style={{
                color: scoreColor,
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              %{score}
            </Text>

            <Text
              style={{
                color: colors.mutedText,
                fontSize: 10,
                fontWeight: "800",
                marginTop: 2,
              }}
            >
              {getScoreLabel(score)}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.subtleText}
          />
        </View>
      </View>
    </Pressable>
  );
}