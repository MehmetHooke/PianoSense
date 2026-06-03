// app/(student)/_layout.tsx

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
            title: "Özet",
          }}
        />

        <Tabs.Screen
          name="overview"
          options={{
            title: "Çocuğum",
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