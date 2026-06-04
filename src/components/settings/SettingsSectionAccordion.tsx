// src\components\settings\SettingsSectionAccordion.tsx
import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  title: string;
  description: string;
  iconSource?: ImageSourcePropType;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackgroundColor: string;
  iconBorderColor: string;
  expanded: boolean;
  onPress: () => void;
  children: React.ReactNode;
  colors: any;
};

const accordionTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

export function SettingsSectionAccordion({
  title,
  description,
  iconSource,
  iconName,
  iconColor,
  iconBackgroundColor,
  iconBorderColor,
  expanded,
  onPress,
  children,
  colors,
}: Props) {
  return (
    <Animated.View
      layout={accordionTransition}
      style={{
        backgroundColor: colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: expanded ? colors.softBorder : colors.border,
        padding: 16,
        overflow: "hidden",
        shadowColor: colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 19,
            backgroundColor: iconBackgroundColor,
            borderWidth: 1,
            borderColor: iconBorderColor,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {iconSource ? (
            <Image
              source={iconSource}
              style={{
                width: 46,
                height: 46,
              }}
              resizeMode="contain"
            />
          ) : iconName ? (
            <Ionicons
              name={iconName}
              size={24}
              color={iconColor ?? colors.primary}
            />
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 17,
              fontWeight: "900",
              lineHeight: 23,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              lineHeight: 18,
              marginTop: 3,
            }}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>

        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            backgroundColor: expanded
              ? colors.primarySoft
              : colors.elevatedCard,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={17}
            color={expanded ? colors.primary : colors.mutedText}
          />
        </View>
      </Pressable>

      {expanded ? (
        <Animated.View
          layout={accordionTransition}
          style={{
            marginTop: 15,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: colors.softBorder,
          }}
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}