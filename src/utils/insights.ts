// src\utils\insights.ts
import type { AnalysisJob } from "@/src/types/analysisJob";

export type WeakArea = "pitch" | "timing" | "missed" | "extra" | "none";

export type InsightsSummary = {
  totalAnalyses: number;
  averageScore: number;
  averagePitchScore: number;
  averageTimingScore: number;
  weakestArea: WeakArea;
  lastActivityAt?: Date | null;
  lastActivityText?: string;
};

function round(value: number) {
  return Math.round(value);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}

function getRelativeDateText(date: Date | null) {
  if (!date) return undefined;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Az önce";
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function getJobActivityDate(job: AnalysisJob) {
  return (
    toDate(job.completedAt) ?? toDate(job.updatedAt) ?? toDate(job.createdAt)
  );
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
      lastActivityAt: null,
      lastActivityText: undefined,
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

  const latestJob = [...completedJobs].sort((a, b) => {
    const dateA = getJobActivityDate(a)?.getTime() ?? 0;
    const dateB = getJobActivityDate(b)?.getTime() ?? 0;

    return dateB - dateA;
  })[0];

  const lastActivityAt = latestJob ? getJobActivityDate(latestJob) : null;
  const lastActivityText = getRelativeDateText(lastActivityAt);

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
    lastActivityAt,
    lastActivityText,
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
