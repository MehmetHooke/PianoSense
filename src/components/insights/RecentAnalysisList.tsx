// src\components\insights\RecentAnalysisList.tsx
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import { Text, View } from "react-native";
import { RecentAnalysisCard } from "./RecentAnalysisCard";

type Props = {
  jobs: AnalysisJob[];
  onOpenJob: (jobId: string) => void;
};

export function RecentAnalysisList({ jobs, onOpenJob }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={{ marginTop: 22 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "900",
              letterSpacing: -0.3,
            }}
          >
            Son Analizler
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              marginTop: 3,
            }}
          >
            Tamamlanan tüm çalışmaların
          </Text>
        </View>

        <Text
          style={{
            color: colors.primary,
            fontSize: 12,
            fontWeight: "900",
          }}
        >
          {jobs.length} sonuç
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {jobs.map((job, index) => (
          <RecentAnalysisCard
            key={job.id}
            job={job}
            index={index}
            onPress={() => onOpenJob(job.id)}
          />
        ))}
      </View>
    </View>
  );
}