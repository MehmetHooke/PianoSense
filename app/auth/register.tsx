import { useAppAlert } from "@/src/hooks/useAppAlert";
import { auth } from "@/src/services/firebase";
import { createUserProfile } from "@/src/services/userProfileService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { UserRole } from "@/src/types/userProfile";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

const registerLayoutTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

const roleOptions: {
  value: UserRole;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "student",
    title: "Öğrenci",
    description: "Kendi piyano çalışmalarımı takip edeceğim.",
    icon: "school-outline",
  },
  {
    value: "teacher",
    title: "Öğretmen",
    description: "Öğrencilerimin performanslarını takip edeceğim.",
    icon: "people-outline",
  },
  {
    value: "parent",
    title: "Veli",
    description: "Çocuğumun çalışma sürecini takip edeceğim.",
    icon: "heart-outline",
  },
];

function getRoleLabel(role: UserRole | null) {
  if (!role) {
    return "Rolünü seç";
  }

  return roleOptions.find((option) => option.value === role)?.title ?? "Rolünü seç";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { showAlert } = useAppAlert();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleExpanded, setRoleExpanded] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [secure, setSecure] = useState(true);
  const [secureAgain, setSecureAgain] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedPasswordAgain = passwordAgain.trim();
    const displayName = `${trimmedName} ${trimmedSurname}`.trim();

    if (!trimmedName) {
      showAlert({
        type: "warning",
        title: "Ad gerekli",
        message: "Devam etmek için adını girmelisin.",
      });
      return;
    }

    if (!trimmedSurname) {
      showAlert({
        type: "warning",
        title: "Soyad gerekli",
        message: "Devam etmek için soyadını girmelisin.",
      });
      return;
    }

    if (!trimmedEmail) {
      showAlert({
        type: "warning",
        title: "E-posta gerekli",
        message: "Hesap oluşturmak için e-posta adresini girmelisin.",
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      showAlert({
        type: "warning",
        title: "E-posta geçersiz",
        message: "Lütfen geçerli bir e-posta adresi gir.",
      });
      return;
    }

    if (!trimmedPassword) {
      showAlert({
        type: "warning",
        title: "Şifre gerekli",
        message: "Devam etmek için bir şifre belirlemelisin.",
      });
      return;
    }

    if (trimmedPassword.length < 6) {
      showAlert({
        type: "warning",
        title: "Şifre çok kısa",
        message: "Şifre en az 6 karakter olmalı.",
      });
      return;
    }

    if (!trimmedPasswordAgain) {
      showAlert({
        type: "warning",
        title: "Şifre tekrar gerekli",
        message: "Şifreni doğrulamak için tekrar yazmalısın.",
      });
      return;
    }

    if (trimmedPassword !== trimmedPasswordAgain) {
      showAlert({
        type: "warning",
        title: "Şifreler eşleşmiyor",
        message: "Girdiğin iki şifre aynı olmalı.",
      });
      return;
    }

    if (!role) {
      showAlert({
        type: "warning",
        title: "Rol seçimi gerekli",
        message: "Devam etmek için Öğrenci, Öğretmen veya Veli rollerinden birini seçmelisin.",
      });
      return;
    }

    try {
      setLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword,
      );

      await updateProfile(credential.user, {
        displayName,
      });

      await createUserProfile({
        uid: credential.user.uid,
        name: trimmedName,
        surname: trimmedSurname,
        displayName,
        email: trimmedEmail,
        role,
      });

      showAlert({
        type: "success",
        title: "Hesap oluşturuldu",
        message: "Profilin başarıyla hazırlandı.",
      });
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      showAlert({
        type: "error",
        title: "Kayıt oluşturulamadı",
        message: "E-posta adresini kontrol et veya daha sonra tekrar dene.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          paddingTop:40,
          justifyContent: "center",
        }}
      >
        <Animated.View
          layout={registerLayoutTransition}
          style={{ gap: 24 }}
        >
          <Animated.View layout={registerLayoutTransition}>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.softBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
          </Animated.View>

          <Animated.View layout={registerLayoutTransition} style={{ gap: 10 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 30,
                fontWeight: "900",
              }}
            >
              Yeni hesap oluştur
            </Text>

            <Text
              style={{
                color: colors.mutedText,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Kısa melodileri kaydetmeye ve performans sonuçlarını takip etmeye
              başla.
            </Text>
          </Animated.View>

          <Animated.View
            layout={registerLayoutTransition}
            style={{
              backgroundColor: colors.card,
              borderRadius: 28,
              padding: 18,
              gap: 16,
              borderWidth: 1,
              borderColor: colors.softBorder,
            }}
          >
            <Animated.View layout={registerLayoutTransition}>
              <AuthInput
                label="Ad"
                icon="person-outline"
                value={name}
                onChangeText={setName}
                placeholder="Adını gir"
                autoCapitalize="words"
                colors={colors}
              />
            </Animated.View>

            <Animated.View layout={registerLayoutTransition}>
              <AuthInput
                label="Soyad"
                icon="person-outline"
                value={surname}
                onChangeText={setSurname}
                placeholder="Soyadını gir"
                autoCapitalize="words"
                colors={colors}
              />
            </Animated.View>

            <Animated.View layout={registerLayoutTransition}>
              <AuthInput
                label="E-posta"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                colors={colors}
              />
            </Animated.View>

            <Animated.View layout={registerLayoutTransition}>
              <PasswordInput
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                secure={secure}
                onToggleSecure={() => setSecure((prev) => !prev)}
                placeholder="En az 6 karakter"
                colors={colors}
              />
            </Animated.View>

            <Animated.View layout={registerLayoutTransition}>
              <PasswordInput
                label="Şifre tekrar"
                value={passwordAgain}
                onChangeText={setPasswordAgain}
                secure={secureAgain}
                onToggleSecure={() => setSecureAgain((prev) => !prev)}
                placeholder="Şifreni tekrar yaz"
                colors={colors}
              />
            </Animated.View>

            <Animated.View layout={registerLayoutTransition}>
              <RoleAccordion
                role={role}
                expanded={roleExpanded}
                onToggle={() => setRoleExpanded((prev) => !prev)}
                onSelect={(nextRole) => {
                  setRole(nextRole);
                  setRoleExpanded(false);
                }}
                colors={colors}
              />
            </Animated.View>

            <Animated.View layout={registerLayoutTransition}>
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                style={({ pressed }) => ({
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading ? 0.6 : pressed ? 0.88 : 1,
                  transform: [{ scale: pressed && !loading ? 0.99 : 1 }],
                })}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text
                    style={{
                      color: colors.primaryForeground,
                      fontSize: 16,
                      fontWeight: "900",
                    }}
                  >
                    Hesap oluştur
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </Animated.View>

          <Animated.View
            layout={registerLayoutTransition}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Text style={{ color: colors.mutedText, fontSize: 14 }}>
              Zaten hesabın var mı?
            </Text>

            <Pressable onPress={() => router.replace("/auth/login")}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Giriş yap
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleAccordion({
  role,
  expanded,
  onToggle,
  onSelect,
  colors,
}: {
  role: UserRole | null;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (role: UserRole) => void;
  colors: any;
}) {
  return (
    <Animated.View
      layout={registerLayoutTransition}
      style={{
        borderRadius: 20,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: expanded ? colors.primary : colors.border,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.86 : 1,
        })}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: alpha(colors.primary, 0.16),
          }}
        >
          <Ionicons name="people-outline" size={19} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            Rol
          </Text>

          <Text
            style={{
              color: role ? colors.mutedText : colors.subtleText,
              fontSize: 13,
              fontWeight: "700",
              marginTop: 2,
            }}
          >
            {getRoleLabel(role)}
          </Text>
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.mutedText}
        />
      </Pressable>

      {expanded ? (
        <Animated.View
          layout={registerLayoutTransition}
          style={{
            paddingHorizontal: 12,
            paddingBottom: 12,
            gap: 10,
          }}
        >
          {roleOptions.map((option) => {
            const selected = option.value === role;

            return (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={({ pressed }) => ({
                  borderRadius: 16,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: selected
                    ? alpha(colors.primary, 0.1)
                    : colors.card,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.softBorder,
                  opacity: pressed ? 0.86 : 1,
                })}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 13,
                    backgroundColor: selected
                      ? colors.primary
                      : colors.primarySoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={17}
                    color={selected ? colors.primaryForeground : colors.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: "900",
                    }}
                  >
                    {option.title}
                  </Text>

                  <Text
                    style={{
                      color: colors.mutedText,
                      fontSize: 12,
                      fontWeight: "600",
                      lineHeight: 17,
                      marginTop: 2,
                    }}
                  >
                    {option.description}
                  </Text>
                </View>

                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                ) : null}
              </Pressable>
            );
          })}

          <Text
            style={{
              color: colors.subtleText,
              fontSize: 11,
              fontWeight: "700",
              lineHeight: 16,
              marginTop: 2,
            }}
          >
            Rol seçimi kayıt sırasında bir kez yapılır ve sonradan
            değiştirilemez.
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function AuthInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  colors,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  colors: any;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>

      <View
        style={{
          height: 54,
          borderRadius: 16,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Ionicons name={icon} size={20} color={colors.mutedText} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.subtleText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 15,
            fontWeight: "600",
          }}
        />
      </View>
    </View>
  );
}

function PasswordInput({
  label,
  value,
  onChangeText,
  secure,
  onToggleSecure,
  placeholder,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secure: boolean;
  onToggleSecure: () => void;
  placeholder: string;
  colors: any;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>

      <View
        style={{
          height: 54,
          borderRadius: 16,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={colors.mutedText}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.subtleText}
          secureTextEntry={secure}
          autoCapitalize="none"
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 15,
            fontWeight: "600",
          }}
        />

        <Pressable onPress={onToggleSecure}>
          <Ionicons
            name={secure ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.mutedText}
          />
        </Pressable>
      </View>
    </View>
  );
}