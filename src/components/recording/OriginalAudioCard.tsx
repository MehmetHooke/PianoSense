import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
  isPlaying: boolean;
  isLoading: boolean;
  disabled: boolean;
  onPress: () => void;
  colors: AppColors;
};

export function OriginalAudioCard({
  isPlaying,
  isLoading,
  disabled,
  onPress,
  colors,
}: Props) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        marginBottom: 14,
        opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
      })}
    >
      <View
        style={{
          minHeight: 74,
          borderRadius: 24,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: isPlaying ? colors.primary : colors.border,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,

          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        }}
      >
        {/* Play / Pause button */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 18,
            backgroundColor: isPlaying ? colors.pianoBlack : colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={22}
              color={colors.primaryForeground}
              style={{
                marginLeft: isPlaying ? 0 : 2,
              }}
            />
          )}
        </View>

        {/* Text area */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 3,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              Orijinal parçayı dinle
            </Text>

            {isPlaying && (
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: colors.success,
                }}
              />
            )}
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {isPlaying
              ? "Parça çalıyor, hazır olduğunda durdurabilirsin."
              : "Melodiyi ve giriş zamanını hatırla."}
          </Text>
        </View>

        {/* Right badge */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: colors.primarySoft,
            borderWidth: 1,
            borderColor: colors.softBorder,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Ionicons name="musical-note" size={13} color={colors.primary} />

          <Text
            style={{
              color: colors.primary,
              fontSize: 11,
              fontWeight: "900",
            }}
          >
            Original
          </Text>
        </View>
      </View>
    </Pressable>
  );
}