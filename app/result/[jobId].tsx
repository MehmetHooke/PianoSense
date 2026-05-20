// app/result/[jobId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { ResultEmptyNotesCard } from "@/src/components/result/ResultEmptyNotesCard";
import { ResultHeroCard } from "@/src/components/result/ResultHeroCard";
import { ResultMetricGrid } from "@/src/components/result/ResultMetricGrid";
import { ResultNoteDetailItem } from "@/src/components/result/ResultNoteDetailItem";
import { ResultScoreBreakdown } from "@/src/components/result/ResultScoreBreakdown";
import { ResultStateView } from "@/src/components/result/ResultStateView";
import { ResultTopBar } from "@/src/components/result/ResultTopBar";
import { getAnalysisJobById } from "@/src/services/analysisJobService";
import { getSongById } from "@/src/services/songService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import type { Song } from "@/src/types/song";
import { getMainFeedback } from "@/src/utils/resultUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";

const goodResultSound = require("@/src/assets/sound/iyiSes_loud.mp3");
const mediumResultSound = require("@/src/assets/sound/ortaSes_loud.mp3");
const badResultSound = require("@/src/assets/sound/kotuSes_loud.mp3");

const RESULT_SOUND_STORAGE_KEY_PREFIX = "pianosense:result-sound-played";

export default function ResultScreen() {
  return (
    <AuthGate>
      <ResultScreenContent />
    </AuthGate>
  );
}

function ResultScreenContent() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const resultSoundAttemptedRef = useRef(false);

  const feedback = useMemo(() => {
    if (!job) return "";
    return getMainFeedback(job);
  }, [job]);

  const resultSoundSource = useMemo(() => {
    const overallScore = job?.result?.overallScore;

    if (typeof overallScore !== "number") {
      return null;
    }

    if (overallScore < 40) {
      return badResultSound;
    }

    if (overallScore <= 60) {
      return mediumResultSound;
    }

    return goodResultSound;
  }, [job?.result?.overallScore]);

  const resultSoundType = useMemo(() => {
    const overallScore = job?.result?.overallScore;

    if (typeof overallScore !== "number") {
      return "none";
    }

    if (overallScore < 40) {
      return "bad";
    }

    if (overallScore <= 60) {
      return "medium";
    }

    return "good";
  }, [job?.result?.overallScore]);

  const resultSoundPlayer = useAudioPlayer(resultSoundSource);
  const resultSoundStatus = useAudioPlayerStatus(resultSoundPlayer);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/insights");
  }

  useEffect(() => {
    let mounted = true;

    async function loadResult() {
      try {
        setLoading(true);
        setLoadError(false);

        console.log("[ResultScreen] Loading result", {
          jobId,
        });

        if (!jobId) {
          setJob(null);
          setSong(null);
          return;
        }

        const foundJob = await getAnalysisJobById(jobId);

        if (!mounted) return;

        console.log("[ResultScreen] Job loaded", {
          jobId: foundJob?.id,
          status: foundJob?.status,
          songId: foundJob?.songId,
          overallScore: foundJob?.result?.overallScore,
          hasResult: Boolean(foundJob?.result),
        });

        setJob(foundJob);

        if (foundJob?.songId) {
          const foundSong = await getSongById(foundJob.songId);

          if (!mounted) return;

          console.log("[ResultScreen] Song loaded", {
            songId: foundJob.songId,
            title: foundSong?.title,
          });

          setSong(foundSong);
        } else {
          setSong(null);
        }
      } catch (error) {
        console.log("[ResultScreen] Load result error:", error);

        if (!mounted) return;

        setLoadError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      mounted = false;
    };
  }, [jobId]);

  useEffect(() => {
    async function playResultSoundOnce() {
      try {
        if (loading) return;
        if (loadError) return;
        if (!jobId) return;
        if (!job?.result) return;
        if (!resultSoundSource) return;

        if (resultSoundAttemptedRef.current) {
          console.log("[ResultScreen] Result sound skipped in current mount", {
            jobId,
          });
          return;
        }

        resultSoundAttemptedRef.current = true;

        const storageKey = `${RESULT_SOUND_STORAGE_KEY_PREFIX}:${jobId}`;
        const alreadyPlayed = await AsyncStorage.getItem(storageKey);

        console.log("[ResultScreen] Result sound check", {
          jobId,
          storageKey,
          alreadyPlayed,
          overallScore: job.result.overallScore,
          resultSoundType,
        });

        if (alreadyPlayed === "true") {
          console.log("[ResultScreen] Result sound already played for this job", {
            jobId,
          });
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
          shouldRouteThroughEarpiece: false,
          shouldPlayInBackground: false,
          interruptionMode: "doNotMix",
        });

        console.log("[ResultScreen] Playing result sound", {
          jobId,
          overallScore: job.result.overallScore,
          resultSoundType,
        });

        resultSoundPlayer.seekTo(0);
        resultSoundPlayer.play();

        await AsyncStorage.setItem(storageKey, "true");

        console.log("[ResultScreen] Result sound marked as played", {
          jobId,
          storageKey,
        });
      } catch (error) {
        console.log("[ResultScreen] Play result sound once error:", error);
      }
    }

    playResultSoundOnce();
  }, [
    loading,
    loadError,
    jobId,
    job,
    resultSoundSource,
    resultSoundPlayer,
    resultSoundType,
  ]);

  useEffect(() => {
    console.log("[ResultScreen] Result sound status changed", {
      playing: resultSoundStatus.playing,
      currentTime: resultSoundStatus.currentTime,
      duration: resultSoundStatus.duration,
      resultSoundType,
    });
  }, [
    resultSoundStatus.playing,
    resultSoundStatus.currentTime,
    resultSoundStatus.duration,
    resultSoundType,
  ]);

  useEffect(() => {
    return () => {
      try {
        resultSoundPlayer.pause();
      } catch {
        // Ignore cleanup audio errors.
      }
    };
  }, [resultSoundPlayer]);

  if (loading) {
    return (
      <ResultStateView
        colors={colors}
        type="loading"
        title="Sonuç hazırlanıyor"
        description="Performans detayların yükleniyor. Birkaç saniye içinde sonucu göreceksin."
      />
    );
  }

  if (loadError) {
    return (
      <ResultStateView
        colors={colors}
        type="error"
        title="Sonuç yüklenemedi"
        description="Analiz sonucu alınırken bir sorun oluştu. Bağlantını kontrol edip tekrar deneyebilirsin."
        actionLabel="Geri dön"
        onActionPress={goBack}
      />
    );
  }

  if (!job || !job.result) {
    return (
      <ResultStateView
        colors={colors}
        type="empty"
        title="Sonuç bulunamadı"
        description="Analiz tamamlanmamış veya sonuç kaydedilememiş olabilir."
        actionLabel="Geri dön"
        onActionPress={goBack}
      />
    );
  }

  const result = job.result;
  const items = result.items ?? [];

  return (
    <FlatList
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 36,
      }}
      data={items}
      keyExtractor={(_, index) => `${job.id}-${index}`}
      ListHeaderComponent={
        <View>
          <ResultTopBar
            colors={colors}
            onBackPress={goBack}
            label={song?.title ?? "ANALİZ SONUCU"}
          />

          <ResultHeroCard job={job} colors={colors} feedback={feedback} />

          <ResultScoreBreakdown result={result} colors={colors} />

          <ResultMetricGrid result={result} colors={colors} />

          <View
            style={{
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 21,
                  fontWeight: "900",
                  letterSpacing: -0.3,
                }}
              >
                Nota Detayları
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 13,
                  lineHeight: 19,
                  marginTop: 3,
                }}
              >
                Hangi notada ne olduğunu buradan takip edebilirsin.
              </Text>
            </View>

            <Text
              style={{
                color: colors.subtleText,
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              {items.length} kayıt
            </Text>
          </View>

          {items.length === 0 ? <ResultEmptyNotesCard colors={colors} /> : null}
        </View>
      }
      renderItem={({ item, index }) => (
        <ResultNoteDetailItem item={item} index={index} colors={colors} />
      )}
    />
  );
}