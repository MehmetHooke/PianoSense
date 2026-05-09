// src/components/auth/AuthGate.tsx

import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export function AuthGate({ children }: Props) {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8F7FF",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#4F46E5",
            shadowOpacity: 0.16,
            shadowRadius: 24,
            elevation: 8,
            marginBottom: 24,
          }}
        >
          <Ionicons name="musical-notes" size={42} color="#4F46E5" />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          PianoSense
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Test hesabı ile giriş yapılıyor...
        </Text>

        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8F7FF",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            backgroundColor: "#FEE2E2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="alert-circle" size={44} color="#EF4444" />
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "900",
            color: "#111827",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Giriş yapılamadı
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          {error ?? "Test kullanıcısı ile giriş yapılamadı."}
        </Text>

        <View
          style={{
            marginTop: 24,
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            width: "100%",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text style={{ color: "#111827", fontWeight: "800", marginBottom: 6 }}>
            Firebase Console’da şunu kontrol et:
          </Text>

          <Text style={{ color: "#6B7280", lineHeight: 22 }}>
            Email: test@gmail.com{"\n"}
            Password: test123
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}