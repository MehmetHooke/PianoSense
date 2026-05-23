import { TeacherAttentionCard } from "@/src/components/teacher/home/TeacherAttentionCard";
import { TeacherHomeHeader } from "@/src/components/teacher/home/TeacherHomeHeader";
import { TeacherHomeHeroCard } from "@/src/components/teacher/home/TeacherHomeHeroCard";
import { TeacherQuickActionsCard } from "@/src/components/teacher/home/TeacherQuickActionsCard";
import { TeacherRecentActivityCard } from "@/src/components/teacher/home/TeacherRecentActivityCard";
import { useTeacherHomeData } from "@/src/components/teacher/home/useTeacherHomeData";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useAppTheme } from "@/src/theme/useTheme";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const { colors, theme } = useAppTheme();
  const { user, profile } = useUserProfile();

  const { stats, recentActivities, loading, error } = useTeacherHomeData(
    user?.uid,
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 60,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <TeacherHomeHeader colors={colors} teacherName={profile?.name} />

      {error ? (
        <View
          style={{
            marginTop: 18,
            backgroundColor: colors.dangerSoft,
            borderRadius: 20,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.danger,
          }}
        >
          <Text
            style={{
              color: colors.dangerForeground,
              fontSize: 13,
              fontWeight: "800",
              lineHeight: 18,
            }}
          >
            Öğretmen paneli verileri alınırken bir sorun oluştu.
          </Text>
        </View>
      ) : null}

      <TeacherHomeHeroCard
        colors={colors}
        classCount={stats.totalClassCount}
        studentCount={stats.totalClassStudentCount}
        analysisCount={stats.thisWeekAnalysisCount}
        averageScore={stats.averageScore}
        theme={theme}
      />

      {loading ? (
        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
          <Text
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            Panel verileri güncelleniyor...
          </Text>
        </View>
      ) : null}

      <TeacherQuickActionsCard
        colors={colors}
        theme={theme}
        onCreateClass={() => router.push("/(teacher)/classes")}
        onFollowStudent={() => router.push("/(teacher)/students")}
        onOpenStudents={() => router.push("/(teacher)/students")}
      />

      <TeacherRecentActivityCard
        colors={colors}
        theme={theme}
        activities={recentActivities}
      />

      <TeacherAttentionCard
        colors={colors}
        followedStudentCount={stats.followedStudentCount}
        thisWeekAnalysisCount={stats.thisWeekAnalysisCount}
      />
    </ScrollView>
  );
}