// app/_layout.tsx

import { AuthProvider } from "@/src/context/AuthContext";
import { ThemeProvider } from "@/src/theme/ThemeProvider";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="record/[songId]" />
          <Stack.Screen name="processing/[jobId]" />
          <Stack.Screen name="result/[jobId]" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
