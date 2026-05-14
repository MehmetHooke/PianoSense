import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  searchQuery: string;
  onRetry: () => void;
  onClearSearch: () => void;
};

export function PracticeEmptyState({
  searchQuery,
  onRetry,
  onClearSearch,
}: Props) {
  const { colors } = useAppTheme();

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.softBorder,
        marginTop: 8,
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 18,
          backgroundColor: isSearching ? colors.infoSoft : colors.dangerSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Ionicons
          name={isSearching ? "search" : "alert-circle"}
          size={24}
          color={isSearching ? colors.info : colors.danger}
        />
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "900",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {isSearching ? "Sonuç bulunamadı" : "Egzersiz bulunamadı"}
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          lineHeight: 22,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        {isSearching
          ? "Aradığın kelimeyle eşleşen bir egzersiz yok."
          : "Şu anda aktif egzersiz görünmüyor. Biraz sonra tekrar dene."}
      </Text>

      <Pressable
        onPress={isSearching ? onClearSearch : onRetry}
        style={({ pressed }) => ({
          marginTop: 16,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          borderRadius: 16,
          paddingVertical: 13,
          alignItems: "center",
        })}
      >
        <Text
          style={{
            color: colors.primaryForeground,
            fontWeight: "900",
          }}
        >
          {isSearching ? "Aramayı temizle" : "Tekrar dene"}
        </Text>
      </Pressable>
    </View>
  );
}