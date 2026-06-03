import { useAuth } from "@/src/context/AuthContext";
import { auth } from "@/src/services/firebase";
import { useAppTheme } from "@/src/theme/useTheme";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ParentProfileScreen() {
  const { user } = useAuth();
  const { colors, theme, setTheme } = useAppTheme();

  const displayName = user?.displayName || "Veli hesabı";
  const email = user?.email || "E-posta bilgisi yok";

  async function handleLogout() {
    await signOut(auth);
  }

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
            color: colors.text,
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.8,
          }}
        >
          Profil
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
          Hesap ayarlarını ve çocuk bağlantılarını buradan yönetebilirsin.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 30,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.softBorder,
          marginBottom: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 22,
              backgroundColor: alpha(colors.primary, 0.12),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={27} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 19,
                fontWeight: "900",
                letterSpacing: -0.3,
              }}
            >
              {displayName}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                color: colors.mutedText,
                fontSize: 13,
                fontWeight: "700",
                marginTop: 4,
              }}
            >
              {email}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <SettingsCard
          colors={colors}
          iconName="person-add-outline"
          title="Çocuk bağlantısı ekle"
          description="Çocuğunun takip kodu ile bağlantı isteği gönder."
        />

        <SettingsCard
          colors={colors}
          iconName="people-outline"
          title="Bağlı çocuklar"
          description="Takip ettiğin çocukları ve bağlantı durumlarını gör."
        />

        <Pressable
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={({ pressed }) => ({
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 16,
            borderWidth: 1,
            borderColor: pressed ? colors.primary : colors.softBorder,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          })}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 17,
              backgroundColor: alpha(colors.primary, 0.1),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={theme === "dark" ? "moon-outline" : "sunny-outline"}
              size={22}
              color={colors.primary}
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
              Tema
            </Text>

            <Text
              style={{
                color: colors.mutedText,
                fontSize: 13,
                fontWeight: "600",
                lineHeight: 19,
                marginTop: 3,
              }}
            >
              Şu an {theme === "dark" ? "koyu" : "açık"} tema kullanılıyor.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color={colors.subtleText}
          />
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            backgroundColor: pressed
              ? alpha(colors.danger, 0.14)
              : alpha(colors.danger, 0.09),
            borderRadius: 24,
            padding: 16,
            borderWidth: 1,
            borderColor: alpha(colors.danger, 0.18),
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          })}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 17,
              backgroundColor: alpha(colors.danger, 0.12),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.danger,
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              Çıkış yap
            </Text>

            <Text
              style={{
                color: colors.mutedText,
                fontSize: 13,
                fontWeight: "600",
                lineHeight: 19,
                marginTop: 3,
              }}
            >
              Bu cihazdaki oturumu kapat.
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

type ParentProfileColors = ReturnType<typeof useAppTheme>["colors"];

function SettingsCard({
  colors,
  iconName,
  title,
  description,
}: {
  colors: ParentProfileColors;
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: pressed ? colors.primary : colors.softBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 17,
          backgroundColor: alpha(colors.primary, 0.1),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={iconName} size={22} color={colors.primary} />
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
            marginTop: 3,
          }}
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={colors.subtleText}
      />
    </Pressable>
  );
}