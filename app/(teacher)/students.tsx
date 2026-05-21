import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function TeacherStudentsScreen() {
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
      <Text
        style={{
          color: colors.text,
          fontSize: 30,
          fontWeight: "900",
          letterSpacing: -0.8,
        }}
      >
        Öğrenciler
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
        Öğrenci kodu ile öğrencinin analiz geçmişine ulaş.
      </Text>

      <View
        style={{
          marginTop: 24,
          backgroundColor: colors.card,
          borderRadius: 26,
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
          Öğrenci kodu ile ara
        </Text>

        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <TextInput
            placeholder="Örn: A7K92Q"
            placeholderTextColor={colors.subtleText}
            autoCapitalize="characters"
            style={{
              flex: 1,
              height: 50,
              borderRadius: 18,
              paddingHorizontal: 16,
              backgroundColor: colors.surface,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.softBorder,
              fontSize: 15,
              fontWeight: "800",
            }}
          />

          <Pressable
            style={{
              width: 54,
              height: 50,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
            }}
          >
            <Ionicons name="search" size={22} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <Text
          style={{
            marginTop: 12,
            color: colors.mutedText,
            fontSize: 13,
            fontWeight: "600",
            lineHeight: 18,
          }}
        >
          MVP aşamasında kod ile öğrenci bulma akışını burada bağlayacağız.
        </Text>
      </View>

      <View
        style={{
          marginTop: 20,
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
          Öğrenci listesi boş
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
          Sınıfa katılan veya kod ile eklenen öğrenciler burada listelenecek.
        </Text>
      </View>
    </ScrollView>
  );
}