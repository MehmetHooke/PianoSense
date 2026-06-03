import type { AppColors } from "@/src/theme/colors";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageSource } from "expo-image";
import { Text, View } from "react-native";
import type { TeacherHomeActivity } from "./useTeacherHomeData";

const activityAnalysisLightImage = require("@/src/assets/images/teacher/icons/teacher-activity-analysis-light.png");
const activityAnalysisDarkImage = require("@/src/assets/images/teacher/icons/teacher-activity-analysis-dark.png");

const activityStudentLightImage = require("@/src/assets/images/teacher/icons/teacher-activity-student-light.png");
const activityStudentDarkImage = require("@/src/assets/images/teacher/icons/teacher-activity-student-dark.png");

const activityClassLightImage = require("@/src/assets/images/teacher/icons/teacher-activity-class-light.png");
const activityClassDarkImage = require("@/src/assets/images/teacher/icons/teacher-activity-class-dark.png");

type Props = {
  colors: AppColors;
  theme: "light" | "dark";
  activities: TeacherHomeActivity[];
};

function getActivityImage(
  type: TeacherHomeActivity["type"],
  theme: "light" | "dark",
): ImageSource {
  if (type === "analysis") {
    return theme === "dark" ? activityAnalysisDarkImage : activityAnalysisLightImage;
  }

  if (type === "student") {
    return theme === "dark" ? activityStudentDarkImage : activityStudentLightImage;
  }

  return theme === "dark" ? activityClassDarkImage : activityClassLightImage;
}

export function TeacherRecentActivityCard({
  colors,
  theme,
  activities,
}: Props) {
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
        Son hareketler
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
        Öğrencilerin çalıştıkça burada güncel aktiviteleri göreceksin.
      </Text>

      {activities.length === 0 ? (
        <View
          style={{
            marginTop: 16,
            backgroundColor: colors.surface,
            borderRadius: 22,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.softBorder,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 20,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: alpha(colors.primary, 0.18),
            }}
          >
            <Ionicons
              name="musical-notes-outline"
              size={24}
              color={colors.primary}
            />
          </View>

          <Text
            style={{
              marginTop: 12,
              color: colors.text,
              fontSize: 15,
              fontWeight: "900",
              textAlign: "center",
            }}
          >
            Henüz aktivite yok
          </Text>

          <Text
            style={{
              marginTop: 5,
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 18,
              textAlign: "center",
            }}
          >
            Öğrenciler analiz yaptıkça son çalışmalar burada listelenecek.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 16, gap: 10 }}>
          {activities.map((activity) => {
            const activityImage = getActivityImage(activity.type, theme);

            return (
              <View
                key={activity.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 20,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: colors.softBorder,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 17,
                    backgroundColor: colors.primarySoft,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: alpha(colors.primary, 0.18),
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={activityImage}
                    contentFit="contain"
                    transition={200}
                    style={{
                      width: 38,
                      height: 38,
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
                    numberOfLines={1}
                  >
                    {activity.title}
                  </Text>

                  <Text
                    style={{
                      marginTop: 3,
                      color: colors.mutedText,
                      fontSize: 12,
                      fontWeight: "700",
                      lineHeight: 17,
                    }}
                    numberOfLines={2}
                  >
                    {activity.description}
                  </Text>

                  {!!activity.dateText && (
                    <Text
                      style={{
                        marginTop: 4,
                        color: colors.subtleText,
                        fontSize: 11,
                        fontWeight: "800",
                      }}
                    >
                      {activity.dateText}
                    </Text>
                  )}
                </View>

                {typeof activity.score === "number" && (
                  <View
                    style={{
                      backgroundColor: colors.primarySoft,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderColor: alpha(colors.primary, 0.18),
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 12,
                        fontWeight: "900",
                      }}
                    >
                      %{activity.score}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}