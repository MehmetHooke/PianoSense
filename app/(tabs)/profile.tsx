import { AppInfoCard } from "@/src/components/settings/AppInfoCard";
import { ProfileSummaryCard } from "@/src/components/settings/ProfileSummaryCard";
import { SettingsSectionAccordion } from "@/src/components/settings/SettingsSectionAccordion";
import { ThemeSettingsCard } from "@/src/components/settings/ThemeSettingsCard";
import { auth } from "@/src/services/firebase";
import { useAppTheme } from "@/src/theme/useTheme";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const themeImage = require("@/src/assets/images/profile/solar-eclipse.png");

type ExpandedSetting = "theme" | null;

const settingsLayoutTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const [expandedSetting, setExpandedSetting] =
    useState<ExpandedSetting>("theme");
  const [logoutLoading, setLogoutLoading] = useState(false);

  const user = auth.currentUser;

  const toggleSetting = (setting: Exclude<ExpandedSetting, null>) => {
    setExpandedSetting((prev) => (prev === setting ? null : setting));
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut(auth);
      router.replace("/auth/login");
    } catch (error) {
      console.log("Logout error:", error);

      Alert.alert(
        "Çıkış yapılamadı",
        "Hesabından çıkış yapılırken bir sorun oluştu. Lütfen tekrar dene.",
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 40,
          paddingBottom: Math.max(insets.bottom, 12) + 120,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View layout={settingsLayoutTransition}>
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
              marginTop: 5,
            }}
          >
            Hesap bilgilerini görüntüle ve uygulama görünümünü kişiselleştir.
          </Text>
        </Animated.View>

        <Animated.View layout={settingsLayoutTransition}>
          <ProfileSummaryCard
            displayName={user?.displayName}
            email={user?.email}
          />
        </Animated.View>

        <SettingsSectionAccordion
          title="Tema"
          description="Uygulama görünümünü açık veya koyu tema olarak değiştir."
          iconSource={themeImage}
          iconBackgroundColor={colors.primarySoft}
          iconBorderColor={alpha(colors.primary, 0.18)}
          expanded={expandedSetting === "theme"}
          onPress={() => toggleSetting("theme")}
          colors={colors}
        >
          <ThemeSettingsCard />
        </SettingsSectionAccordion>

        <Animated.View layout={settingsLayoutTransition}>
          <AppInfoCard />
        </Animated.View>

        <Animated.View layout={settingsLayoutTransition}>
          <Pressable
            onPress={handleLogout}
            disabled={logoutLoading}
            style={({ pressed }) => ({
              backgroundColor: colors.danger,
              borderRadius: 20,
              paddingVertical: 15,
              paddingHorizontal: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 9,
              opacity: pressed || logoutLoading ? 0.86 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
              shadowColor: colors.shadow,
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            })}
          >
            {logoutLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.primaryForeground}
                />

                <Text
                  style={{
                    color: colors.primaryForeground,
                    fontSize: 15,
                    fontWeight: "900",
                  }}
                >
                  Çıkış yap
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}