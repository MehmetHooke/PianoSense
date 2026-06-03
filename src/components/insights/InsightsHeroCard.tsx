// src/components/insights/InsightsHeroCard.tsx

import { useAppTheme } from "@/src/theme/useTheme";
import type { InsightsSummary, WeakArea } from "@/src/utils/insights";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type InsightsHeroMode = "self" | "teacher";

type Props = {
  summary: InsightsSummary;
  mode?: InsightsHeroMode;
};

type StudentHeroContent = {
  title: string;
  description: string;
  badgeTitle: string;
  badgeDescription: string;
  badgeIcon: keyof typeof Ionicons.glyphMap;
};

function getStudentHeroContent(summary: InsightsSummary): StudentHeroContent {
  if (summary.totalAnalyses === 0) {
    return {
      title: "İlk çalışmanı birlikte keşfedelim",
      description:
        "Bir parçayı çaldıktan sonra güçlü yanların ve gelişim ipuçların burada görünecek. Hazır olduğunda küçük bir egzersizle başlayabilirsin.",
      badgeTitle: "Hazır Kaşif",
      badgeDescription: "İlk çalışma seni bekliyor",
      badgeIcon: "sparkles-outline",
    };
  }

  if (summary.averageScore >= 85) {
    return {
      title: "Harika bir çalışma çıkardın",
      description:
        "Dikkatin ve emeğin çok güzel görünüyor. Aynı özenle devam edersen parçaları daha rahat ve müzikal çalabilirsin.",
      badgeTitle: "Parlayan Performans",
      badgeDescription: "Çok güçlü ilerliyorsun",
      badgeIcon: "star-outline",
    };
  }

  if (summary.averageScore >= 75) {
    return {
      title: "Çok güzel ilerliyorsun",
      description:
        "Çalışmaların daha düzenli görünmeye başladı. Şimdi küçük detaylara dikkat ederek performansını daha da güçlendirebilirsin.",
      badgeTitle: "Odaklı Müzisyen",
      badgeDescription: "Detaylar güçleniyor",
      badgeIcon: "musical-notes-outline",
    };
  }

  if (summary.averageScore >= 60) {
    return {
      title: "İyi bir ilerleme var",
      description:
        "Genel olarak güzel bir yoldasın. Bir sonraki çalışmada küçük hataları sakin sakin düzeltmeye odaklanabilirsin.",
      badgeTitle: "Gelişim Yolunda",
      badgeDescription: "Emeklerin karşılık veriyor",
      badgeIcon: "trending-up-outline",
    };
  }

  if (summary.averageScore >= 40) {
    return {
      title: "Denemelerin işe yarıyor",
      description:
        "Bazı bölümler oturmaya başlamış. Yavaş tempoda tekrar ederek daha rahat ve kontrollü çalabilirsin.",
      badgeTitle: "Ritim Kaşifi",
      badgeDescription: "Tekrar ettikçe netleşiyor",
      badgeIcon: "compass-outline",
    };
  }

  return {
    title: "Güzel bir başlangıç yaptın",
    description:
      "Bu çalışma sana nereden başlayacağını gösteriyor. Bir sonraki denemede sadece küçük bir bölüme odaklanman yeterli.",
    badgeTitle: "Cesur Başlangıç",
    badgeDescription: "İlk adımlar çok değerli",
    badgeIcon: "rocket-outline",
  };
}

function getStudentFocusContent(weakestArea: WeakArea, totalAnalyses: number) {
  if (totalAnalyses === 0) {
    return {
      title: "Bugünkü odak",
      value: "İlk çalışmanı dene",
      iconName: "play-circle-outline" as const,
    };
  }

  switch (weakestArea) {
    case "timing":
      return {
        title: "Bugünkü odak",
        value: "Ritmi sakin takip et",
        iconName: "timer-outline" as const,
      };

    case "pitch":
      return {
        title: "Bugünkü odak",
        value: "Doğru notalara odaklan",
        iconName: "musical-note-outline" as const,
      };

    case "missed":
      return {
        title: "Bugünkü odak",
        value: "Küçük bölümlerle çalış",
        iconName: "grid-outline" as const,
      };

    case "extra":
      return {
        title: "Bugünkü odak",
        value: "Daha kontrollü çal",
        iconName: "hand-left-outline" as const,
      };

    case "none":
    default:
      return {
        title: "Bugünkü odak",
        value: "Dengeni koru",
        iconName: "checkmark-circle-outline" as const,
      };
  }
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

  if (isTeacherMode) {
    const title = getTeacherHeroTitle(summary);
    const description = getTeacherHeroDescription(summary);

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
            backgroundColor: colors.secondarySoft,
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

        <Text
          style={{
            color: colors.text,
            fontSize: 23,
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

        <LastActivityRow
          value={
            summary.totalAnalyses > 0 ? summary.lastActivityText ?? "-" : "-"
          }
          helper={
            summary.totalAnalyses > 0 ? "En son çalışma" : "Henüz çalışma yok"
          }
        />
      </View>
    );
  }

  const heroContent = getStudentHeroContent(summary);
  const focusContent = getStudentFocusContent(
    summary.weakestArea,
    summary.totalAnalyses,
  );

  return (
    <View
      style={{
        backgroundColor: colors.elevatedCard,
        borderRadius: 30,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="sparkles-outline"
            size={22}
            color={colors.primaryForeground}
          />
        </View>

        <View>
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontWeight: "900",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            Gelişim notu
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "700",
              marginTop: 2,
            }}
          >
            Bugünkü çalışma rehberin
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 25,
          fontWeight: "900",
          letterSpacing: -0.7,
          lineHeight: 31,
        }}
      >
        {heroContent.title}
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 21,
          marginTop: 9,
        }}
      >
        {heroContent.description}
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginTop: 18,
        }}
      >
        <StudentInfoBox
          title={focusContent.title}
          value={focusContent.value}
          iconName={focusContent.iconName}
          iconColor={colors.primary}
          iconBackgroundColor={colors.primarySoft}
        />

        <StudentInfoBox
          title="Gelişim rozeti"
          value={heroContent.badgeTitle}
          helper={heroContent.badgeDescription}
          iconName={heroContent.badgeIcon}
          iconColor={colors.warning}
          iconBackgroundColor={colors.warningSoft}
        />
      </View>
    </View>
  );
}

type StudentInfoBoxProps = {
  title: string;
  value: string;
  helper?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackgroundColor: string;
};

function StudentInfoBox({
  title,
  value,
  helper,
  iconName,
  iconColor,
  iconBackgroundColor,
}: StudentInfoBoxProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 13,
        borderWidth: 1,
        borderColor: colors.softBorder,
        minHeight: 118,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 14,
          backgroundColor: iconBackgroundColor,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 11,
          fontWeight: "900",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>

      <Text
        numberOfLines={2}
        style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: "900",
          lineHeight: 18,
          marginTop: 5,
        }}
      >
        {value}
      </Text>

      {helper ? (
        <Text
          numberOfLines={2}
          style={{
            color: colors.subtleText,
            fontSize: 11,
            fontWeight: "700",
            lineHeight: 15,
            marginTop: 4,
          }}
        >
          {helper}
        </Text>
      ) : null}
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