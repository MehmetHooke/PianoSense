// app/(teacher)/_layout.tsx

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
          name="classes"
          options={{
            title: "Sınıflar",
          }}
        />

        <Tabs.Screen
          name="students"
          options={{
            title: "Öğrenciler",
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