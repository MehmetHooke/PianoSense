import type { AnalysisJob } from "@/src/types/analysisJob";

export type WeakArea = "pitch" | "timing" | "missed" | "extra" | "none";

export type InsightsSummary = {
  totalAnalyses: number;
  averageScore: number;
  averagePitchScore: number;
  averageTimingScore: number;
  weakestArea: WeakArea;
};

function round(value: number) {
  return Math.round(value);
}

export function calculateInsightsSummary(jobs: AnalysisJob[]): InsightsSummary {
  const completedJobs = jobs.filter(
    (job) => job.status === "completed" && job.result,
  );

  if (completedJobs.length === 0) {
    return {
      totalAnalyses: 0,
      averageScore: 0,
      averagePitchScore: 0,
      averageTimingScore: 0,
      weakestArea: "none",
    };
  }

  const totalAnalyses = completedJobs.length;

  const scoreSum = completedJobs.reduce(
    (sum, job) => sum + (job.result?.overallScore ?? 0),
    0,
  );

  const pitchScoreSum = completedJobs.reduce(
    (sum, job) => sum + (job.result?.pitchScore ?? 0),
    0,
  );

  const timingScoreSum = completedJobs.reduce(
    (sum, job) => sum + (job.result?.timingScore ?? 0),
    0,
  );

  const wrongNotes = completedJobs.reduce(
    (sum, job) => sum + (job.result?.wrongNotes ?? 0),
    0,
  );

  const missedNotes = completedJobs.reduce(
    (sum, job) => sum + (job.result?.missedNotes ?? 0),
    0,
  );

  const extraNotes = completedJobs.reduce(
    (sum, job) => sum + (job.result?.extraNotes ?? 0),
    0,
  );

  const averageScore = round(scoreSum / totalAnalyses);
  const averagePitchScore = round(pitchScoreSum / totalAnalyses);
  const averageTimingScore = round(timingScoreSum / totalAnalyses);

  let weakestArea: WeakArea = "none";

  if (averageTimingScore < averagePitchScore - 8) {
    weakestArea = "timing";
  } else if (
    wrongNotes >= missedNotes &&
    wrongNotes >= extraNotes &&
    wrongNotes > 0
  ) {
    weakestArea = "pitch";
  } else if (
    missedNotes >= wrongNotes &&
    missedNotes >= extraNotes &&
    missedNotes > 0
  ) {
    weakestArea = "missed";
  } else if (extraNotes > 0) {
    weakestArea = "extra";
  }

  return {
    totalAnalyses,
    averageScore,
    averagePitchScore,
    averageTimingScore,
    weakestArea,
  };
}

export function getWeakAreaContent(weakestArea: WeakArea) {
  switch (weakestArea) {
    case "timing":
      return {
        title: "Zamanlama",
        description:
          "En çok zamanlama tarafında zorlanıyorsun. Bir sonraki çalışmada tempoyu daha dikkatli takip et.",
      };

    case "pitch":
      return {
        title: "Nota doğruluğu",
        description:
          "En çok yanlış nota tarafında hata görünüyor. Egzersizi yavaş çalıp doğru notalara odaklanmak iyi olur.",
      };

    case "missed":
      return {
        title: "Kaçırılan notalar",
        description:
          "Bazı notalar kayıtta eksik kalıyor. Parçayı daha küçük bölümlere ayırarak çalışmayı dene.",
      };

    case "extra":
      return {
        title: "Fazla notalar",
        description:
          "Kayıtta fazladan notalar görünüyor. Daha kontrollü ve sade çalmaya odaklanabilirsin.",
      };

    case "none":
    default:
      return {
        title: "Dengeli performans",
        description:
          "Şimdilik belirgin bir zayıf alan görünmüyor. Daha fazla analiz yaptıkça gelişim alanların netleşecek.",
      };
  }
}
