import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

const practicePianoLight = require(
  "@/src/assets/images/practice/practice-piano-light.png"
);

const practicePianoDark = require(
  "@/src/assets/images/practice/practice-piano-dark.png"
);

export function PracticeHeroCard() {
  const { colors, theme } = useAppTheme();

  const pianoImage =
    theme === "dark" ? practicePianoDark : practicePianoLight;

  return (
    <View
      style={{
        position: "relative",
        minHeight: 250,
        backgroundColor: colors.card,
        borderRadius: 30,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.softBorder,
        overflow: "hidden",

        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      {/* Sol içerik */}
      <View
        style={{
          zIndex: 2,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="musical-notes"
            size={28}
            color={colors.primary}
          />
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "900",
            letterSpacing: -0.5,
          }}
        >
          Çalışmak istediğin egzersizi seç
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
          Önce orijinal melodiyi dinle, sonra kendi performansını kaydet ve
          analiz sonucunu gör.
        </Text>
      </View>

      {/* Background piano */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,

          width: "44%",
          maxWidth: 200,

          alignItems: "center",
          justifyContent: "center",

          zIndex: 0,
        }}
      >
        <View
          style={{
            position: "absolute",
            width: "78%",
            aspectRatio: 1,
            maxWidth: 145,
            borderRadius: 999,
            backgroundColor: colors.primarySoft,
            opacity: 0.55,
          }}
        />

        <Image
          source={pianoImage}
          style={{
            width: "100%",
            maxWidth: 185,
            aspectRatio: 1,
            opacity: 0.65,
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}