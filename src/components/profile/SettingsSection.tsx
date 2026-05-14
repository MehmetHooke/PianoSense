import { useAppTheme } from "@/src/theme/useTheme";
import { Text, View } from "react-native";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          color: colors.text,
          fontSize: 17,
          fontWeight: "900",
          paddingHorizontal: 2,
        }}
      >
        {title}
      </Text>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.softBorder ?? colors.border,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}