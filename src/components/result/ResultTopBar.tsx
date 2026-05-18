// src/components/result/ResultTopBar.tsx

import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  colors: AppColors;
  onBackPress: () => void;
  label?: string;
};

export function ResultTopBar({
  colors,
  onBackPress,
  label = "ANALİZ SONUCU",
}: Props) {
  return (
    <View
      style={{
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        minHeight: 44,
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
          zIndex: 2,
        })}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 58,
        }}
      >
        <View
          style={{
            maxWidth: "100%",
            backgroundColor: colors.primarySoft,
            borderRadius: 999,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.softBorder,
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: "900",
              letterSpacing: 1,
            }}
          >
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}