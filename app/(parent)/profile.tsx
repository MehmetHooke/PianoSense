// app/(parent)/profile.tsx

import { ParentChildLinkCard } from "@/src/components/parent/ParentChildLinkCard";
import DeleteAccountInfoRow from "@/src/components/profile/DeleteAccountInfoRow";
import { AppInfoCard } from "@/src/components/settings/AppInfoCard";
import { ProfileImagePickerModal } from "@/src/components/settings/ProfileImagePickerModal";
import { ProfileSummaryCard } from "@/src/components/settings/ProfileSummaryCard";
import { SettingsSectionAccordion } from "@/src/components/settings/SettingsSectionAccordion";
import { ThemeSettingsCard } from "@/src/components/settings/ThemeSettingsCard";
import {
  DEFAULT_PROFILE_IMAGE_ID,
  getProfileImageSource,
} from "@/src/constants/profileImages";
import { useAuth } from "@/src/context/AuthContext";
import { useAppAlert } from "@/src/hooks/useAppAlert";
import { deleteMyAccount } from "@/src/services/accountService";
import { auth } from "@/src/services/firebase";
import {
  listenUserProfile,
  updateUserProfileImage,
} from "@/src/services/userProfileService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { ProfileImageId, UserProfile } from "@/src/types/userProfile";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const themeImage = require("@/src/assets/images/profile/solar-eclipse.png");

type ExpandedSetting =
  | "childLink"
  | "theme"
  | "deleteAccount"
  | null;

const settingsLayoutTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

export default function ParentProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ open?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { user } = useAuth();

  const { showAlert } = useAppAlert();
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const [expandedSetting, setExpandedSetting] =
    useState<ExpandedSetting>(null);

  useFocusEffect(
    useCallback(() => {
      if (params.open === "childLink") {
        setExpandedSetting("childLink");
      }
    }, [params.open]),
  );
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilePickerVisible, setProfilePickerVisible] = useState(false);
  const [profileImageSaving, setProfileImageSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }

    const unsubscribe = listenUserProfile(user.uid, setProfile, (error) => {
      console.log("USER PROFILE LISTEN ERROR:", error);
    });

    return unsubscribe;
  }, [user?.uid]);

  const selectedProfileImageId =
    profile?.profileImageId ?? DEFAULT_PROFILE_IMAGE_ID;

  const selectedProfileImageSource = useMemo(
    () => getProfileImageSource(selectedProfileImageId),
    [selectedProfileImageId],
  );

  const toggleSetting = (setting: Exclude<ExpandedSetting, null>) => {
    setExpandedSetting((prev) => (prev === setting ? null : setting));
  };

  const handleSelectProfileImage = async (profileImageId: ProfileImageId) => {
    if (!user?.uid) {
      return;
    }

    if (profileImageId === selectedProfileImageId) {
      setProfilePickerVisible(false);
      return;
    }

    try {
      setProfileImageSaving(true);

      await updateUserProfileImage({
        uid: user.uid,
        profileImageId,
      });

      setProfilePickerVisible(false);
    } catch (error) {
      console.log("UPDATE PROFILE IMAGE ERROR:", error);
      showAlert({
        type: "error",
        title: "Profil resmi değiştirilemedi",
        message: "Profil resmin kaydedilirken bir sorun oluştu. Lütfen tekrar dene.",
      });

    } finally {
      setProfileImageSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut(auth);
      router.replace("/auth/login");
    } catch (error) {
      console.log("Logout error:", error);

      showAlert({
        type: "error",
        title: "Çıkış yapılamadı",
        message: "Hesabından çıkış yapılırken bir sorun oluştu. Lütfen tekrar dene.",
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountLoading) {
      return;
    }

    try {
      setDeleteAccountLoading(true);

      await deleteMyAccount();

      await signOut(auth);

      router.replace("/auth/login");
    } catch (error: any) {
      console.log("DELETE ACCOUNT ERROR RAW:", error);
      console.log("DELETE ACCOUNT ERROR CODE:", error?.code);
      console.log("DELETE ACCOUNT ERROR MESSAGE:", error?.message);
      console.log("DELETE ACCOUNT ERROR DETAILS:", error?.details);

      showAlert({
        type: "error",
        title: "Hesap silinemedi",
        message:
          error?.details ||
          error?.message ||
          "Hesabın silinirken bir sorun oluştu. Lütfen tekrar dene.",
      });
    } finally {
      setDeleteAccountLoading(false);
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
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View layout={settingsLayoutTransition}>
          <Text
            style={{
              color: colors.text,
              fontSize: 30,
              fontWeight: "900",
              letterSpacing: 1.8,
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
            Hesap bilgilerini görüntüle, çocuk bağlantılarını yönet ve uygulama
            görünümünü kişiselleştir.
          </Text>
        </Animated.View>

        <Animated.View layout={settingsLayoutTransition}>
          <ProfileSummaryCard
            displayName={profile?.displayName ?? user?.displayName}
            email={profile?.email ?? user?.email}
            role="Veli"
            profileImageSource={selectedProfileImageSource}
            onAvatarPress={() => setProfilePickerVisible(true)}
          />
        </Animated.View>

        <SettingsSectionAccordion
          title="Çocuk bağlantısı"
          description="Öğrenci kodu ile çocuğunu veli paneline ekle."
          iconName="people-outline"
          iconColor={colors.primary}
          iconBackgroundColor={colors.primarySoft}
          iconBorderColor={alpha(colors.primary, 0.18)}
          expanded={expandedSetting === "childLink"}
          onPress={() => toggleSetting("childLink")}
          colors={colors}
        >
          <ParentChildLinkCard colors={colors} parentId={user?.uid} />
        </SettingsSectionAccordion>

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
          <SettingsSectionAccordion
            title="Hesabı Sil"
            description="Hesabını ve hesabına bağlı verileri kalıcı olarak sil."
            iconName="trash-outline"
            iconColor={colors.danger}
            iconBackgroundColor={colors.dangerSoft}
            iconBorderColor={alpha(colors.danger, 0.18)}
            expanded={expandedSetting === "deleteAccount"}
            onPress={() => toggleSetting("deleteAccount")}
            colors={colors}
          >
            <View
              style={{
                backgroundColor: colors.elevatedCard,
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: alpha(colors.danger, 0.18),
                gap: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 15,
                    backgroundColor: colors.dangerSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="warning-outline"
                    size={21}
                    color={colors.danger}
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
                    Hesabını kalıcı olarak sil
                  </Text>

                  <Text
                    style={{
                      color: colors.mutedText,
                      fontSize: 13,
                      fontWeight: "600",
                      lineHeight: 19,
                      marginTop: 5,
                    }}
                  >
                    Hesabını sildiğinde profil bilgilerin ve hesabına bağlı veli
                    bağlantıların kalıcı olarak silinir.
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: colors.softBorder,
                  gap: 8,
                }}
              >
                <DeleteAccountInfoRow
                  text="Çocuklarınla oluşturduğun takip bağlantıları kaldırılır."
                  colors={colors}
                />

                <DeleteAccountInfoRow
                  text="Çocukların hesapları ve analiz sonuçları silinmez."
                  colors={colors}
                />

                <DeleteAccountInfoRow
                  text="Hesabına ait varsa diğer kişisel veriler ve dosyalar silinir."
                  colors={colors}
                />

                <DeleteAccountInfoRow
                  text="Bu işlem geri alınamaz."
                  danger
                  colors={colors}
                />
              </View>

              <Pressable
                onPress={() => {
                  showAlert({
                    type: "error",
                    title: "Hesabını silmek istediğinden emin misin?",
                    message:
                      "Hesabın ve hesabına bağlı veriler kalıcı olarak silinecek. Çocuklarının hesapları silinmeyecek. Bu işlem geri alınamaz.",
                    primaryActionLabel: "Kalıcı Olarak Sil",
                    onPrimaryAction: () => {
                      void handleDeleteAccount();
                    },
                  });
                }}
                disabled={deleteAccountLoading}
                style={({ pressed }) => ({
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: colors.danger,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 9,
                  opacity: pressed || deleteAccountLoading ? 0.78 : 1,
                })}
              >
                {deleteAccountLoading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={colors.primaryForeground}
                    />

                    <Text
                      style={{
                        color: colors.primaryForeground,
                        fontSize: 14,
                        fontWeight: "900",
                      }}
                    >
                      Hesabımı Sil
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </SettingsSectionAccordion>
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

      <ProfileImagePickerModal
        visible={profilePickerVisible}
        selectedImageId={selectedProfileImageId}
        saving={profileImageSaving}
        onClose={() => {
          if (!profileImageSaving) {
            setProfilePickerVisible(false);
          }
        }}
        onSelect={handleSelectProfileImage}
      />
    </KeyboardAvoidingView>
  );
}