import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function TeacherClassesScreen() {
  const { colors } = useAppTheme();

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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 30,
              fontWeight: "900",
              letterSpacing: -0.8,
            }}
          >
            Sınıflar
          </Text>

          <Text
            style={{
              marginTop: 6,
              color: colors.mutedText,
              fontSize: 14,
              fontWeight: "600",
              lineHeight: 20,
            }}
          >
            Öğrencilerini sınıflara ayırarak takip et.
          </Text>
        </View>

        <Pressable
          style={{
            width: 48,
            height: 48,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.primary,
          }}
        >
          <Ionicons name="add" size={26} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 28,
          backgroundColor: colors.card,
          borderRadius: 26,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          Henüz sınıf yok
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
          İlk sınıfını oluşturduğunda burada katılım kodu, öğrenci listesi ve sınıf özeti görünecek.
        </Text>
      </View>
    </ScrollView>
  );
}