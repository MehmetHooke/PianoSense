// src/components/result/ResultProcessingSkeleton.tsx

import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native";

const insightLightImage = require("@/src/assets/images/insights/insights-light.png");
const insightDarkImage = require("@/src/assets/images/insights/insights-dark.png");

type Props = {
  colors: AppColors;
  status?: string;
  isDark: boolean;
};

type ProcessingStep = {
  key: string;
  title: string;
  description: string;
  progress: number;
};

function getProcessingStep(status?: string): ProcessingStep {
  if (status === "uploading") {
    return {
      key: "uploading",
      title: "Kaydın yükleniyor",
      description: "Performans kaydın güvenli şekilde hazırlanıyor.",
      progress: 24,
    };
  }

  if (status === "queued") {
    return {
      key: "queued",
      title: "Analiz sıraya alındı",
      description: "Kaydın analiz sistemi tarafından işlenmek üzere bekliyor.",
      progress: 46,
    };
  }

  if (status === "processing") {
    return {
      key: "processing",
      title: "Notalar karşılaştırılıyor",
      description: "Orijinal melodi ile performansındaki nota ve zamanlama farkları inceleniyor.",
      progress: 78,
    };
  }

  if (status === "completed") {
    return {
      key: "completed",
      title: "Sonuç hazırlanıyor",
      description: "Analiz tamamlandı. Sonuç ekranı açılıyor.",
      progress: 100,
    };
  }

  return {
    key: "preparing",
    title: "Analiz hazırlanıyor",
    description: "Performans sonucunu oluşturmak için ilk adımlar hazırlanıyor.",
    progress: 12,
  };
}

function SkeletonBlock({
  colors,
  width = "100%",
  height,
  borderRadius = 14,
  style,
  delay = 0,
}: {
  colors: AppColors;
  width?: ViewStyle["width"];
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0.22)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.95,
            duration: 620,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 620,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.22,
            duration: 780,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.98,
            duration: 780,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, opacity, scale]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.elevatedCard,
          opacity,
          transform: [{ scale }],
        },
        style,
      ]}
    />
  );
}

function MetricSkeletonCard({
  colors,
  delay,
}: {
  colors: AppColors;
  delay: number;
}) {
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
      <SkeletonBlock
        colors={colors}
        width={28}
        height={5}
        borderRadius={999}
        delay={delay}
      />

      <SkeletonBlock
        colors={colors}
        width="62%"
        height={12}
        borderRadius={999}
        delay={delay + 90}
        style={{ marginTop: 12 }}
      />

      <SkeletonBlock
        colors={colors}
        width="42%"
        height={26}
        borderRadius={10}
        delay={delay + 160}
        style={{ marginTop: 9 }}
      />
    </View>
  );
}

function NoteSkeletonItem({
  colors,
  delay,
}: {
  colors: AppColors;
  delay: number;
}) {
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
      <SkeletonBlock
        colors={colors}
        width={38}
        height={38}
        borderRadius={14}
        delay={delay}
      />

      <View style={{ flex: 1 }}>
        <SkeletonBlock
          colors={colors}
          width="72%"
          height={16}
          delay={delay + 80}
        />

        <SkeletonBlock
          colors={colors}
          width="92%"
          height={12}
          delay={delay + 150}
          style={{ marginTop: 9 }}
        />

        <SkeletonBlock
          colors={colors}
          width="56%"
          height={11}
          delay={delay + 220}
          style={{ marginTop: 8 }}
        />
      </View>

      <SkeletonBlock
        colors={colors}
        width={64}
        height={28}
        borderRadius={999}
        delay={delay + 120}
      />
    </View>
  );
}

export function ResultProcessingSkeleton({
  colors,
  status,
  isDark,
}: Props) {
  const step = useMemo(() => getProcessingStep(status), [status]);
  const imageSource = isDark ? insightDarkImage : insightLightImage;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 36,
      }}
      showsVerticalScrollIndicator={false}
    >
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
              <SkeletonBlock
                colors={colors}
                width="42%"
                height={13}
                delay={0}
              />

              <SkeletonBlock
                colors={colors}
                width={108}
                height={58}
                borderRadius={18}
                delay={110}
                style={{ marginTop: 10 }}
              />

              <SkeletonBlock
                colors={colors}
                width="58%"
                height={18}
                borderRadius={999}
                delay={220}
                style={{ marginTop: 10 }}
              />
            </View>

            <View
              style={{
                width: 132,
                height: 132,
                borderRadius: 34,
                
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={imageSource}
                contentFit="contain"
                transition={180}
                style={{
                  width: 132,
                  height: 132,
                }}
              />
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
              gap: 12,
            }}
          >
            <View
              style={{
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
                <Ionicons
                  name="musical-notes"
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "900",
                  }}
                >
                  {step.title}
                </Text>

                <Text
                  style={{
                    color: colors.mutedText,
                    fontSize: 12,
                    lineHeight: 18,
                    marginTop: 2,
                  }}
                >
                  {step.description}
                </Text>
              </View>

              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                %{step.progress}
              </Text>
            </View>

            <View
              style={{
                height: 9,
                borderRadius: 999,
                backgroundColor: colors.progressTrack,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${step.progress}%`,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>
        </View>
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
          <SkeletonBlock colors={colors} width="70%" height={12} delay={80} />

          <SkeletonBlock
            colors={colors}
            width="48%"
            height={26}
            delay={180}
            style={{ marginTop: 12 }}
          />

          <SkeletonBlock
            colors={colors}
            width="100%"
            height={7}
            borderRadius={999}
            delay={280}
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
          <SkeletonBlock colors={colors} width="62%" height={12} delay={180} />

          <SkeletonBlock
            colors={colors}
            width="45%"
            height={26}
            delay={280}
            style={{ marginTop: 12 }}
          />

          <SkeletonBlock
            colors={colors}
            width="100%"
            height={7}
            borderRadius={999}
            delay={380}
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
        <MetricSkeletonCard colors={colors} delay={0} />
        <MetricSkeletonCard colors={colors} delay={120} />
        <MetricSkeletonCard colors={colors} delay={240} />
        <MetricSkeletonCard colors={colors} delay={360} />
        <MetricSkeletonCard colors={colors} delay={480} />
        <MetricSkeletonCard colors={colors} delay={600} />
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

      <NoteSkeletonItem colors={colors} delay={120} />
      <NoteSkeletonItem colors={colors} delay={260} />
      <NoteSkeletonItem colors={colors} delay={400} />
      <NoteSkeletonItem colors={colors} delay={540} />
    </ScrollView>
  );
}