// app/index.tsx

import { AuthErrorScreen, AuthLoadingScreen } from "@/src/components/auth/AuthGate";
import { useAuth } from "@/src/context/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (error) {
    return <AuthErrorScreen message={error} />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}
