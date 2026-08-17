import { PracticeEmptyState } from "@/src/components/practice/PracticeEmptyState";
import { PracticeHeroCard } from "@/src/components/practice/PracticeHeroCard";
import { PracticeLoadingState } from "@/src/components/practice/PracticeLoadingState";
import { PracticeSearchBar } from "@/src/components/practice/PracticeSearchBar";
import { PracticeSectionHeader } from "@/src/components/practice/PracticeSectionHeader";
import { PracticeSongCard } from "@/src/components/practice/PracticeSongCard";
import { useAppAlert } from "@/src/hooks/useAppAlert";
import { getActiveSongs } from "@/src/services/songService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { Song } from "@/src/types/song";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

type PracticeSongItem = {
  song: Song;
  exerciseTitle: string;
  durationLabel: string | null;
};

function formatDuration(durationSec?: number) {
  if (!durationSec) return null;

  if (durationSec < 60) {
    return `${durationSec} sn`;
  }

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  return seconds > 0 ? `${minutes} dk ${seconds} sn` : `${minutes} dk`;
}

const EXERCISE_NAMES: Record<number, string> = {
  1: "Başlangıç",
  2: "Devler",
  3: "Tren",
  4: "Zaman",
  5: "Sinyal",
  6: "Korna",
  7: "Ağaçkakan",
  8: "Ağustos Böceği",
  9: "Rüzgâr",
  10: "Zıplayan Top",
  11: "Saklambaç",
  12: "Seksek",
  13: "Mutlu Periler",
  14: "Meraklı Kuş",
  15: "Zıpır Kedi",
  16: "Zıp Zıp Kurbağa",
  17: "Kanguru",
  18: "Masal Ormanı",
  19: "Oyun Oynayan Çocuk",
  20: "Ağır Taş",
  21: "Üzgün Bulut",
  22: "Elma Kurdu",
  23: "Uçuşan Kelebek",
  24: "Topaç",
  25: "Neşeli Penguen",
  26: "Koca Fil",
  27: "Yürüyen Merdiven",
  28: "Minik Kuzu",
  29: "Akşam Yürüyüşü",
  30: "Güvercin",
  31: "Tahterevalli",
  32: "Mutlu Gezegen",
  33: "Neşeli Tırtıl",
  34: "Ördek",
  35: "Küçük Gezgin",
  36: "Dans Eden Ağaçlar",
  37: "Parlayan Yıldızlar",
  38: "Beethoven 9. Senfoniden Bir Tema",
  39: "Anne Sevgisi",
  40: "Uyku",
  41: "Gökkuşağı",
  42: "Şakacı",
  43: "Küçük Tavşan",
  44: "İstasyon",
};

function getExerciseTitle(song: Song, index: number) {
  const order = song.order ?? index + 1;
  const exerciseName = EXERCISE_NAMES[order];

  return exerciseName ? `Ezgi ${order} - ${exerciseName}` : `Ezgi ${order}`;
}

export default function PracticeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showAlert } = useAppAlert();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const practiceItems = useMemo<PracticeSongItem[]>(() => {
    return songs.map((song, index) => ({
      song,
      exerciseTitle: getExerciseTitle(song, index),
      durationLabel: formatDuration(song.durationSec),
    }));
  }, [songs]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");

    if (!query) {
      return practiceItems;
    }

    return practiceItems.filter((item) => {
      const title = item.exerciseTitle.toLocaleLowerCase("tr-TR");
      const originalTitle = item.song.title?.toLocaleLowerCase("tr-TR") ?? "";
      const description =
        item.song.description?.toLocaleLowerCase("tr-TR") ?? "";
      const bpm = item.song.bpm ? `${item.song.bpm} bpm` : "";
      const duration = item.durationLabel?.toLocaleLowerCase("tr-TR") ?? "";

      return [title, originalTitle, description, bpm, duration].some((value) =>
        value.includes(query)
      );
    });
  }, [practiceItems, searchQuery]);

  const loadSongs = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const activeSongs = await getActiveSongs();
        setSongs(activeSongs);
      } catch (error) {
        console.log("Load songs error:", error);

        showAlert({
          type: "error",
          title: "Egzersizler yüklenemedi",
          message: "Egzersizler alınırken bir sorun oluştu. Lütfen tekrar dene.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showAlert]
  );

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [loadSongs])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSongs(true);
  };

  const handleStartSong = (songId: string) => {
    router.push({
      pathname: "/record/[songId]",
      params: { songId },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={loading ? [] : filteredItems}
        keyExtractor={(item) => item.song.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 40,
          paddingBottom: 130,
          gap: 12,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View>
            <PracticeHeroCard />

            <View style={{ marginTop: 18 }}>
              <PracticeSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => setSearchQuery("")}
              />
            </View>

            <PracticeSectionHeader
              count={filteredItems.length}
              loading={loading}
              refreshing={refreshing}
              searchQuery={searchQuery}
              onRefresh={handleRefresh}
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <PracticeLoadingState />
          ) : (
            <PracticeEmptyState
              searchQuery={searchQuery}
              onRetry={handleRefresh}
              onClearSearch={() => setSearchQuery("")}
            />
          )
        }
        renderItem={({ item }) => (
          <PracticeSongCard
            song={item.song}
            exerciseTitle={item.exerciseTitle}
            durationLabel={item.durationLabel}
            onPress={() => handleStartSong(item.song.id)}
          />
        )}
      />
    </View>
  );
}