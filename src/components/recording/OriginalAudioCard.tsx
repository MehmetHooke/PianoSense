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
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.softBorder,
          }}
        >
          <Ionicons name="play" size={24} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            1. Orijinal parçayı dinle
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              marginTop: 4,
              lineHeight: 20,
              fontSize: 14,
            }}
          >
            Melodiyi, ritmi ve giriş zamanını aklında tut.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        style={({ pressed }) => ({
          backgroundColor: isPlaying ? colors.pianoBlack : colors.primary,
          borderRadius: 18,
          paddingVertical: 15,
          alignItems: "center",
          opacity: disabled || isLoading ? 0.5 : pressed ? 0.85 : 1,
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        })}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={colors.primaryForeground}
          />
        )}

        <Text
          style={{
            color: colors.primaryForeground,
            fontWeight: "900",
            fontSize: 15,
          }}
        >
          {isPlaying ? "Durdur" : "Orijinali Oynat"}
        </Text>
      </Pressable>

      <View
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.softBorder,
          flexDirection: "row",
          gap: 8,
        }}
      >
        <Ionicons
          name="information-circle"
          size={17}
          color={colors.subtleText}
          style={{ marginTop: 1 }}
        />

        <Text
          style={{
            color: colors.subtleText,
            fontSize: 12,
            lineHeight: 18,
            flex: 1,
          }}
        >
          İpucu: Kayda başlamadan önce parçayı en az bir kez dinle. Kayıt
          sırasında orijinal parça kapalı olacak.
        </Text>
      </View>
    </View>
  );
}