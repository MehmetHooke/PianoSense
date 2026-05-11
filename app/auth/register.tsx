import { auth } from "@/src/services/firebase";
import { useAppTheme } from "@/src/theme/useTheme";
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

export default function RegisterScreen() {
  const { colors } = useAppTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      setErrorMessage("Kayıt oluşturulamadı. E-posta adresini kontrol edin.");
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
          justifyContent: "center",
        }}
      >
        <View style={{ gap: 24 }}>
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

          <View style={{ gap: 10 }}>
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
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 28,
              padding: 18,
              gap: 16,
              borderWidth: 1,
              borderColor: colors.softBorder,
            }}
          >
            <AuthInput
              label="Ad Soyad"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Mehmet Höke"
              colors={colors}
            />

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

            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "800",
                }}
              >
                Şifre
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
                <Ionicons name="lock-closed-outline" size={20} color={colors.mutedText} />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="En az 6 karakter"
                  placeholderTextColor={colors.subtleText}
                  secureTextEntry={secure}
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                />

                <Pressable onPress={() => setSecure((prev) => !prev)}>
                  <Ionicons
                    name={secure ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.mutedText}
                  />
                </Pressable>
              </View>
            </View>

            {errorMessage ? (
              <View
                style={{
                  backgroundColor: colors.dangerSoft,
                  borderRadius: 14,
                  padding: 12,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text
                  style={{
                    flex: 1,
                    color: colors.danger,
                    fontSize: 13,
                    fontWeight: "700",
                    lineHeight: 18,
                  }}
                >
                  {errorMessage}
                </Text>
              </View>
            ) : null}

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
          </View>

          <View
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
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
