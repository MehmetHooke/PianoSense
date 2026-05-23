import type { AppColors } from "@/src/theme/colors";
import { Text, View } from "react-native";

type Props = {
  colors: AppColors;
  label: string;
  value: string | number;
};

export function TeacherHomeStatBox({ colors, label, value }: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.softBorder,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 22,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          marginTop: 4,
          color: colors.mutedText,
          fontSize: 11,
          fontWeight: "800",
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}