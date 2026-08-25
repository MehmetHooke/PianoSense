import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { getSongImageUrl } from "@/src/services/songImageService";
import { Image } from "expo-image";
import { useEffect } from "react";

type Props = {
  title: string;
  description?: string;
  songOrder?: number;
  onBackPress: () => void;
  colors: AppColors;
};
export function RecordingHeader({
  title,
  description,
  songOrder,
  onBackPress,
  colors,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setImageUrl(null);
    setImageLoading(true);

    async function loadSongImage() {
      if (!songOrder) {
        if (active) {
          setImageLoading(false);
        }
        return;
      }

      try {
        const url = await getSongImageUrl(songOrder);

        if (active) {
          setImageUrl(url);
        }
      } catch (error) {
        console.log(
          `[RecordingHeader] Image load error for order ${songOrder}:`,
          error
        );

        if (active) {
          setImageUrl(null);
        }
      } finally {
        if (active) {
          setImageLoading(false);
        }
      }
    }

    loadSongImage();

    return () => {
      active = false;
    };
  }, [songOrder]);


  return (
    <View style={{ marginBottom: 18 }}>
      <View
        style={{
          position: "relative",
          minHeight: 182,
          borderRadius: 28,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          paddingTop: 16,
          paddingBottom: 18,
          paddingHorizontal: 18,
          overflow: "hidden",

          shadowColor: colors.shadow,
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        }}
      >
        {/* Back button */}
        <Pressable
          onPress={onBackPress}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        {/* Title */}
        <View
          style={{
            paddingHorizontal: 58,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 42,
            marginBottom: 16,
          }}
        >
          <Text
            numberOfLines={2}
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: colors.text,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
        </View>

        {/* Left content */}
        <View
          style={{
            width: "62%",
            paddingTop: 4,
          }}
        >
          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: colors.primarySoft,
              borderWidth: 1,
              borderColor: colors.softBorder,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons
              name="radio-outline"
              size={14}
              color={colors.primary}
            />
            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              Dinle · Hazırlan · Kaydet
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.mutedText,
            }}
          >
            {description ??
              "Önce orijinal melodiyi dinle, sonra hazırlanıp kendi performansını kaydet."}
          </Text>
        </View>

        {/* Right image */}
        {/* Song cover */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width: 112,
            height: 112,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Arkadaki dekoratif kart */}
          <View
            style={{
              position: "absolute",
              width: 102,
              height: 102,
              borderRadius: 28,
              backgroundColor: colors.primarySoft,
              transform: [{ rotate: "6deg" }],
            }}
          />

          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: colors.card,
              borderWidth: 2,
              borderColor: colors.softBorder,

              shadowColor: colors.shadow,
              shadowOpacity: 0.14,
              shadowRadius: 10,
              shadowOffset: {
                width: 0,
                height: 5,
              },
              elevation: 4,

              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />
            ) : imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            ) : (
              <Ionicons
                name="musical-notes"
                size={30}
                color={colors.primary}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}