// src/components/result/ResultProcessingSkeleton.tsx

import { ResultTopBar } from "@/src/components/result/ResultTopBar";
import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type Props = {
  colors: AppColors;
  onBackPress: () => void;
  status?: string;
};

function getProcessingStatusLabel(status?: string) {
  if (status === "uploading") return "Kayıt yükleniyor";
  if (status === "queued") return "Analiz sıraya alındı";
  if (status === "processing") return "Notalar karşılaştırılıyor";
  if (status === "completed") return "Sonuç hazırlanıyor";
  if (status === "failed") return "Analiz başarısız oldu";

  return "Hazırlanıyor";
}

function SkeletonBlock({
  colors,
  width = "100%",
  height,
  borderRadius = 14,
  style,
}: {
  colors: AppColors;
  width?: ViewStyle["width"];
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 760,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.elevatedCard,
          opacity,
        },
        style,
      ]}
    />
  );
}

function MetricSkeletonCard({ colors }: { colors: AppColors }) {
  return (
    <View
      style={{
        width: "31%",
        minWidth: 96,
        flexGrow: 1,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <SkeletonBlock colors={colors} width={28} height={5} borderRadius={999} />

      <SkeletonBlock
        colors={colors}
        width="62%"
        height={12}
        borderRadius={999}
        style={{ marginTop: 12 }}
      />

      <SkeletonBlock
        colors={colors}
        width="42%"
        height={26}
        borderRadius={10}
        style={{ marginTop: 9 }}
      />
    </View>
  );
}

function NoteSkeletonItem({ colors }: { colors: AppColors }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <SkeletonBlock colors={colors} width={38} height={38} borderRadius={14} />

      <View style={{ flex: 1 }}>
        <SkeletonBlock colors={colors} width="72%" height={16} />
        <SkeletonBlock
          colors={colors}
          width="92%"
          height={12}
          style={{ marginTop: 9 }}
        />
        <SkeletonBlock
          colors={colors}
          width="56%"
          height={11}
          style={{ marginTop: 8 }}
        />
      </View>

      <SkeletonBlock colors={colors} width={64} height={28} borderRadius={999} />
    </View>
  );
}

export function ResultProcessingSkeleton({
  colors,
  onBackPress,
  status,
}: Props) {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 36,
      }}
      showsVerticalScrollIndicator={false}
    >
      <ResultTopBar
        colors={colors}
        onBackPress={onBackPress}
        label="ANALİZ EDİLİYOR"
      />

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "900",
            color: colors.text,
            marginBottom: 8,
            letterSpacing: -0.8,
          }}
        >
          Performans Özeti
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: colors.mutedText,
            lineHeight: 22,
            marginBottom: 18,
          }}
        >
          Kaydın orijinal melodiyle karşılaştırılıyor. Nota doğruluğu ve
          zamanlama sonucu hazırlanıyor.
        </Text>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 30,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOpacity: 1,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <SkeletonBlock colors={colors} width="42%" height={13} />

              <SkeletonBlock
                colors={colors}
                width={108}
                height={58}
                borderRadius={18}
                style={{ marginTop: 10 }}
              />

              <SkeletonBlock
                colors={colors}
                width="58%"
                height={18}
                borderRadius={999}
                style={{ marginTop: 10 }}
              />
            </View>

            <View
              style={{
                width: 124,
                height: 124,
                borderRadius: 999,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.softBorder,
              }}
            >
              <Ionicons name="analytics" size={42} color={colors.primary} />
            </View>
          </View>

          <View
            style={{
              marginTop: 18,
              backgroundColor: colors.surface,
              borderRadius: 22,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.softBorder,
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="musical-notes" size={21} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Analiz devam ediyor
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 12,
                  lineHeight: 18,
                  marginTop: 2,
                }}
              >
                Sonuç hazır olduğunda otomatik olarak gösterilecek.
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={{
            marginTop: 10,
            color: colors.subtleText,
            fontSize: 12,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Durum: {getProcessingStatusLabel(status)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <SkeletonBlock colors={colors} width="70%" height={12} />
          <SkeletonBlock
            colors={colors}
            width="48%"
            height={26}
            style={{ marginTop: 12 }}
          />
          <SkeletonBlock
            colors={colors}
            width="100%"
            height={7}
            borderRadius={999}
            style={{ marginTop: 14 }}
          />
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <SkeletonBlock colors={colors} width="62%" height={12} />
          <SkeletonBlock
            colors={colors}
            width="45%"
            height={26}
            style={{ marginTop: 12 }}
          />
          <SkeletonBlock
            colors={colors}
            width="100%"
            height={7}
            borderRadius={999}
            style={{ marginTop: 14 }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 22,
        }}
      >
        <MetricSkeletonCard colors={colors} />
        <MetricSkeletonCard colors={colors} />
        <MetricSkeletonCard colors={colors} />
        <MetricSkeletonCard colors={colors} />
        <MetricSkeletonCard colors={colors} />
        <MetricSkeletonCard colors={colors} />
      </View>

      <View
        style={{
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 21,
              fontWeight: "900",
              letterSpacing: -0.3,
            }}
          >
            Nota Detayları
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              lineHeight: 19,
              marginTop: 3,
            }}
          >
            Notalar karşılaştırılıyor.
          </Text>
        </View>

        <Text
          style={{
            color: colors.subtleText,
            fontSize: 12,
            fontWeight: "800",
          }}
        >
          hazırlanıyor
        </Text>
      </View>

      <NoteSkeletonItem colors={colors} />
      <NoteSkeletonItem colors={colors} />
      <NoteSkeletonItem colors={colors} />
      <NoteSkeletonItem colors={colors} />
    </ScrollView>
  );
}