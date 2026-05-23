// src/components/insights/InsightsHeroCard.tsx

import { useAppTheme } from "@/src/theme/useTheme";
import type { InsightsSummary } from "@/src/utils/insights";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type InsightsHeroMode = "self" | "teacher";

type Props = {
  summary: InsightsSummary;
  mode?: InsightsHeroMode;
};

function getStudentHeroTitle(summary: InsightsSummary) {
  if (summary.totalAnalyses === 0) {
    return "Gelişimini takip etmeye başla";
  }

  if (summary.averageScore >= 85) {
    return "Harika gidiyorsun";
  }

  if (summary.averageScore >= 65) {
    return "İyi bir ilerleme var";
  }

  return "Çalıştıkça netleşecek";
}

function getStudentHeroDescription(summary: InsightsSummary) {
  if (summary.totalAnalyses === 0) {
    return "İlk egzersiz analizinden sonra skorların, nota doğruluğun ve zamanlama gelişimin burada görünecek.";
  }

  return "Tamamlanan analizlerine göre genel performansını, güçlü yanlarını ve gelişim alanlarını buradan takip edebilirsin.";
}

function getTeacherHeroTitle(summary: InsightsSummary) {
  if (summary.totalAnalyses === 0) {
    return "Öğrenci henüz analiz yapmadı";
  }

  if (summary.averageScore >= 85) {
    return "Öğrenci güçlü ilerliyor";
  }

  if (summary.averageScore >= 65) {
    return "Öğrencide düzenli gelişim var";
  }

  return "Öğrencinin desteğe ihtiyacı olabilir";
}

function getTeacherHeroDescription(summary: InsightsSummary) {
  if (summary.totalAnalyses === 0) {
    return "Bu öğrencinin tamamlanmış analizleri burada görünecek. İlk analizden sonra genel performans özeti oluşacak.";
  }

  return "Tamamlanan analizlere göre öğrencinin genel çalışma durumunu ve gelişim yönünü buradan hızlıca okuyabilirsin.";
}

export function InsightsHeroCard({ summary, mode = "self" }: Props) {
  const { colors } = useAppTheme();

  const isTeacherMode = mode === "teacher";

  const title = isTeacherMode
    ? getTeacherHeroTitle(summary)
    : getStudentHeroTitle(summary);

  const description = isTeacherMode
    ? getTeacherHeroDescription(summary)
    : getStudentHeroDescription(summary);

  return (
    <View
      style={{
        backgroundColor: colors.elevatedCard,
        borderRadius: 28,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.softBorder,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -34,
          top: -34,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: isTeacherMode
            ? colors.secondarySoft
            : colors.primarySoft,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: 28,
          bottom: -42,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.glassBackground,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        }}
      />

      {!isTeacherMode ? (
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="analytics"
            size={24}
            color={colors.primaryForeground}
          />
        </View>
      ) : (
        <Text
          style={{
            color: colors.secondary,
            fontSize: 12,
            fontWeight: "900",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Öğrenci performans özeti
        </Text>
      )}

      <Text
        style={{
          color: colors.text,
          fontSize: isTeacherMode ? 23 : 25,
          fontWeight: "900",
          letterSpacing: -0.6,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 21,
          marginTop: 8,
          maxWidth: "94%",
        }}
      >
        {description}
      </Text>

      {isTeacherMode ? (
        <LastActivityRow
          value={summary.totalAnalyses > 0 ? summary.lastActivityText ?? "-" : "-"}
          helper={summary.totalAnalyses > 0 ? "En son çalışma" : "Henüz çalışma yok"}
        />
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 18,
          }}
        >
          <HeroChip
            iconName="pulse"
            label={
              summary.totalAnalyses > 0
                ? `%${summary.averageScore} genel skor`
                : "Henüz analiz yok"
            }
          />

          {summary.totalAnalyses > 0 ? (
            <HeroChip
              iconName="checkmark-circle"
              label={`${summary.totalAnalyses} analiz`}
              iconColor={colors.success}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

type LastActivityRowProps = {
  value: string;
  helper: string;
};

function LastActivityRow({ value, helper }: LastActivityRowProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        marginTop: 18,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.softBorder,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          flex: 1,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 14,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="time-outline" size={18} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            Son aktivite
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "700",
              marginTop: 2,
            }}
          >
            {helper}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={{
          color: colors.warning,
          fontSize: 16,
          fontWeight: "900",
          letterSpacing: -0.3,
          maxWidth: 120,
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

type HeroChipProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor?: string;
};

function HeroChip({ iconName, label, iconColor }: HeroChipProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.softBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Ionicons
        name={iconName}
        size={15}
        color={iconColor ?? colors.primary}
      />

      <Text
        style={{
          color: colors.text,
          fontSize: 12,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </View>
  );
}