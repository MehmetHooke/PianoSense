// app/processing/[jobId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import {
  listenAnalysisJob,
} from "@/src/services/analysisJobService";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

export default function ProcessingScreen() {
  return (
    <AuthGate>
      <ProcessingScreenContent />
    </AuthGate>
  );
}

function ProcessingScreenContent() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [job, setJob] = useState<AnalysisJob | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = listenAnalysisJob(
      jobId,
      (updatedJob) => {
        setJob(updatedJob);

        if (!updatedJob) {
          Alert.alert("Hata", "Analiz işi bulunamadı.");
          router.replace("/(tabs)");
          return;
        }

        if (updatedJob.status === "completed") {
          router.replace({
            pathname: "/result/[jobId]",
            params: { jobId },
          });
        }

        if (updatedJob.status === "failed") {
          Alert.alert(
            "Analiz başarısız",
            updatedJob.errorMessage ?? "Analiz sırasında bir sorun oluştu."
          );
          router.replace("/(tabs)");
        }
      },
      () => {
        Alert.alert("Hata", "Analiz durumu dinlenirken bir sorun oluştu.");
        router.replace("/(tabs)");
      }
    );

    return unsubscribe;
  }, [jobId, router]);

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
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 32,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <Ionicons name="analytics" size={44} color="#4F46E5" />
      </View>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "900",
          color: "#111827",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Performans analiz ediliyor
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#6B7280",
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 24,
        }}
      >
        Kaydın yüklendi. Şimdi orijinal melodi ile karşılaştırma sonucu
        hazırlanıyor.
      </Text>

      <ActivityIndicator size="large" color="#4F46E5" />

      <Text
        style={{
          marginTop: 18,
          color: "#9CA3AF",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        Job status: {job?.status ?? "loading"}
      </Text>
    </View>
  );
}
