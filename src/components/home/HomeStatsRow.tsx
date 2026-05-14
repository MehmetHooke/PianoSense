import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { HomeMetricCard } from "./HomeMetricCard";

type Props = {
  totalAnalyses: number;
  averageScore: number | null;
  bestScore: number | null;
  onPress: () => void;
};

export function HomeStatsRow({
  totalAnalyses,
  averageScore,
  bestScore,
  onPress,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 22,
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            Performans özeti
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              marginTop: 2,
            }}
          >
            Detaylı analizleri görüntüle
          </Text>
        </View>

        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <HomeMetricCard
          label="Toplam analiz"
          value={String(totalAnalyses)}
          icon="analytics"
        />

        <HomeMetricCard
          label="Ortalama skor"
          value={averageScore === null ? "-" : `%${averageScore}`}
          icon="speedometer"
        />

        <HomeMetricCard
          label="En iyi skor"
          value={bestScore === null ? "-" : `%${bestScore}`}
          icon="trophy"
        />
      </View>
    </Pressable>
  );
}