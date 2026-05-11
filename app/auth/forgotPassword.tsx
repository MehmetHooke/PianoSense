import { auth } from "@/src/services/firebase";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
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

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Lütfen e-posta adresini yaz.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await sendPasswordResetEmail(auth, email.trim());

      setSuccessMessage(
        "Şifre sıfırlama bağlantısı e-posta adresine gönderildi."
      );
    } catch (error) {
      console.error("PASSWORD RESET ERROR:", error);
      setErrorMessage("Sıfırlama bağlantısı gönderilemedi. E-postayı kontrol et.");
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

          <View style={{ gap: 14, alignItems: "center" }}>
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 26,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.softBorder,
              }}
            >
              <Ionicons name="key-outline" size={34} color={colors.primary} />
            </View>

            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 30,
                  fontWeight: "900",
                  textAlign: "center",
                }}
              >
                Şifreni mi unuttun?
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 15,
                  lineHeight: 22,
                  textAlign: "center",
                }}
              >
                E-posta adresini yaz. Sana şifre sıfırlama bağlantısı gönderelim.
              </Text>
            </View>
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
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "800",
                }}
              >
                E-posta
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
                <Ionicons name="mail-outline" size={20} color={colors.mutedText} />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.subtleText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                />
              </View>
            </View>

            {errorMessage ? (
              <InfoBox
                text={errorMessage}
                icon="alert-circle-outline"
                backgroundColor={colors.dangerSoft}
                color={colors.danger}
              />
            ) : null}

            {successMessage ? (
              <InfoBox
                text={successMessage}
                icon="checkmark-circle-outline"
                backgroundColor={colors.successSoft}
                color={colors.success}
              />
            ) : null}

            <Pressable
              onPress={handleResetPassword}
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
                  Bağlantı gönder
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.replace("/auth/login")}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                Giriş ekranına dön
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoBox({
  text,
  icon,
  backgroundColor,
  color,
}: {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  color: string;
}) {
  return (
    <View
      style={{
        backgroundColor,
        borderRadius: 14,
        padding: 12,
        flexDirection: "row",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      <Ionicons name={icon} size={18} color={color} />

      <Text
        style={{
          flex: 1,
          color,
          fontSize: 13,
          fontWeight: "700",
          lineHeight: 18,
        }}
      >
        {text}
      </Text>
    </View>
  );
}