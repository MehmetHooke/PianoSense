import { InsightsContent } from "@/src/components/insights/InsightsContent";
import { useAuth } from "@/src/context/AuthContext";
import { useAppTheme } from "@/src/theme/useTheme";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

export default function InsightsScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshToken((value) => value + 1);
  }, []);

  const handleRefreshEnd = useCallback(() => {
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingTop: 40,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.8,
          }}
        >
          Analizler
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 21,
            marginTop: 5,
          }}
        >
          Çalışmalarındaki skorları, nota doğruluğunu ve zamanlama gelişimini
          takip et.
        </Text>
      </View>

      {user?.uid ? (
        <InsightsContent
          targetUserId={user.uid}
          mode="self"
          refreshToken={refreshToken}
          onRefreshEnd={handleRefreshEnd}
        />
      ) : null}
    </ScrollView>
  );
}