// app/(student)/profile.tsx

import { AppInfoCard } from "@/src/components/settings/AppInfoCard";
import { ProfileImagePickerModal } from "@/src/components/settings/ProfileImagePickerModal";
import { ProfileSummaryCard } from "@/src/components/settings/ProfileSummaryCard";
import { SettingsSectionAccordion } from "@/src/components/settings/SettingsSectionAccordion";
import { StudentCodeCard } from "@/src/components/settings/StudentCodeCard";
import { ThemeSettingsCard } from "@/src/components/settings/ThemeSettingsCard";
import {
  DEFAULT_PROFILE_IMAGE_ID,
  getProfileImageSource,
} from "@/src/constants/profileImages";
import { useAuth } from "@/src/context/AuthContext";
import { useAppAlert } from "@/src/hooks/useAppAlert";
import { joinClassByCode, listenStudentClasses } from "@/src/services/classroomService";
import { auth } from "@/src/services/firebase";
import {
  listenUserProfile,
  updateUserProfileImage,
} from "@/src/services/userProfileService";
import { useAppTheme } from "@/src/theme/useTheme";
import { StudentClass } from "@/src/types/classroom";
import type { ProfileImageId, UserProfile } from "@/src/types/userProfile";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const themeImage = require("@/src/assets/images/profile/solar-eclipse.png");

type ExpandedSetting = "studentCode" | "classes" | "theme" | null;

const settingsLayoutTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { showAlert } = useAppAlert();
  const [expandedSetting, setExpandedSetting] =
    useState<ExpandedSetting>(null);

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilePickerVisible, setProfilePickerVisible] = useState(false);
  const [profileImageSaving, setProfileImageSaving] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
  const [joiningClass, setJoiningClass] = useState(false);
  const [classJoinError, setClassJoinError] = useState("");


  const [studentClassesLoading, setStudentClassesLoading] = useState(true);
  const [studentClassesError, setStudentClassesError] = useState("");

  useEffect(() => {
    if (!user?.uid) return;

    setStudentClassesLoading(true);
    setStudentClassesError("");

    const unsubscribe = listenStudentClasses(
      user.uid,
      (classes) => {
        setStudentClasses(classes);
        setStudentClassesLoading(false);
      },
      (error) => {
        console.log("STUDENT CLASSES LISTEN ERROR:", error);
        setStudentClassesError("Sınıf bilgileri yüklenemedi.");
        setStudentClassesLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }

    const unsubscribe = listenUserProfile(
      user.uid,
      setProfile,
      (error) => {
        console.log("USER PROFILE LISTEN ERROR:", error);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setStudentClasses([]);
      return;
    }

    const unsubscribe = listenStudentClasses(
      user.uid,
      setStudentClasses,
      (error) => {
        console.log("STUDENT CLASSES LISTEN ERROR:", error);
        setClassJoinError("Sınıf listesi yüklenemedi.");
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  const selectedProfileImageId =
    profile?.profileImageId ?? DEFAULT_PROFILE_IMAGE_ID;

  const selectedProfileImageSource = useMemo(
    () => getProfileImageSource(selectedProfileImageId),
    [selectedProfileImageId],
  );

  const shownStudentCode = profile?.studentCode ?? "------";

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

  const handleJoinClass = async () => {
    if (!user?.uid || joiningClass) return;

    const code = joinCode.trim().toUpperCase();

    if (!code) {
      setClassJoinError("Lütfen sınıf kodu gir.");
      return;
    }

    try {
      setJoiningClass(true);
      setClassJoinError("");

      await joinClassByCode({
        studentId: user.uid,
        joinCode: code,
      });

      setJoinCode("");

      showAlert({
        type: "success",
        title: "Sınıfa katıldın",
        message: "Sınıf bağlantın başarıyla oluşturuldu.",
      });
    } catch (error: any) {
      console.log("JOIN CLASS ERROR:", error);
      setClassJoinError(error?.message ?? "Sınıfa katılma işlemi başarısız oldu.");
    } finally {
      setJoiningClass(false);
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
            Hesap bilgilerini görüntüle ve uygulama görünümünü kişiselleştir.
          </Text>
        </Animated.View>

        <Animated.View layout={settingsLayoutTransition}>
          <ProfileSummaryCard
            displayName={profile?.displayName ?? user?.displayName}
            email={profile?.email ?? user?.email}
            profileImageSource={selectedProfileImageSource}
            onAvatarPress={() => setProfilePickerVisible(true)}
          />
        </Animated.View>

        <SettingsSectionAccordion
          title="Öğrenci Kodu"
          description="Veli ve öğretmen bağlantıları için kullanılacak kısa takip kodunu görüntüle."
          iconName="id-card-outline"
          iconColor={colors.primary}
          iconBackgroundColor={colors.primarySoft}
          iconBorderColor={alpha(colors.primary, 0.18)}
          expanded={expandedSetting === "studentCode"}
          onPress={() => toggleSetting("studentCode")}
          colors={colors}
        >
          <StudentCodeCard studentCode={shownStudentCode} />
        </SettingsSectionAccordion>

        <SettingsSectionAccordion
          title="Sınıflarım"
          description="Öğretmeninin verdiği sınıf kodu ile sınıfa katıl."
          iconName="people-outline"
          iconColor={colors.primary}
          iconBackgroundColor={colors.primarySoft}
          iconBorderColor={alpha(colors.primary, 0.18)}
          expanded={expandedSetting === "classes"}
          onPress={() => toggleSetting("classes")}
          colors={colors}
        >
          <View>
            <View
              style={{
                backgroundColor: colors.elevatedCard,
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.softBorder,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Sınıfa katıl
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 12,
                  fontWeight: "600",
                  lineHeight: 18,
                  marginTop: 5,
                }}
              >
                Öğretmeninin verdiği katılım kodunu girerek sınıfa bağlanabilirsin.
              </Text>

              <View
                style={{
                  marginTop: 14,
                  flexDirection: "row",
                  gap: 10,
                }}
              >
                <TextInput
                  value={joinCode}
                  onChangeText={(value) => {
                    setJoinCode(value.toUpperCase());
                    setClassJoinError("");
                  }}
                  placeholder="Örn: A7K92Q"
                  placeholderTextColor={colors.subtleText}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 18,
                    paddingHorizontal: 16,
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.softBorder,
                    fontSize: 15,
                    fontWeight: "800",
                  }}
                />

                <Pressable
                  onPress={handleJoinClass}
                  disabled={joiningClass}
                  style={({ pressed }) => ({
                    minWidth: 54,
                    height: 50,
                    paddingHorizontal: 16,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.primary,
                    opacity: pressed || joiningClass ? 0.72 : 1,
                  })}
                >
                  {joiningClass ? (
                    <ActivityIndicator color={colors.primaryForeground} />
                  ) : (
                    <Ionicons
                      name="enter-outline"
                      size={22}
                      color={colors.primaryForeground}
                    />
                  )}
                </Pressable>
              </View>

              {classJoinError ? (
                <Text
                  style={{
                    marginTop: 12,
                    color: colors.danger ?? colors.text,
                    fontSize: 13,
                    fontWeight: "700",
                    lineHeight: 18,
                  }}
                >
                  {classJoinError}
                </Text>
              ) : null}
            </View>

            <View
              style={{
                marginTop: 14,
                gap: 10,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Bağlı olduğun sınıflar
              </Text>

              {studentClasses.length === 0 ? (
                <Text
                  style={{
                    color: colors.mutedText,
                    fontSize: 13,
                    fontWeight: "600",
                    lineHeight: 19,
                  }}
                >
                  Henüz bağlı olduğun sınıf yok.
                </Text>
              ) : (
                studentClasses.map((classItem) => (
                  <View
                    key={classItem.classId}
                    style={{
                      backgroundColor: colors.elevatedCard,
                      borderRadius: 18,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.softBorder,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 15,
                        backgroundColor: colors.primarySoft,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="school-outline"
                        size={20}
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
                        numberOfLines={1}
                      >
                        {classItem.className}
                      </Text>

                      <Text
                        style={{
                          color: colors.mutedText,
                          fontSize: 12,
                          fontWeight: "700",
                          marginTop: 3,
                        }}
                        numberOfLines={1}
                      >
                        Kod: {classItem.joinCode}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
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