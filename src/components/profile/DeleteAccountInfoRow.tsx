import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function DeleteAccountInfoRow({
  text,
  danger = false,
  colors,
}: {
  text: string;
  danger?: boolean;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 9,
      }}
    >
      <Ionicons
        name={danger ? "alert-circle-outline" : "checkmark-circle-outline"}
        size={17}
        color={danger ? colors.danger : colors.mutedText}
        style={{ marginTop: 1 }}
      />

      <Text
        style={{
          flex: 1,
          color: danger ? colors.danger : colors.mutedText,
          fontSize: 12,
          fontWeight: danger ? "800" : "600",
          lineHeight: 18,
        }}
      >
        {text}
      </Text>
    </View>
  );
}