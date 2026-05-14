import type { AppAlertPayload, AppAlertType } from "@/src/context/AppAlertContext";
import type { AppColors } from "@/src/theme/colors";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  alert: (AppAlertPayload & { id: number }) | null;
  visible: boolean;
  onDismiss: () => void;
  onHidden: () => void;
};

type AlertTypeMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  softBackground: string;
  foreground: string;
};

function getTypeMeta(type: AppAlertType, colors: AppColors): AlertTypeMeta {
  switch (type) {
    case "success":
      return {
        icon: "checkmark-circle",
        accent: colors.success,
        softBackground: colors.successSoft,
        foreground: colors.successForeground,
      };

    case "error":
      return {
        icon: "close-circle",
        accent: colors.danger,
        softBackground: colors.dangerSoft,
        foreground: colors.dangerForeground,
      };

    case "warning":
      return {
        icon: "warning",
        accent: colors.warning,
        softBackground: colors.warningSoft,
        foreground: colors.warningForeground,
      };

    case "info":
    default:
      return {
        icon: "information-circle",
        accent: colors.info,
        softBackground: colors.infoSoft,
        foreground: colors.infoForeground,
      };
  }
}

export function AppAlert({ alert, visible, onDismiss, onHidden }: Props) {
  const { colors, theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-18)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!alert) {
      return;
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (visible) {
      opacity.setValue(0);
      translateY.setValue(-18);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -12,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }

      hideTimeoutRef.current = setTimeout(() => {
        onHidden();
      }, 10);
    });
  }, [alert, visible, onHidden, opacity, translateY]);

  const typeMeta = useMemo(
    () => (alert ? getTypeMeta(alert.type, colors) : null),
    [alert, colors]
  );

  if (!alert || !typeMeta) {
    return null;
  }

  const hasPrimaryAction = !!(
    alert.primaryActionLabel && alert.onPrimaryAction
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
          opacity,
          transform: [{ translateY }],
          zIndex: 9999,
          elevation: 9999,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.softBorder,
            borderWidth: 1,
            borderRadius: 22,
            padding: 14,
            shadowColor: colors.shadow,
            shadowOpacity: isDark ? 0.9 : 1,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: typeMeta.softBackground,
              }}
            >
              <Ionicons
                name={typeMeta.icon}
                size={23}
                color={typeMeta.accent}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: "900",
                }}
              >
                {alert.title}
              </Text>

              {alert.message ? (
                <Text
                  style={{
                    color: colors.mutedText,
                    fontSize: 13,
                    lineHeight: 19,
                    fontWeight: "600",
                    marginTop: 3,
                  }}
                >
                  {alert.message}
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 10,
                  marginTop: hasPrimaryAction ? 12 : 6,
                }}
              >
                {hasPrimaryAction ? (
                  <Pressable
                    onPress={() => {
                      alert.onPrimaryAction?.();
                      onDismiss();
                    }}
                    style={{
                      backgroundColor: typeMeta.accent,
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primaryForeground,
                        fontSize: 13,
                        fontWeight: "900",
                      }}
                    >
                      {alert.primaryActionLabel}
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={onDismiss}
                  hitSlop={8}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: typeMeta.accent,
                      fontSize: 13,
                      fontWeight: "900",
                    }}
                  >
                    Kapat
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}