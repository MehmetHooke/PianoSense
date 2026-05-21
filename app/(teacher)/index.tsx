import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function TeacherDashboardScreen() {
  const { colors } = useAppTheme();
  const { profile } = useUserProfile();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 60,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          color: colors.mutedText,
          fontSize: 14,
          fontWeight: "800",
        }}
      >
        Öğretmen Paneli
      </Text>

      <Text
        style={{
          marginTop: 6,
          color: colors.text,
          fontSize: 30,
          fontWeight: "900",
          letterSpacing: -0.8,
        }}
      >
        Merhaba {profile?.name ?? "Öğretmen"}
      </Text>

      <View
        style={{
          marginTop: 24,
          backgroundColor: colors.card,
          borderRadius: 28,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primarySoft,
            }}
          >
            <Ionicons name="analytics-outline" size={24} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              Bugünkü Özet
            </Text>

            <Text
              style={{
                marginTop: 4,
                color: colors.mutedText,
                fontSize: 13,
                fontWeight: "600",
                lineHeight: 19,
              }}
            >
              Öğrencilerinin çalışma ve analiz durumlarını buradan takip edeceksin.
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <StatBox label="Sınıf" value="0" />
          <StatBox label="Öğrenci" value="0" />
          <StatBox label="Analiz" value="0" />
        </View>
      </View>

      <View
        style={{
          marginTop: 18,
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          Hızlı işlemler
        </Text>

        <Text
          style={{
            marginTop: 8,
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 20,
          }}
        >
          Sınıf oluşturma ve öğrenci kodu ile arama akışını burada başlatacağız.
        </Text>
      </View>
    </ScrollView>
  );

  function StatBox({ label, value }: { label: string; value: string }) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 18,
          paddingVertical: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.softBorder,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 22,
            fontWeight: "900",
          }}
        >
          {value}
        </Text>

        <Text
          style={{
            marginTop: 4,
            color: colors.mutedText,
            fontSize: 12,
            fontWeight: "800",
          }}
        >
          {label}
        </Text>
      </View>
    );
  }
}