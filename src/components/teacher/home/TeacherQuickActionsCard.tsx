import type { AppColors } from "@/src/theme/colors";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageSource } from "expo-image";
import { Pressable, Text, View } from "react-native";

const quickClassLightImage = require("@/src/assets/images/teacher/icons/teacher-activity-class-light.png");
const quickClassDarkImage = require("@/src/assets/images/teacher/icons/teacher-activity-class-dark.png");

const quickStudentLightImage = require("@/src/assets/images/teacher/icons/teacher-activity-student-light.png");
const quickStudentDarkImage = require("@/src/assets/images/teacher/icons/teacher-activity-student-dark.png");

const quickPeopleLightImage = require("@/src/assets/images/teacher/icons/people-outline-light.png");
const quickPeopleDarkImage = require("@/src/assets/images/teacher/icons/people-outline-dark.png");

type QuickActionType = "class" | "student" | "people";

type QuickAction = {
  title: string;
  description: string;
  iconType: QuickActionType;
  onPress: () => void;
};

type Props = {
  colors: AppColors;
  theme: "light" | "dark";
  onCreateClass: () => void;
  onFollowStudent: () => void;
  onOpenStudents: () => void;
};

function getQuickActionImage(
  iconType: QuickActionType,
  theme: "light" | "dark",
): ImageSource {
  if (iconType === "class") {
    return theme === "dark" ? quickClassDarkImage : quickClassLightImage;
  }

  if (iconType === "student") {
    return theme === "dark" ? quickStudentDarkImage : quickStudentLightImage;
  }

  return theme === "dark" ? quickPeopleDarkImage : quickPeopleLightImage;
}

export function TeacherQuickActionsCard({
  colors,
  theme,
  onCreateClass,
  onFollowStudent,
  onOpenStudents,
}: Props) {
  const actions: QuickAction[] = [
    {
      title: "Sınıf oluştur",
      description: "Yeni katılım kodu üret.",
      iconType: "class",
      onPress: onCreateClass,
    },
    {
      title: "Öğrenci takip et",
      description: "Kod ile öğrenci ekle.",
      iconType: "student",
      onPress: onFollowStudent,
    },
    {
      title: "Öğrencileri gör",
      description: "Analiz geçmişlerine git.",
      iconType: "people",
      onPress: onOpenStudents,
    },
  ];

  return (
    <View
      style={{
        marginTop: 18,
        backgroundColor: colors.card,
        borderRadius: 26,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "900",
          letterSpacing: -0.2,
        }}
      >
        Hızlı işlemler
      </Text>

      <Text
        style={{
          marginTop: 6,
          color: colors.mutedText,
          fontSize: 13,
          fontWeight: "700",
          lineHeight: 19,
        }}
      >
        En sık kullanılan öğretmen akışlarını buradan başlat.
      </Text>

      <View style={{ marginTop: 16, gap: 10 }}>
        {actions.map((action) => {
          const actionImage = getQuickActionImage(action.iconType, theme);

          return (
            <Pressable
              key={action.title}
              onPress={action.onPress}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? colors.surfacePressed
                  : colors.surface,
                borderRadius: 20,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.softBorder,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.primarySoft,
                  borderWidth: 1,
                  borderColor: alpha(colors.primary, 0.18),
                  overflow: "hidden",
                }}
              >
                <Image
                  source={actionImage}
                  contentFit="contain"
                  transition={200}
                  style={{
                    width: 48,
                    height: 48,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "900",
                  }}
                >
                  {action.title}
                </Text>

                <Text
                  style={{
                    marginTop: 3,
                    color: colors.mutedText,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {action.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.subtleText}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}