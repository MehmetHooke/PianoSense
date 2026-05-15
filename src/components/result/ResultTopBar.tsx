// src/components/result/ResultTopBar.tsx

import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  colors: AppColors;
  onBackPress: () => void;
};

export function ResultTopBar({ colors, onBackPress }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <Pressable
        onPress={onBackPress}
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          borderRadius: 16,
          backgroundColor: pressed ? colors.surfacePressed : colors.card,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 1,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 1,
        })}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>

      <View
        style={{
          backgroundColor: colors.primarySoft,
          borderRadius: 999,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: colors.softBorder,
        }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 12,
            fontWeight: "900",

            letterSpacing: 0.6,
          }}
        >
          ANALİZ SONUCU
        </Text>
      </View>
    </View>
  );
}