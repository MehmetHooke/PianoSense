import type { AppColors } from "@/src/theme/colors";
import { alpha } from "@/src/utils/color";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { TeacherHomeStatBox } from "./TeacherHomeStatBox";

const teacherHomeHeroLightImage = require("@/src/assets/images/teacher/home/teacher-home-hero-light.png");
const teacherHomeHeroDarkImage = require("@/src/assets/images/teacher/home/teacher-home-hero-dark.png");

const teacherSummaryLightImage = require("@/src/assets/images/teacher/icons/teacher-summary-light.png");
const teacherSummaryDarkImage = require("@/src/assets/images/teacher/icons/teacher-summary-dark.png");

type Props = {
  colors: AppColors;
  theme: "light" | "dark";
  classCount: number;
  studentCount: number;
  analysisCount: number;
  averageScore: number | null;
};

export function TeacherHomeHeroCard({
  colors,
  theme,
  classCount,
  studentCount,
  analysisCount,
  averageScore,
}: Props) {
  const heroImage =
    theme === "dark" ? teacherHomeHeroDarkImage : teacherHomeHeroLightImage;

  const summaryImage =
    theme === "dark" ? teacherSummaryDarkImage : teacherSummaryLightImage;

  return (
    <View
      style={{
        marginTop: 24,
        backgroundColor: colors.card,
        borderRadius: 30,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -60,
          top: -44,
          width: 190,
          height: 190,
          borderRadius: 95,
          backgroundColor: alpha(colors.primary, 0.14),
        }}
      />

      <Image
        source={heroImage}
        contentFit="contain"
        transition={250}
        style={{
          position: "absolute",
          right: 0,
          top: 8,
          width: 148,
          height: 148,
          opacity: theme === "dark" ? 0.92 : 0.96,
        }}
      />

      <View style={{ paddingRight: 116 }}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: alpha(colors.primary, 0.18),
            overflow: "hidden",
          }}
        >
          <Image
            source={summaryImage}
            contentFit="contain"
            transition={200}
            style={{
              width: 56,
              height: 56,
            }}
          />
        </View>

        <Text
          style={{
            marginTop: 16,
            color: colors.text,
            fontSize: 22,
            fontWeight: "900",
            letterSpacing: -0.4,
          }}
        >
          Bugünkü Özet
        </Text>

        <Text
          style={{
            marginTop: 7,
            color: colors.mutedText,
            fontSize: 13,
            fontWeight: "700",
            lineHeight: 20,
          }}
        >
          Öğrencilerinin çalışma ve analiz durumlarını hızlıca kontrol et.
        </Text>
      </View>

      <View
        style={{
          marginTop: 20,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <TeacherHomeStatBox colors={colors} label="Sınıf" value={classCount} />
        <TeacherHomeStatBox
          colors={colors}
          label="Öğrenci"
          value={studentCount}
        />
        <TeacherHomeStatBox colors={colors} label="Analiz" value={analysisCount} />
      </View>

      <View
        style={{
          marginTop: 10,
          backgroundColor: colors.surface,
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.softBorder,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            Genel performans
          </Text>

          <Text
            style={{
              marginTop: 4,
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 17,
            }}
          >
            Takip edilen öğrencilerin son analiz ortalaması.
          </Text>
        </View>

        <Text
          style={{
            color: averageScore === null ? colors.subtleText : colors.primary,
            fontSize: 26,
            fontWeight: "900",
            letterSpacing: -0.7,
          }}
        >
          {averageScore === null ? "—" : `%${averageScore}`}
        </Text>
      </View>
    </View>
  );
}