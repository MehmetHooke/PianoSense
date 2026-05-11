// app/auth/_layout.tsx

import { GuestGate } from "@/src/components/auth/AuthGate";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <GuestGate>
      <Stack screenOptions={{ headerShown: false }} />
    </GuestGate>
  );
}
