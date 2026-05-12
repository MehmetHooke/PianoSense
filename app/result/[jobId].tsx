// app/result/[jobId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { getAnalysisJobById } from "@/src/services/analysisJobService";
import type { AnalysisJob, AnalysisResultItem } from "@/src/types/analysisJob";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

function getStatusDescription(item: AnalysisResultItem) {
  switch (item.status) {
    case "correct":
      return "Nota ve zamanlama doğru.";
    case "wrongNote":
      return `${item.expectedNote ?? "-"} bekleniyordu, ${item.playedNote ?? "-"} çalındı.`;
    case "missed":
      return `${item.expectedNote ?? "-"} notası çalınmamış görünüyor.`;
    case "extra":
      return `${item.playedNote ?? "-"} fazladan çalınmış görünüyor.`;
    case "timingEarly":
      return `${Math.abs(item.timingOffsetMs ?? 0)} ms erken girdin.`;
    case "timingLate":
      return `${Math.abs(item.timingOffsetMs ?? 0)} ms geç girdin.`;
    default:
      return "";
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

function getStatusIcon(status: AnalysisResultItem["status"]) {
  switch (status) {
    case "correct":
      return "checkmark";
    case "wrongNote":
      return "close";
    case "missed":
      return "remove";
    case "extra":
      return "add";
    case "timingEarly":
    case "timingLate":
      return "time";
    default:
      return "ellipse";
  }
}

function formatSeconds(value: number | null) {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(2)}s`;
}

function getMainFeedback(job: AnalysisJob) {
  const result = job.result;

  if (!result) return "";

  if (result.pitchScore >= 90 && result.timingScore >= 80) {
    return "Harika performans. Notaların ve zamanlaman oldukça iyi görünüyor.";
  }

  if (result.pitchScore >= 80 && result.timingScore < 70) {
    return "Notaları büyük ölçüde doğru çaldın. Şimdi asıl odaklanman gereken şey zamanlama.";
  }

  if (result.pitchScore < 70 && result.wrongNotes > 0) {
    return "Bazı notalarda hata var. Aşağıdaki detaylardan hangi notaların değiştiğini görebilirsin.";
  }

  if (result.missedNotes > 0) {
    return "Bazı notaları kaçırmış görünüyorsun. Özellikle eksik notalara tekrar çalışmak iyi olur.";
  }

  if (result.extraNotes > 0) {
    return "Melodiye fazladan notalar eklenmiş. Daha sade ve kontrollü çalmayı deneyebilirsin.";
  }

  return "Kaydın analiz edildi. Detaylardan güçlü ve zayıf noktalarını görebilirsin.";
}

export default function ResultScreen() {
  return (
    <AuthGate>
      <ResultScreenContent />
    </AuthGate>
  );
}

function ResultScreenContent() {
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

  const feedback = useMemo(() => {
    if (!job) return "";
    return getMainFeedback(job);
  }, [job]);

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
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Sonuç hazırlanıyor...
        </Text>
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

        <Text
          style={{
            marginTop: 8,
            color: "#6B7280",
            lineHeight: 22,
            textAlign: "center",
          }}
        >
          Analiz tamamlanmamış veya sonuç kaydedilememiş olabilir.
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
            {feedback}
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
                  Nota doğruluğu
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
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <MetricCard label="Doğru" value={result.correctNotes} color="#16A34A" />
            <MetricCard label="Yanlış" value={result.wrongNotes} color="#EF4444" />
            <MetricCard label="Kaçan" value={result.missedNotes} color="#F59E0B" />
            <MetricCard label="Fazla" value={result.extraNotes} color="#7C3AED" />
            <MetricCard
              label="Erken"
              value={result.timingEarlyNotes ?? 0}
              color="#2563EB"
            />
            <MetricCard
              label="Geç"
              value={result.timingLateNotes ?? 0}
              color="#2563EB"
            />
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
        const icon = getStatusIcon(item.status);

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
                width: 36,
                height: 36,
                borderRadius: 13,
                backgroundColor: `${color}18`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={icon as any} size={18} color={color} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#111827",
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                {item.expectedNote ?? "-"} → {item.playedNote ?? "-"}
              </Text>

              <Text
                style={{
                  color: "#6B7280",
                  marginTop: 3,
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                {getStatusDescription(item)}
              </Text>

              <Text
                style={{
                  color: "#9CA3AF",
                  marginTop: 3,
                  fontSize: 12,
                }}
              >
                Beklenen: {formatSeconds(item.expectedStart)}
                {item.playedStart !== null
                  ? ` / Çalınan: ${formatSeconds(item.playedStart)}`
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

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View
      style={{
        width: "31%",
        minWidth: 96,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <Text style={{ color: "#6B7280", fontSize: 12 }}>{label}</Text>
      <Text
        style={{
          color,
          fontSize: 22,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}