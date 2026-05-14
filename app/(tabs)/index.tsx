import { HomeHeroCard } from "@/src/components/home/HomeHeroCard";
import { HomeLastResultCard } from "@/src/components/home/HomeLastResultCard";
import { HomeStatsRow } from "@/src/components/home/HomeStatsRow";
import { useAppTheme } from "@/src/theme/useTheme";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const stats = {
    totalAnalyses: 0,
    averageScore: null as number | null,
    bestScore: null as number | null,
  };

  const lastResult = null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 40,
          paddingBottom: 130,
        }}
      >
        <HomeHeroCard
          onStartPractice={() => {
            router.push("/(tabs)/practice");
          }}
        />

        <HomeStatsRow
          totalAnalyses={stats.totalAnalyses}
          averageScore={stats.averageScore}
          bestScore={stats.bestScore}
          onPress={() => {
            router.push("/(tabs)/insights");
          }}
        />

        <HomeLastResultCard
          result={lastResult}
          onOpenResult={(jobId) => {
            router.push(`/result/${jobId}`);
          }}
          onStartPractice={() => {
            router.push("/(tabs)/practice");
          }}
        />
      </ScrollView>
    </View>
  );
}