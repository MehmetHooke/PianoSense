import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";

const pianoLightImage = require("@/src/assets/images/record/record-piano-light.png");
const pianoDarkImage = require("@/src/assets/images/record/record-piano-dark.png");

type Props = {
  title: string;
  description?: string;
  onBackPress: () => void;
  colors: AppColors;
  isDark: boolean;
};

export function RecordingHeader({
  title,
  description,
  onBackPress,
  colors,
  isDark,
}: Props) {
  const [imageLoading, setImageLoading] = useState(true);

  const imageSource = isDark ? pianoDarkImage : pianoLightImage;

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
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -6,
            top: 34,
            width: 150,
            height: 150,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* soft decorative circle */}
          <View
            style={{
              position: "absolute",
              width: 116,
              height: 116,
              borderRadius: 999,
              backgroundColor: colors.primarySoft,
              opacity: 0.75,
            }}
          />

          {imageLoading && (
            <View
              style={{
                position: "absolute",
                width: 84,
                height: 84,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.softBorder,
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          <Image
            source={imageSource}
            resizeMode="contain"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            style={{
              width: 146,
              height: 146,
              opacity: imageLoading ? 0 : 1,
            }}
          />
        </View>
      </View>
    </View>
  );
}