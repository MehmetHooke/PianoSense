import { auth } from "@/src/services/firebase";
import { seedDefaultSongs } from "@/src/services/songService";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
  
  const { colors, theme, toggleTheme } = useAppTheme();
  const user = auth.currentUser;
  const userName = user?.displayName || "PianoSense Kullanıcısı";
  const userEmail = user?.email || "Giriş yapılmış hesap";

  const handleMockPress = (title: string) => {
    Alert.alert(title, "Bu alan şu an mock. Sonraki sprintte aktif edebiliriz.");
  };


  

  const handleLogout = () => {
    Alert.alert("Çıkış yap", "Oturumu kapatmak istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış yap",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("LOGOUT ERROR:", error);
            Alert.alert("Hata", "Çıkış yapılırken bir sorun oluştu.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ gap: 6, marginTop: 8 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 30,
            fontWeight: "900",
          }}
        >
          Ayarlar
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          Hesabını, uygulama tercihlerini ve oturum işlemlerini buradan yönet.
        </Text>
      </View>

      {/* Profile Card */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 28,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.softBorder ?? colors.border,
          gap: 16,
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
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="musical-notes" size={28} color={colors.primary} />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              {userName}
            </Text>

            <Text
              style={{
                color: colors.mutedText,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {userEmail}
            </Text>

            <View
              style={{
                alignSelf: "flex-start",
                marginTop: 6,
                backgroundColor: colors.primarySoft,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                MVP Demo Hesabı
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <SettingsSection title="Hesap">
        <SettingsRow
          icon="person-outline"
          title="Profil bilgileri"
          subtitle="Ad, e-posta ve hesap bilgileri"
          onPress={() => handleMockPress("Profil bilgileri")}
          colors={colors}
        />
        <SettingsRow
          icon="lock-closed-outline"
          title="Şifre değiştir"
          subtitle="Hesap güvenliği ayarları"
          onPress={() => handleMockPress("Şifre değiştir")}
          colors={colors}
        />
        <SettingsRow
          icon="mail-outline"
          title="E-posta doğrulama"
          subtitle="Hesap e-posta durumunu kontrol et"
          onPress={() => handleMockPress("E-posta doğrulama")}
          colors={colors}
          isLast
        />
      </SettingsSection>

      {/* App Preferences */}
      <SettingsSection title="Uygulama">
        <SettingsRow
          icon="color-palette-outline"
          title="Tema"
          subtitle={`Şu an: ${theme === "dark" ? "Koyu tema" : "Açık tema"}`}
          rightContent={
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => ({
                backgroundColor: colors.primarySoft,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                Değiştir
              </Text>
            </Pressable>
          }
          colors={colors}
        />

        <SettingsRow
          icon="language-outline"
          title="Dil"
          subtitle="Türkçe"
          onPress={() => handleMockPress("Dil")}
          colors={colors}
        />

        <SettingsRow
          icon="notifications-outline"
          title="Bildirimler"
          subtitle="Yakında eklenecek"
          onPress={() => handleMockPress("Bildirimler")}
          colors={colors}
          isLast
        />
      </SettingsSection>

      {/* Support / About */}
      <SettingsSection title="Destek & Hakkında">
        <SettingsRow
          icon="help-circle-outline"
          title="Yardım"
          subtitle="Sık sorulan sorular ve destek"
          onPress={() => handleMockPress("Yardım")}
          colors={colors}
        />
        <SettingsRow
          icon="document-text-outline"
          title="Gizlilik Politikası"
          subtitle="Uygulama veri kullanımı"
          onPress={() => handleMockPress("Gizlilik Politikası")}
          colors={colors}
        />
        <SettingsRow
          icon="information-circle-outline"
          title="Uygulama sürümü"
          subtitle="v0.1.0 MVP"
          onPress={() => handleMockPress("Uygulama sürümü")}
          colors={colors}
          isLast
        />
      </SettingsSection>

      {/* Logout */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.softBorder ?? colors.border,
        }}
      >
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            backgroundColor: colors.dangerSoft,
            borderRadius: 18,
            paddingVertical: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text
            style={{
              color: colors.danger,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            Çıkış yap
          </Text>
        </Pressable>

                <Pressable
          onPress={seedDefaultSongs}
          style={({ pressed }) => ({
            backgroundColor: colors.dangerSoft,
            borderRadius: 18,
            paddingVertical: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text
            style={{
              color: colors.danger,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            seed
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function SettingsSection({
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

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  rightContent,
  colors,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: pressed && onPress ? colors.primarySoft : colors.card,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.softBorder ?? colors.border,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: "800",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          {subtitle}
        </Text>
      </View>

      {rightContent ? (
        rightContent
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.subtleText} />
      )}
    </Pressable>
  );
}
