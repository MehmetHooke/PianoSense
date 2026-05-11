// app/(tabs)/_layout.tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <AuthGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtleText,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.softBorder ?? colors.border,
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 88 : 80,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "800",
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Parcalar",
            tabBarIcon: ({ color }) => (
              <Ionicons name="musical-notes" size={23} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="library"
          options={{
            title: "Kayitlar",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "folder-open" : "folder-open-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Ayarlar",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "options" : "options-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </AuthGate>
  );
}
