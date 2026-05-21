// app/_layout.tsx

import { AppAlertProvider } from "@/src/context/AppAlertContext";
import { AuthProvider } from "@/src/context/AuthContext";
import { ThemeProvider } from "@/src/theme/ThemeProvider";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppAlertProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="record/[songId]" />
            <Stack.Screen name="processing/[jobId]" />
            <Stack.Screen name="result/[jobId]" />
          </Stack>
        </AppAlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
