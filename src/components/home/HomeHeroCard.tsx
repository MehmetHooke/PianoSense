import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

type Props = {
  onStartPractice: () => void;
};

const heroImageLight = require("@/src/assets/images/home/hero-image-light.png");
const heroImageDark = require("@/src/assets/images/home/hero-image-dark.png");

export function HomeHeroCard({ onStartPractice }: Props) {
  const { colors, theme } = useAppTheme();

  const heroImage = theme === "dark" ? heroImageDark : heroImageLight;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 30,
        padding: 22,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
        overflow: "hidden",
        position: "relative",
        minHeight: 270,
      }}
    >
      <Image
        source={heroImage}
        resizeMode="contain"
        style={{
          position: "absolute",
          right: 4,
          top: 24,
          width: "69%",
          height: 200,
          opacity: 0.95,
          zIndex: 0,
        }}
      />

      <View
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            paddingVertical: 7,
            paddingHorizontal: 11,
            borderRadius: 999,
            backgroundColor: colors.primarySoft,
            borderWidth: 1,
            borderColor: colors.softBorder,
            marginBottom: 16,
            maxWidth: "78%",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name="analytics" size={14} color={colors.primary} />

          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontWeight: "900",
            }}
            numberOfLines={1}
          >
            Nota & zamanlama analizi
          </Text>
        </View>

        <View style={{ width: "72%" }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 28,
              lineHeight: 34,
              fontWeight: "900",
              letterSpacing: -0.7,
            }}
          >
            Çaldığını gör, hatanı fark et
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 15,
              lineHeight: 22,
              fontWeight: "600",
              marginTop: 10,
            }}
          >
            Kısa bir egzersiz seç, piyanoda çal ve doğru nota, kaçırılan nota ve
            zamanlama hatalarını anlaşılır şekilde gör.
          </Text>
        </View>

        <Pressable
          onPress={onStartPractice}
          style={({ pressed }) => ({
            marginTop: 24,
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            borderRadius: 18,
            paddingVertical: 15,
            paddingHorizontal: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: pressed ? 0.92 : 1,
            width: "100%",
          })}
        >
          <Ionicons name="play" size={18} color={colors.primaryForeground} />

          <Text
            style={{
              color: colors.primaryForeground,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            Çalışmaya başla
          </Text>
        </Pressable>
      </View>
    </View>
  );
}