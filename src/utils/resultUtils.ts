// src/utils/resultUtils.ts

import type { AppColors } from "@/src/theme/colors";
import type {
    AnalysisJob,
    AnalysisResult,
    AnalysisResultItem,
    AnalysisResultItemStatus,
} from "@/src/types/analysisJob";

export function alpha(hex: string, opacity: number) {
  const sanitized = hex.replace("#", "");

  if (sanitized.length !== 6) return hex;

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function safeNumber(value: number | null | undefined, fallback = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
}

export function formatScore(value: number | null | undefined) {
  return `%${Math.round(safeNumber(value))}`;
}

export function formatSeconds(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(2)}s`;
}

export function getScoreColor(score: number, colors: AppColors) {
  if (score >= 85) return colors.scoreExcellent;
  if (score >= 70) return colors.scoreGood;
  if (score >= 50) return colors.scoreMedium;
  return colors.scoreWeak;
}

export function getScoreTitle(score: number) {
  if (score >= 85) return "Harika performans";
  if (score >= 70) return "İyi gidiyorsun";
  if (score >= 50) return "Gelişiyor";
  return "Tekrar çalışmaya değer";
}

export function getMainFeedback(job: AnalysisJob) {
  const result = job.result;

  if (!result) return "";

  const pitchScore = safeNumber(result.pitchScore);
  const timingScore = safeNumber(result.timingScore);

  if (pitchScore >= 90 && timingScore >= 80) {
    return "Notaların ve zamanlaman oldukça iyi görünüyor. Bu performansı koruyup aynı parçayı daha akıcı çalmaya odaklanabilirsin.";
  }

  if (pitchScore >= 80 && timingScore < 70) {
    return "Notaları büyük ölçüde doğru çaldın. Şimdi asıl odaklanman gereken taraf zamanlama.";
  }

  if (pitchScore < 70 && result.wrongNotes > 0) {
    return "Bazı notalarda hata var. Aşağıdaki detaylardan hangi notaların değiştiğini net şekilde görebilirsin.";
  }

  if (result.missedNotes > 0) {
    return "Bazı notaları kaçırmış görünüyorsun. Parçayı daha küçük bölümlere ayırarak tekrar çalışmak iyi olur.";
  }

  if (result.extraNotes > 0) {
    return "Melodiye fazladan notalar eklenmiş. Daha sade, kontrollü ve yavaş çalmayı deneyebilirsin.";
  }

  return "Kaydın analiz edildi. Detaylardan güçlü ve zayıf noktalarını görebilirsin.";
}

export function getFocusArea(result: AnalysisResult) {
  const pitchScore = safeNumber(result.pitchScore);
  const timingScore = safeNumber(result.timingScore);

  if (timingScore < pitchScore - 8) {
    return {
      title: "Odak: Zamanlama",
      description:
        "Notalar fena değil, ama giriş zamanlarını daha dengeli yapman gerekiyor.",
      iconName: "time-outline" as const,
    };
  }

  if (result.wrongNotes > 0) {
    return {
      title: "Odak: Nota doğruluğu",
      description:
        "Bazı notalar beklenen melodiden farklı. Önce yavaş tempoda doğru notaları oturt.",
      iconName: "musical-notes-outline" as const,
    };
  }

  if (result.missedNotes > 0) {
    return {
      title: "Odak: Eksik notalar",
      description:
        "Bazı notalar çalınmamış görünüyor. Parçayı küçük parçalara bölerek çalış.",
      iconName: "remove-circle-outline" as const,
    };
  }

  if (result.extraNotes > 0) {
    return {
      title: "Odak: Kontrol",
      description: "Fazladan notalar var. Daha sade ve temiz çalmaya odaklan.",
      iconName: "add-circle-outline" as const,
    };
  }

  return {
    title: "Dengeli performans",
    description:
      "Belirgin bir zayıf alan görünmüyor. Aynı parçayı daha akıcı çalmaya çalış.",
    iconName: "checkmark-circle-outline" as const,
  };
}

export function getStatusLabel(status: AnalysisResultItemStatus) {
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
      return "Biraz erken";
    case "timingLate":
      return "Biraz geç";
    default:
      return status;
  }
}

export function getStatusDescription(item: AnalysisResultItem) {
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

export function getStatusColor(
  status: AnalysisResultItemStatus,
  colors: AppColors,
) {
  switch (status) {
    case "correct":
      return colors.correctNote;
    case "wrongNote":
      return colors.wrongNote;
    case "missed":
      return colors.missedNote;
    case "extra":
      return colors.extraNote;
    case "timingEarly":
      return colors.timingEarly;
    case "timingLate":
      return colors.timingLate;
    default:
      return colors.mutedText;
  }
}

export function getStatusIcon(status: AnalysisResultItemStatus) {
  switch (status) {
    case "correct":
      return "checkmark" as const;
    case "wrongNote":
      return "close" as const;
    case "missed":
      return "remove" as const;
    case "extra":
      return "add" as const;
    case "timingEarly":
    case "timingLate":
      return "time" as const;
    default:
      return "ellipse" as const;
  }
}
