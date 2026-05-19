// src/components/settings/ProfileSummaryCard.tsx

import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, Text, View } from "react-native";

type Props = {
  displayName?: string | null;
  email?: string | null;
  profileImageSource?: ImageSourcePropType;
  onAvatarPress?: () => void;
};

function getInitial(displayName?: string | null, email?: string | null) {
  const source = displayName?.trim() || email?.trim() || "P";
  return source.charAt(0).toUpperCase();
}

export function ProfileSummaryCard({
  displayName,
  email,
  profileImageSource,
  onAvatarPress,
}: Props) {
  const { colors } = useAppTheme();

  const shownName = displayName?.trim() || "PianoSense Kullanıcısı";
  const shownEmail = email?.trim() || "E-posta bilgisi yok";

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 26,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 7 },
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Pressable
          onPress={onAvatarPress}
          disabled={!onAvatarPress}
          style={({ pressed }) => ({
            width: 68,
            height: 68,
            borderRadius: 24,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: 2,
            borderColor: colors.softBorder,
            opacity: pressed ? 0.86 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          {profileImageSource ? (
            <Image
              source={profileImageSource}
              resizeMode="cover"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            <Text
              style={{
                color: colors.primary,
                fontSize: 26,
                fontWeight: "900",
              }}
            >
              {getInitial(displayName, email)}
            </Text>
          )}

          <View
            style={{
              position: "absolute",
              right: 3,
              bottom: 3,
              width: 24,
              height: 24,
              borderRadius: 999,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: colors.card,
            }}
          >
            <Ionicons
              name="camera-outline"
              size={13}
              color={colors.primaryForeground}
            />
          </View>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 19,
              fontWeight: "900",
              letterSpacing: -0.3,
            }}
            numberOfLines={1}
          >
            {shownName}
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {shownEmail}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 11,
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: colors.primarySoft,
              borderWidth: 1,
              borderColor: colors.softBorder,
            }}
          >
            <Ionicons name="school" size={14} color={colors.primary} />

            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              Öğrenci hesabı
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}