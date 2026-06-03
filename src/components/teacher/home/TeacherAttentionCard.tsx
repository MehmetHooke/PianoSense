import type { AppColors } from "@/src/theme/colors";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  colors: AppColors;
  followedStudentCount: number;
  thisWeekAnalysisCount: number;
};

export function TeacherAttentionCard({
  colors,
  followedStudentCount,
  thisWeekAnalysisCount,
}: Props) {
  const hasStudents = followedStudentCount > 0;
  const hasWeeklyAnalysis = thisWeekAnalysisCount > 0;

  let title = "Her şey hazır";
  let description =
    "Öğrenciler analiz yaptıkça burada dikkat etmen gereken durumları göstereceğiz.";
  let iconName: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";
  let iconColor = colors.success;
  let iconBackground = colors.successSoft;

  if (!hasStudents) {
    title = "İlk öğrencini ekle";
    description =
      "Öğrenci kodu ile takip listeni oluşturunca analiz özetleri burada anlamlı hale gelecek.";
    iconName = "person-add-outline";
    iconColor = colors.primary;
    iconBackground = colors.primarySoft;
  } else if (!hasWeeklyAnalysis) {
    title = "Bu hafta analiz yok";
    description =
      "Takip ettiğin öğrenciler bu hafta henüz yeni bir çalışma sonucu oluşturmadı.";
    iconName = "time-outline";
    iconColor = colors.warning;
    iconBackground = colors.warningSoft;
  }

  return (
    <View
      style={{
        marginTop: 18,
        backgroundColor: colors.card,
        borderRadius: 26,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 18,
          backgroundColor: iconBackground,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: alpha(iconColor, 0.2),
        }}
      >
        <Ionicons name={iconName} size={23} color={iconColor} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 5,
            color: colors.mutedText,
            fontSize: 12,
            fontWeight: "700",
            lineHeight: 18,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}