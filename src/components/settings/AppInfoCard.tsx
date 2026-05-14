import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function AppInfoCard() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 13,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 17,
            backgroundColor: colors.infoSoft,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.softBorder,
          }}
        >
          <Ionicons
            name="information-circle"
            size={23}
            color={colors.infoForeground}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            PianoSense
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              lineHeight: 20,
              marginTop: 6,
            }}
          >
            Kısa piyano egzersizlerini analiz ederek nota doğruluğunu ve
            zamanlama performansını takip etmene yardımcı olur.
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 13,
            }}
          >
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                MVP
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: colors.successSoft,
              }}
            >
              <Text
                style={{
                  color: colors.successForeground,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                Analiz sistemi aktif
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}