import { useAuth } from "@/src/context/AuthContext";
import { useAppTheme } from "@/src/theme/useTheme";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function ParentHomeScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  const parentName = user?.displayName || "Veli";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 22 }}>
        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "700",
          }}
        >
          Merhaba {parentName}
        </Text>

        <Text
          style={{
            color: colors.text,
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.8,
            marginTop: 4,
          }}
        >
          Çocuğunun gelişimi burada
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 21,
            marginTop: 8,
          }}
        >
          Çalışma düzenini, son analizlerini ve gelişim özetini sakin bir
          şekilde takip edebilirsin.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 30,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.softBorder,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 3,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 20,
            backgroundColor: alpha(colors.primary, 0.12),
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 22,
            fontWeight: "900",
            letterSpacing: -0.4,
          }}
        >
          Bu hafta düzenli bir başlangıç var
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 21,
            marginTop: 8,
          }}
        >
          Çocuğun bu hafta çalışmalarına devam ediyor. Zamanlama tarafında biraz
          daha tekrar iyi gelebilir.
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 20,
          }}
        >
          <SummaryPill
            colors={colors}
            iconName="musical-notes-outline"
            label="3 çalışma"
          />
          <SummaryPill
            colors={colors}
            iconName="time-outline"
            label="Son: Dün"
          />
        </View>
      </View>

      <View style={{ marginTop: 22 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "900",
            letterSpacing: -0.3,
            marginBottom: 12,
          }}
        >
          Kısa özet
        </Text>

        <View style={{ gap: 12 }}>
          <ParentInsightCard
            colors={colors}
            iconName="trending-up-outline"
            title="Gelişim yönü"
            description="Nota doğruluğunda küçük ama olumlu bir ilerleme var."
          />

          <ParentInsightCard
            colors={colors}
            iconName="timer-outline"
            title="Dikkat alanı"
            description="Bazı çalışmalarda ritme giriş biraz erken görünüyor."
          />

          <ParentInsightCard
            colors={colors}
            iconName="heart-outline"
            title="Destek önerisi"
            description="Kısa ve düzenli tekrarlar bu yaş grubu için daha etkili olur."
          />
        </View>
      </View>
    </ScrollView>
  );
}

type ParentCardColors = ReturnType<typeof useAppTheme>["colors"];

function SummaryPill({
  colors,
  iconName,
  label,
}: {
  colors: ParentCardColors;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.elevatedCard,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.softBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ionicons name={iconName} size={17} color={colors.primary} />
      <Text
        numberOfLines={1}
        style={{
          color: colors.text,
          fontSize: 12,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ParentInsightCard({
  colors,
  iconName,
  title,
  description,
}: {
  colors: ParentCardColors;
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.softBorder,
        flexDirection: "row",
        gap: 14,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: alpha(colors.primary, 0.1),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={iconName} size={21} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 13,
            fontWeight: "600",
            lineHeight: 19,
            marginTop: 4,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}