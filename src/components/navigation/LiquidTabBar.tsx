import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/src/theme/useTheme";

type TabLayoutItem = {
  key: string;
  x: number;
  width: number;
};

function getTabIcon(routeName: string, focused: boolean) {
  switch (routeName) {
    case "index":
      return focused ? "home" : "home-outline";

    case "practice":
      return focused ? "musical-notes" : "musical-notes-outline";

    case "insights":
      return focused ? "analytics" : "analytics-outline";

    case "classes":
      return focused ? "people" : "people-outline";

    case "students":
      return focused ? "school" : "school-outline";

    case "profile":
      return focused ? "person" : "person-outline";

    default:
      return focused ? "ellipse" : "ellipse-outline";
  }
}

export function LiquidTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useAppTheme();

  const bottom = Math.max(insets.bottom, 12);
  const [tabLayouts, setTabLayouts] = useState<TabLayoutItem[]>([]);

  const x = useSharedValue(0);
  const w = useSharedValue(0);

  const visibleRoutes = useMemo(() => {
    return state.routes.filter((route) => {
      const options: any = descriptors[route.key]?.options;

      if (options?.href === null) return false;
      if (options?.tabBarItemStyle?.display === "none") return false;

      return true;
    });
  }, [state.routes, descriptors]);

  const focusedKey = state.routes[state.index]?.key;
  const isDark = theme === "dark";

  const SPRING = {
    damping: 28,
    stiffness: 210,
    mass: 0.85,
    overshootClamping: false,
    restDisplacementThreshold: 0.4,
    restSpeedThreshold: 0.4,
  };

  useEffect(() => {
    const layout = tabLayouts.find((item) => item.key === focusedKey);
    if (!layout) return;

    x.value = withSpring(layout.x, SPRING);
    w.value = withSpring(layout.width, SPRING);
  }, [focusedKey, tabLayouts, x, w]);

  const pillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }],
      width: w.value,
    };
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom,
        height: 72,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          height: 68,
          borderRadius: 28,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: colors.glassBackground,
          shadowColor: colors.glassShadow,
          shadowOpacity: 1,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
          elevation: 18,
        }}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 38 : 24}
          tint={isDark ? "dark" : "light"}
          style={{
            flex: 1,
            backgroundColor: colors.glassBackground,
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 8,
                  height: 52,
                  borderRadius: 22,
                  backgroundColor: colors.tabPillBackground,
                  borderWidth: 1,
                  borderColor: colors.tabPillBorder,
                },
                pillStyle,
              ]}
            />

            {visibleRoutes.map((route) => {
              const { options } = descriptors[route.key];

              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name;

              const isFocused = focusedKey === route.key;
              const iconName = getTabIcon(route.name, isFocused);

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout;

                    setTabLayouts((prev) => {
                      const filtered = prev.filter(
                        (item) => item.key !== route.key
                      );

                      return [...filtered, { key: route.key, x, width }];
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons
                    name={iconName as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={isFocused ? colors.tabActive : colors.tabInactive}
                  />

                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 11,
                      fontWeight: isFocused ? "900" : "700",
                      color: isFocused ? colors.text : colors.tabInactive,
                    }}
                  >
                    {String(label)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}