// app/(tabs)/index.tsx

import { getActiveSongs } from "@/src/services/songService";
import type { Song, SongLevel } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

function getLevelLabel(level?: SongLevel) {
  switch (level) {
    case "beginner":
      return "Başlangıç";
    case "easy":
      return "Kolay";
    case "medium":
      return "Orta";
    case "hard":
      return "Zor";
    default:
      return "Egzersiz";
  }
}

function getLevelColor(level?: SongLevel) {
  switch (level) {
    case "beginner":
      return "#16A34A";
    case "easy":
      return "#4F46E5";
    case "medium":
      return "#F59E0B";
    case "hard":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}

function formatDuration(durationSec?: number) {
  if (!durationSec) return null;

  if (durationSec < 60) {
    return `${durationSec} sn`;
  }

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  return seconds > 0 ? `${minutes} dk ${seconds} sn` : `${minutes} dk`;
}

export default function SongListScreen() {
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSongs = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const activeSongs = await getActiveSongs();
      setSongs(activeSongs);
    } catch (error) {
      console.log("Load songs error:", error);
      Alert.alert(
        "Parçalar yüklenemedi",
        "Egzersizler yüklenirken bir sorun oluştu. Lütfen tekrar dene.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [loadSongs]),
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
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8F7FF",
        paddingHorizontal: 20,
        paddingTop: 64,
      }}
    >
      <FlatList
        data={loading ? [] : songs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: 32,
          gap: 12,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 20,
                backgroundColor: "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="musical-notes" size={30} color="#4F46E5" />
            </View>

            <Text
              style={{
                fontSize: 30,
                fontWeight: "900",
                color: "#111827",
                marginBottom: 6,
              }}
            >
              PianoSense
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: "#6B7280",
                lineHeight: 22,
              }}
            >
              Bir egzersiz seç. Önce orijinal melodiyi dinle, sonra aynı
              melodiyi çal ve sistemden geri bildirim al.
            </Text>

            <View
              style={{
                marginTop: 18,
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  backgroundColor: "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="analytics" size={22} color="#4F46E5" />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 15,
                    fontWeight: "900",
                  }}
                >
                  Nasıl çalışır?
                </Text>

                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 13,
                    lineHeight: 19,
                    marginTop: 3,
                  }}
                >
                  Dinle, kaydet, analize gönder. Sonuçta doğru, yanlış, eksik ve
                  zamanlama hatalarını göreceksin.
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 22,
                marginBottom: 4,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 20,
                    fontWeight: "900",
                  }}
                >
                  Egzersizler
                </Text>

                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 13,
                    marginTop: 3,
                  }}
                >
                  {loading
                    ? "Yükleniyor..."
                    : `${songs.length} aktif egzersiz`}
                </Text>
              </View>

              <Pressable
                onPress={handleRefresh}
                disabled={refreshing || loading}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: refreshing || loading ? 0.5 : 1,
                }}
              >
                <Ionicons name="refresh" size={20} color="#4F46E5" />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
              }}
            >
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={{ marginTop: 12, color: "#6B7280" }}>
                Egzersizler yükleniyor...
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 20,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                marginTop: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
              </View>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Egzersiz bulunamadı
              </Text>

              <Text
                style={{
                  color: "#6B7280",
                  lineHeight: 22,
                }}
              >
                Şu anda aktif egzersiz görünmüyor. Biraz sonra tekrar dene.
              </Text>

              <Pressable
                onPress={handleRefresh}
                style={{
                  marginTop: 16,
                  backgroundColor: "#4F46E5",
                  borderRadius: 16,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>
                  Tekrar dene
                </Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => {
          const levelColor = getLevelColor(item.level);
          const duration = formatDuration(item.durationSec);

          return (
            <Pressable
              onPress={() => handleStartSong(item.id)}
              style={({ pressed }) => ({
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="musical-note" size={25} color="#4F46E5" />
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "#111827",
                      fontSize: 16,
                      fontWeight: "900",
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  {item.order ? (
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontSize: 12,
                        fontWeight: "800",
                      }}
                    >
                      #{item.order}
                    </Text>
                  ) : null}
                </View>

                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 13,
                    lineHeight: 18,
                  }}
                  numberOfLines={1}
                >
                  {item.description ?? "Kısa tek melodi piyano egzersizi"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: `${levelColor}16`,
                      borderRadius: 999,
                      paddingVertical: 5,
                      paddingHorizontal: 9,
                    }}
                  >
                    <Text
                      style={{
                        color: levelColor,
                        fontSize: 11,
                        fontWeight: "900",
                      }}
                    >
                      {getLevelLabel(item.level)}
                    </Text>
                  </View>

                  {duration ? (
                    <MiniMeta icon="time" label={duration} />
                  ) : null}

                  {item.noteCount ? (
                    <MiniMeta icon="key" label={`${item.noteCount} nota`} />
                  ) : null}
                </View>
              </View>

              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  backgroundColor: "#4F46E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            </Pressable>


          );
        }}
      />

    </View>
  );
}

function MiniMeta({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "#F3F4F6",
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 9,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Ionicons name={icon} size={12} color="#6B7280" />
      <Text
        style={{
          color: "#6B7280",
          fontSize: 11,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </View>
  );
}