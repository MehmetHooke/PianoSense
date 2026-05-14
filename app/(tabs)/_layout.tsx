// app/(tabs)/_layout.tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { LiquidTabBar } from "@/src/components/navigation/LiquidTabBar";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <AuthGate>
      <Tabs
        tabBar={(props) => <LiquidTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Ana Sayfa",
          }}
        />

        <Tabs.Screen
          name="practice"
          options={{
            title: "Çalış",
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            title: "Analizler",
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
          }}
        />

      </Tabs>
    </AuthGate>
  );
}