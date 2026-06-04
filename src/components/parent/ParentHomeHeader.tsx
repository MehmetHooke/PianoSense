import type { AppColors } from "@/src/theme/colors";
import { Text, View } from "react-native";

type Props = {
  colors: AppColors;
  parentName?: string;
};

export function ParentHomeHeader({ colors, parentName }: Props) {
  return (
    <View>
      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "800",
        }}
      >
        Veli Paneli
      </Text>

      <Text
        style={{
          marginTop: 6,
          color: colors.text,
          fontSize: 30,
          fontWeight: "900",
          letterSpacing: -0.8,
        }}
      >
        Merhaba <Text style={{color:colors.primary}}>{parentName || "Veli"}</Text>
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "700",
          lineHeight: 20,
        }}
      >
        Bugün çocuğunun piyano gelişimini birlikte takip edelim.
      </Text>
    </View>
  );
}