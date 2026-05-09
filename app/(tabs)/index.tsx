// app/(tabs)/index.tsx

import { getActiveSongs } from "@/src/services/songService";
import type { Song } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function SongListScreen() {
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSongs = useCallback(async () => {
    try {
      setLoading(true);
      const activeSongs = await getActiveSongs();
      setSongs(activeSongs);
    } catch (error) {
      console.log("Load songs error:", error);
      Alert.alert("Hata", "Parçalar yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [loadSongs])
  );

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
      <View style={{ marginBottom: 22 }}>
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
          Bir melodi seç. Önce orijinalini dinle, sonra aynı melodiyi çal ve
          kaydet.
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 12, color: "#6B7280" }}>
            Parçalar yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: 32,
            gap: 12,
          }}
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 20,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Henüz parça yok
              </Text>

              <Text
                style={{
                  color: "#6B7280",
                  lineHeight: 22,
                }}
              >
                Firestore songs koleksiyonunda aktif parça bulunamadı.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="musical-note" size={24} color="#4F46E5" />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 16,
                    fontWeight: "900",
                  }}
                >
                  {item.title}
                </Text>

                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                  numberOfLines={1}
                >
                  Önce dinle, sonra kaydet
                </Text>
              </View>

              <Pressable
                onPress={() => handleStartSong(item.id)}
                style={{
                  backgroundColor: "#4F46E5",
                  borderRadius: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "900",
                    fontSize: 14,
                  }}
                >
                  Başla
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}