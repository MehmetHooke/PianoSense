import { auth } from "@/src/services/firebase";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginScreen() {
  const { colors } = useAppTheme();

  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("test123");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      
      setErrorMessage("Giriş yapılamadı. E-posta veya şifreyi kontrol edin.");
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
        <View style={{ gap: 28 }}>
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
              <Ionicons name="musical-notes" size={34} color={colors.primary} />
            </View>

            <View style={{ gap: 8, alignItems: "center" }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 30,
                  fontWeight: "900",
                  textAlign: "center",
                }}
              >
                PianoSense’e hoş geldin
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 15,
                  lineHeight: 22,
                  textAlign: "center",
                }}
              >
                Performansını kaydet, orijinal melodiyle karşılaştır ve hangi
                notalarda gelişmen gerektiğini gör.
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
                  placeholder="test@gmail.com"
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
                  placeholder="test123"
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
              onPress={handleLogin}
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
                  Giriş yap
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.push("/auth/forgotPassword")}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                Şifremi unuttum
              </Text>
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
              Hesabın yok mu?
            </Text>

            <Link href="/auth/register" asChild>
              <Pressable>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 14,
                    fontWeight: "900",
                  }}
                >
                  Kayıt ol
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
