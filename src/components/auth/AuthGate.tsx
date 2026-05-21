import { useAuth } from "@/src/context/AuthContext";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export function AuthGate({ children }: Props) {
  const { user, loading, error } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (error) {
    return <AuthErrorScreen message={error} />;
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <>{children}</>;
}

export function GuestGate({ children }: Props) {
  const { user, loading, error } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (error) {
    return <AuthErrorScreen message={error} />;
  }

  if (user) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export function AuthLoadingScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
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
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.softBorder,
        }}
      >
        <Ionicons name="musical-notes" size={42} color={colors.primary} />
      </View>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "900",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        PianoSense
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: colors.mutedText,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Oturum kontrol ediliyor...
      </Text>

      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function AuthErrorScreen({ message }: { message: string }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
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
          backgroundColor: colors.dangerSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Ionicons name="alert-circle" size={44} color={colors.danger} />
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "900",
          color: colors.text,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Giris yapilamadi
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: colors.mutedText,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
