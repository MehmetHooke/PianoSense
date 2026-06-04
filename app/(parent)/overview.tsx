// app/(parent)/overview.tsx

import { ParentChildAccordion } from "@/src/components/parent/ParentChildAccordion";
import { ParentEmptyChildCard } from "@/src/components/parent/ParentEmptyChildCard";
import { useAuth } from "@/src/context/AuthContext";
import { listenParentChildren } from "@/src/services/parentService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { ParentLinkedChild } from "@/src/types/parent";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const layoutTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

export default function ParentOverviewScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [children, setChildren] = useState<ParentLinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);


  useEffect(() => {
    if (!user?.uid) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = listenParentChildren(
      user.uid,
      (items) => {
        setChildren(items);
        setLoading(false);

        if (items.length > 0) {
          setExpandedChildId((current) => current ?? items[0].studentId);
        }
      },
      (error) => {
        console.log("PARENT OVERVIEW CHILDREN LISTEN ERROR:", error);
        setChildren([]);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  function handleAddChild() {
    router.push({
      pathname: "/(parent)/profile",
      params: {
        open: "childLink",
      },
    });
  }
  function handleOpenJob(jobId: string) {
    router.push(`/result/${jobId}`);
  }


  function toggleChild(studentId: string) {
    setExpandedChildId((prev) => (prev === studentId ? null : studentId));
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingTop: 48,
        paddingBottom: Math.max(insets.bottom, 12) + 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View layout={layoutTransition}>
        <Text
          style={{
            color: colors.text,
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.8,
          }}
        >
          Çocuğum
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 21,
            marginTop: 7,
          }}
        >
          Çocuğunun piyano çalışmalarını, analiz sayılarını ve performans
          özetini buradan takip edebilirsin.
        </Text>
      </Animated.View>

      {loading ? (
        <View
          style={{
            marginTop: 24,
            backgroundColor: colors.card,
            borderRadius: 26,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.softBorder,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 170,
            shadowColor: colors.shadow,
            shadowOpacity: 0.06,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 7 },
            elevation: 2,
          }}
        >
          <ActivityIndicator color={colors.primary} />

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "700",
              marginTop: 12,
            }}
          >
            Çocuk bilgileri yükleniyor...
          </Text>
        </View>
      ) : children.length === 0 ? (
        <ParentEmptyChildCard colors={colors} onAddChild={handleAddChild} />
      ) : (
        <Animated.View
          layout={layoutTransition}
          style={{
            marginTop: 24,
            gap: 14,
          }}
        >
          {children.map((child) => (
            <ParentChildAccordion
              key={child.studentId}
              colors={colors}
              child={child}
              expanded={expandedChildId === child.studentId}
              onPress={() => toggleChild(child.studentId)}
              onOpenJob={handleOpenJob}
            />
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );
}