// src/components/result/ResultStateView.tsx

import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
  colors: AppColors;
  type: "loading" | "empty" | "error";
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ResultStateView({
  colors,
  type,
  title,
  description,
  actionLabel,
  onActionPress,
}: Props) {
  const iconName =
    type === "loading"
      ? "analytics-outline"
      : type === "error"
        ? "alert-circle-outline"
        : "document-text-outline";

  const iconColor = type === "error" ? colors.danger : colors.primary;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 26,
          backgroundColor: type === "error" ? colors.dangerSoft : colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: type === "error" ? colors.dangerSoft : colors.softBorder,
        }}
      >
        {type === "loading" ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Ionicons name={iconName} size={34} color={iconColor} />
        )}
      </View>

      <Text
        style={{
          marginTop: 18,
          fontSize: 24,
          fontWeight: "900",
          color: colors.text,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: colors.mutedText,
          lineHeight: 22,
          textAlign: "center",
          maxWidth: 320,
        }}
      >
        {description}
      </Text>

      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => ({
            marginTop: 24,
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            borderRadius: 18,
            paddingVertical: 14,
            paddingHorizontal: 18,
          })}
        >
          <Text style={{ color: colors.primaryForeground, fontWeight: "900" }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}