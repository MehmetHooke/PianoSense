import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ThemeOption = {
  value: "light" | "dark";
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    title: "Açık tema",
    description: "Daha aydınlık ve sade görünüm.",
    icon: "sunny",
  },
  {
    value: "dark",
    title: "Koyu tema",
    description: "Düşük ışıkta daha rahat kullanım.",
    icon: "moon",
  },
];

export function ThemeSettingsCard() {
  const { colors, theme, setTheme } = useAppTheme();

  return (
    <View style={{ gap: 10 }}>
      {themeOptions.map((option) => {
        const selected = theme === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => setTheme(option.value)}
            style={({ pressed }) => ({
              backgroundColor: selected
                ? colors.primarySoft
                : colors.elevatedCard,
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: selected ? colors.primary : colors.softBorder,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: selected ? colors.primary : colors.card,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.softBorder,
              }}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={selected ? colors.primaryForeground : colors.primary}
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
                {option.title}
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 12,
                  fontWeight: "600",
                  lineHeight: 17,
                  marginTop: 3,
                }}
              >
                {option.description}
              </Text>
            </View>

            <Ionicons
              name={selected ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={selected ? colors.primary : colors.subtleText}
            />
          </Pressable>
        );
      })}
    </View>
  );
}