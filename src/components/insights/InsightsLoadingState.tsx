import { useAppTheme } from "@/src/theme/useTheme";
import { ActivityIndicator, Text, View } from "react-native";

function LoadingBlock({
  height,
  width = "100%",
}: {
  height: number;
  width?: string | number;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius: 18,
        backgroundColor: colors.skeletonBase,
        borderWidth: 1,
        borderColor: colors.softBorder,
      }}
    />
  );
}

export function InsightsLoadingState() {
  const { colors } = useAppTheme();

  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          backgroundColor: colors.elevatedCard,
          borderRadius: 28,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.softBorder,
          minHeight: 178,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            backgroundColor: colors.skeletonBase,
            marginBottom: 18,
          }}
        />

        <LoadingBlock height={26} width="72%" />
        <View style={{ height: 10 }} />
        <LoadingBlock height={16} width="92%" />
        <View style={{ height: 8 }} />
        <LoadingBlock height={16} width="76%" />
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <LoadingBlock height={132} width="47%" />
        <LoadingBlock height={132} width="47%" />
        <LoadingBlock height={132} width="47%" />
        <LoadingBlock height={132} width="47%" />
      </View>

      <LoadingBlock height={112} />

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.softBorder,
          alignItems: "center",
          gap: 10,
        }}
      >
        <ActivityIndicator color={colors.primary} />

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          Analiz geçmişin hazırlanıyor...
        </Text>
      </View>
    </View>
  );
}