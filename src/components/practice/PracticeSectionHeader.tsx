import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
  count: number;
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  onRefresh: () => void;
};

export function PracticeSectionHeader({
  count,
  loading,
  refreshing,
  searchQuery,
  onRefresh,
}: Props) {
  const { colors } = useAppTheme();

  const subtitle = loading
    ? "Yükleniyor..."
    : searchQuery
      ? `${count} sonuç bulundu`
      : `${count} aktif egzersiz`;

  return (
    <View
      style={{
        marginTop: 22,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "900",
          }}
        >
          Egzersizler
        </Text>

        <Text
          style={{
            color: colors.subtleText,
            fontSize: 13,
            fontWeight: "700",
            marginTop: 3,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <Pressable
        onPress={onRefresh}
        disabled={loading || refreshing}
        style={({ pressed }) => ({
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: pressed ? colors.surfacePressed : colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          opacity: loading || refreshing ? 0.55 : 1,
        })}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="refresh" size={20} color={colors.primary} />
        )}
      </Pressable>
    </View>
  );
}