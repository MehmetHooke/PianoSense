import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  colors: AppColors;
};

export function RecordingReadyCard({ colors }: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.successSoft,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.success,
        marginBottom: 16,
        flexDirection: "row",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="checkmark" size={22} color={colors.success} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.successForeground,
            fontWeight: "900",
            marginBottom: 6,
            fontSize: 15,
          }}
        >
          Kayıt hazır
        </Text>

        <Text
          style={{
            color: colors.successForeground,
            lineHeight: 20,
            fontSize: 13,
          }}
        >
          Kaydın hazır. Şimdi analize göndererek orijinal melodiyle
          karşılaştırabilirsin.
        </Text>
      </View>
    </View>
  );
}