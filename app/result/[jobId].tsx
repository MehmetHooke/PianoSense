// app/result/[jobId].tsx

import { getAnalysisJobById } from "@/src/services/analysisJobService";
import type { AnalysisJob, AnalysisResultItem } from "@/src/types/analysisJob";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    View,
} from "react-native";

function getStatusLabel(status: AnalysisResultItem["status"]) {
  switch (status) {
    case "correct":
      return "Doğru";
    case "wrongNote":
      return "Yanlış nota";
    case "missed":
      return "Kaçırıldı";
    case "extra":
      return "Fazla nota";
    case "timingEarly":
      return "Erken";
    case "timingLate":
      return "Geç";
    default:
      return status;
  }
}

function getStatusColor(status: AnalysisResultItem["status"]) {
  switch (status) {
    case "correct":
      return "#16A34A";
    case "wrongNote":
      return "#EF4444";
    case "missed":
      return "#F59E0B";
    case "extra":
      return "#7C3AED";
    case "timingEarly":
    case "timingLate":
      return "#2563EB";
    default:
      return "#6B7280";
  }
}

export default function ResultScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        if (!jobId) return;

        const foundJob = await getAnalysisJobById(jobId);
        setJob(foundJob);
      } catch (error) {
        console.log("Load result error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [jobId]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8F7FF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!job || !job.result) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8F7FF",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 22,
            fontWeight: "900",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Sonuç bulunamadı
        </Text>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={{
            marginTop: 24,
            backgroundColor: "#4F46E5",
            borderRadius: 18,
            paddingVertical: 14,
            paddingHorizontal: 18,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>
            Ana sayfaya dön
          </Text>
        </Pressable>
      </View>
    );
  }

  const result = job.result;

  return (
    <FlatList
      style={{
        flex: 1,
        backgroundColor: "#F8F7FF",
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 36,
      }}
      data={result.items}
      keyExtractor={(_, index) => String(index)}
      ListHeaderComponent={
        <View>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Ionicons name="home" size={22} color="#111827" />
          </Pressable>

          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: "#4F46E5",
              marginBottom: 8,
            }}
          >
            ANALİZ SONUCU
          </Text>

          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Performans Özeti
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: "#6B7280",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            Bu sonuç şimdilik mock veridir. Ama ekran, gerçek analiz sonucu
            geldiğinde aynı Firestore datasını gösterecek.
          </Text>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 28,
              padding: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#6B7280",
                fontSize: 14,
                marginBottom: 6,
              }}
            >
              Genel skor
            </Text>

            <Text
              style={{
                color: "#111827",
                fontSize: 52,
                fontWeight: "900",
              }}
            >
              %{result.overallScore}
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 18,
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#EEF2FF",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 12 }}>
                  Nota
                </Text>
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 20,
                    fontWeight: "900",
                    marginTop: 4,
                  }}
                >
                  %{result.pitchScore}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#EEF2FF",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 12 }}>
                  Zamanlama
                </Text>
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 20,
                    fontWeight: "900",
                    marginTop: 4,
                  }}
                >
                  %{result.timingScore}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                Doğru
              </Text>
              <Text
                style={{
                  color: "#16A34A",
                  fontSize: 22,
                  fontWeight: "900",
                  marginTop: 4,
                }}
              >
                {result.correctNotes}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                Yanlış
              </Text>
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 22,
                  fontWeight: "900",
                  marginTop: 4,
                }}
              >
                {result.wrongNotes}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                Kaçan
              </Text>
              <Text
                style={{
                  color: "#F59E0B",
                  fontSize: 22,
                  fontWeight: "900",
                  marginTop: 4,
                }}
              >
                {result.missedNotes}
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: "#111827",
              fontSize: 20,
              fontWeight: "900",
              marginBottom: 12,
            }}
          >
            Nota Detayları
          </Text>
        </View>
      }
      renderItem={({ item, index }) => {
        const color = getStatusColor(item.status);

        return (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                backgroundColor: "#F8FAFC",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#6B7280", fontWeight: "900" }}>
                {index + 1}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#111827",
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                {item.expectedNote} → {item.playedNote ?? "-"}
              </Text>

              <Text
                style={{
                  color: "#9CA3AF",
                  marginTop: 3,
                  fontSize: 12,
                }}
              >
                Beklenen: {item.expectedStart}s
                {item.playedStart !== null
                  ? ` / Çalınan: ${item.playedStart}s`
                  : ""}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: `${color}18`,
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color,
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}