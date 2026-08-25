import { getSongImageUrl } from "@/src/services/songImageService";
import { useAppTheme } from "@/src/theme/useTheme";

import type { Song } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { PracticeMetaPill } from "./PracticeMetaPill";

type Props = {
  song: Song;
  exerciseTitle: string;
  durationLabel: string | null;
  onPress: () => void;
};

export function PracticeSongCard({
  song,
  exerciseTitle,
  durationLabel,
  onPress,
}: Props) {
  const { colors } = useAppTheme();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);


  useEffect(() => {
    let active = true;

    setImageUrl(null);
    setImageLoading(true);

    async function loadSongImage() {
      if (!song.order) {
        if (active) {
          setImageLoading(false);
        }
        return;
      }

      try {
        const url = await getSongImageUrl(song.order);

        if (active) {
          setImageUrl(url);
        }
      } catch (error) {
        console.log(
          `[PracticeSongCard] Image load error for order ${song.order}:`,
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
  }, [song.order]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.softBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 12,
          backgroundColor: colors.tabBarBackground,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
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
          />
        ) : (
          <Ionicons
            name="musical-notes"
            size={26}
            color={colors.primary}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "900",
          }}
          numberOfLines={1}
        >
          {exerciseTitle}
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 13,
            lineHeight: 18,
            fontWeight: "600",
            marginTop: 4,
          }}
          numberOfLines={1}
        >
          {song.description ?? "Kısa tek melodi piyano egzersizi"}
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 11,
          }}
        >
          {song.bpm ? (
            <PracticeMetaPill icon="pulse" label={`${song.bpm} BPM`} />
          ) : null}

          {durationLabel ? (
            <PracticeMetaPill icon="time" label={durationLabel} />
          ) : null}
        </View>
      </View>

      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 15,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name="arrow-forward"
          size={20}
          color={colors.primaryForeground}
        />
      </View>
    </Pressable>
  );
}