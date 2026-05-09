// app/_layout.tsx

import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

function AppLoading() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}

function RootLayoutInner() {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoading />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="record/[songId]" />
      <Stack.Screen name="processing/[jobId]" />
      <Stack.Screen name="result/[jobId]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}