// app/record/[songId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import {
    MetronomeCard,
    type RecordingPhase,
} from "@/src/components/recording/MetronomeCard";
import { OriginalAudioCard } from "@/src/components/recording/OriginalAudioCard";
import { RecordingHeader } from "@/src/components/recording/RecordingHeader";
import { RecordingReadyCard } from "@/src/components/recording/RecordingReadyCard";
import { SendToAnalysisButton } from "@/src/components/recording/SendToAnalysisButton";
import { useAuth } from "@/src/context/AuthContext";
import { useAppAlert } from "@/src/hooks/useAppAlert";
import { submitRecordingForAnalysis } from "@/src/services/analysisSubmissionService";
import { getSongById } from "@/src/services/songService";
import { getStorageFileUrl } from "@/src/services/storageService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { Song } from "@/src/types/song";
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioPlayer,
    useAudioPlayerStatus,
    useAudioRecorder,
    useAudioRecorderState,
} from "expo-audio";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

const metronomeTickSource = require("@/src/assets/sound/metronome-tick.wav");

export default function RecordingScreen() {
    return (
        <AuthGate>
            <RecordingScreenContent />
        </AuthGate>
    );
}

function RecordingScreenContent() {
    const { user } = useAuth();
    const { colors, theme } = useAppTheme();
    const { showAlert } = useAppAlert();

    const router = useRouter();
    const { songId } = useLocalSearchParams<{ songId: string }>();

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    const recorderPreparedRef = useRef(false);
    const countInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const visualMetronomeTimerRef =
        useRef<ReturnType<typeof setInterval> | null>(null);
    const countInActiveRef = useRef(false);

    const [song, setSong] = useState<Song | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [screenLoading, setScreenLoading] = useState(true);
    const [originalLoading, setOriginalLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [recordedUri, setRecordedUri] = useState<string | null>(null);
    const [recordedDurationMillis, setRecordedDurationMillis] = useState(0);
    const [recordingPhase, setRecordingPhase] =
        useState<RecordingPhase>("idle");
    const [currentBeat, setCurrentBeat] = useState(1);

    const [submitting, setSubmitting] = useState(false);
    const [submitStep, setSubmitStep] = useState<
        "idle" | "uploading" | "creatingJob"
    >("idle");

    const originalSource = useMemo(() => {
        if (!originalUrl) return null;
        return { uri: originalUrl };
    }, [originalUrl]);

    const originalPlayer = useAudioPlayer(originalSource);
    const originalStatus = useAudioPlayerStatus(originalPlayer);

    const tickPlayer = useAudioPlayer(metronomeTickSource);

    const bpm = song?.bpm ?? 80;
    const beatsBeforeRecording = song?.beatsBeforeRecording ?? 4;
    const beatDurationMs = 60000 / bpm;

    // 4. tick sesinin duyulması için küçük pay.
    // Eski sistemdeki gibi tam 1 beat beklemiyoruz.
    const lastTickAudibleDelayMs = Math.min(
        180,
        Math.max(120, beatDurationMs * 0.2)
    );

    const liveDurationMillis = recorderState.durationMillis ?? 0;
    const durationMillis =
        recordingPhase === "recorded" ? recordedDurationMillis : liveDurationMillis;
    const durationSeconds = Math.floor(durationMillis / 1000);

    function logRecorderState(label: string) {
        console.log(`[RecordingScreen] ${label}`, {
            phase: recordingPhase,
            recorderPrepared: recorderPreparedRef.current,
            liveDurationMillis: recorderState.durationMillis,
            recordedDurationMillis,
            recorderIsRecording: recorderState.isRecording,
            recorderUri: audioRecorder.uri,
            recordedUri,
            currentBeat,
            bpm,
            beatsBeforeRecording,
            beatDurationMs,
        });
    }

    function clearCountInTimer() {
        if (countInTimerRef.current) {
            clearTimeout(countInTimerRef.current);
            countInTimerRef.current = null;
        }
    }

    function clearVisualMetronomeTimer() {
        if (visualMetronomeTimerRef.current) {
            clearInterval(visualMetronomeTimerRef.current);
            visualMetronomeTimerRef.current = null;
        }
    }

    function clearMetronomeTimers() {
        clearCountInTimer();
        clearVisualMetronomeTimer();
    }

    function playTick() {
        try {
            tickPlayer.seekTo(0);
            tickPlayer.play();

            console.log("[RecordingScreen] Tick played", {
                currentBeat,
                countInActive: countInActiveRef.current,
            });
        } catch (error) {
            console.log("[RecordingScreen] Metronome tick error:", error);
        }
    }

    function startSilentVisualMetronome() {
        clearVisualMetronomeTimer();

        setCurrentBeat(1);

        console.log("[RecordingScreen] Silent visual metronome started", {
            beatDurationMs,
            beatsBeforeRecording,
        });

        visualMetronomeTimerRef.current = setInterval(() => {
            setCurrentBeat((previousBeat) => {
                if (previousBeat >= beatsBeforeRecording) {
                    return 1;
                }

                return previousBeat + 1;
            });
        }, beatDurationMs);
    }

    async function beginRecordingAfterCountIn() {
        try {
            console.log("[RecordingScreen] beginRecordingAfterCountIn called", {
                countInActive: countInActiveRef.current,
                recorderPrepared: recorderPreparedRef.current,
                recorderUriBeforePrepare: audioRecorder.uri,
            });

            if (!countInActiveRef.current) {
                console.log(
                    "[RecordingScreen] beginRecordingAfterCountIn ignored because count-in is not active"
                );
                return;
            }

            countInActiveRef.current = false;
            clearCountInTimer();

            try {
                tickPlayer.pause();
                tickPlayer.seekTo(0);
            } catch {
                // Ignore tick cleanup errors.
            }

            console.log(
                "[RecordingScreen] Switching audio mode to recording mode after count-in"
            );

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });

            console.log("[RecordingScreen] Preparing recorder after count-in...");

            await audioRecorder.prepareToRecordAsync();
            recorderPreparedRef.current = true;

            console.log("[RecordingScreen] Recorder prepared. Starting record...", {
                recorderUriAfterPrepare: audioRecorder.uri,
            });

            audioRecorder.record();

            setRecordingPhase("recording");
            startSilentVisualMetronome();

            console.log("[RecordingScreen] Recording started after count-in", {
                recorderPrepared: recorderPreparedRef.current,
                recorderUriAfterStart: audioRecorder.uri,
            });
        } catch (error) {
            console.log("[RecordingScreen] Begin recording after count-in error:", error);

            countInActiveRef.current = false;
            recorderPreparedRef.current = false;
            clearMetronomeTimers();
            setRecordingPhase("idle");
            setCurrentBeat(1);

            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: false,
                    shouldRouteThroughEarpiece: false,
                    shouldPlayInBackground: false,
                    interruptionMode: "doNotMix",
                });
            } catch (audioModeError) {
                console.log(
                    "[RecordingScreen] Failed to restore playback audio mode after record start error:",
                    audioModeError
                );
            }

            Alert.alert("Hata", "Kayıt başlatılamadı.");
        }
    }

    function runCountInBeat(beat: number) {
        if (!countInActiveRef.current) {
            console.log("[RecordingScreen] runCountInBeat ignored", {
                beat,
                countInActive: countInActiveRef.current,
            });
            return;
        }

        console.log("[RecordingScreen] Count-in beat", {
            beat,
            beatsBeforeRecording,
            beatDurationMs,
            lastTickAudibleDelayMs,
        });

        setCurrentBeat(beat);
        playTick();

        if (beat >= beatsBeforeRecording) {
            console.log(
                "[RecordingScreen] Last count-in beat reached. Letting last tick be audible before recording.",
                {
                    beat,
                    beatsBeforeRecording,
                    delayBeforeRecordingMs: lastTickAudibleDelayMs,
                }
            );

            countInTimerRef.current = setTimeout(() => {
                beginRecordingAfterCountIn();
            }, lastTickAudibleDelayMs);

            return;
        }

        countInTimerRef.current = setTimeout(() => {
            runCountInBeat(beat + 1);
        }, beatDurationMs);
    }

    useEffect(() => {
        const configureAudio = async () => {
            try {
                console.log("[RecordingScreen] Initial audio mode configure");

                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: false,
                    shouldRouteThroughEarpiece: false,
                    shouldPlayInBackground: false,
                    interruptionMode: "doNotMix",
                });

                console.log("[RecordingScreen] Initial audio mode configured");
            } catch (error) {
                console.log("[RecordingScreen] Initial audio mode error:", error);
            }
        };

        configureAudio();
    }, []);

    useEffect(() => {
        async function prepare() {
            try {
                setScreenLoading(true);

                console.log("[RecordingScreen] Screen prepare started", {
                    songId,
                });

                if (!songId) {
                    Alert.alert("Hata", "Parça bilgisi bulunamadı.");
                    router.back();
                    return;
                }

                const selectedSong = await getSongById(songId);

                if (!selectedSong) {
                    Alert.alert("Hata", "Seçilen parça bulunamadı.");
                    router.back();
                    return;
                }

                console.log("[RecordingScreen] Song loaded", {
                    songId,
                    title: selectedSong.title,
                    bpm: selectedSong.bpm,
                    beatsBeforeRecording: selectedSong.beatsBeforeRecording,
                    originalAudioPath: selectedSong.originalAudioPath,
                });

                setSong(selectedSong);

                setOriginalLoading(true);
                const url = await getStorageFileUrl(selectedSong.originalAudioPath);
                setOriginalUrl(url);
                setOriginalLoading(false);

                console.log("[RecordingScreen] Original audio URL loaded", {
                    hasUrl: Boolean(url),
                });

                const permission = await AudioModule.requestRecordingPermissionsAsync();

                console.log("[RecordingScreen] Microphone permission result", {
                    granted: permission.granted,
                    canAskAgain: permission.canAskAgain,
                    status: permission.status,
                });

                if (!permission.granted) {
                    setPermissionGranted(false);

                    Alert.alert(
                        "Mikrofon izni gerekli",
                        "Kayıt alabilmek için mikrofon izni vermelisin."
                    );

                    return;
                }

                setPermissionGranted(true);

                // Önemli:
                // Ekran hazırlanırken kayıt moduna geçmiyoruz.
                // Count-in sırasında da kayıt modu kapalı kalacak.
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: false,
                    shouldRouteThroughEarpiece: false,
                    shouldPlayInBackground: false,
                    interruptionMode: "doNotMix",
                });

                console.log("[RecordingScreen] Screen prepare completed in playback mode");
            } catch (error) {
                console.log("[RecordingScreen] Recording screen prepare error:", error);

                Alert.alert("Hata", "Kayıt ekranı hazırlanırken bir sorun oluştu.");
            } finally {
                setOriginalLoading(false);
                setScreenLoading(false);
            }
        }

        prepare();
    }, [router, songId]);

    useEffect(() => {
        return () => {
            console.log("[RecordingScreen] Cleanup on unmount");

            countInActiveRef.current = false;
            clearMetronomeTimers();

            try {
                originalPlayer.pause();
                tickPlayer.pause();
            } catch {
                // Ignore cleanup audio errors.
            }
        };
    }, [originalPlayer, tickPlayer]);



    const playOriginal = async () => {
        try {
            console.log("[RecordingScreen] playOriginal pressed", {
                hasOriginalUrl: Boolean(originalUrl),
                recordingPhase,
                originalPlaying: originalStatus.playing,
            });

            if (!originalUrl) {
                Alert.alert("Hata", "Orijinal ses dosyası bulunamadı.");
                return;
            }

            if (recordingPhase === "countIn" || recordingPhase === "recording") {
                Alert.alert(
                    "Kayıt hazırlanıyor",
                    "Orijinal melodiyi dinlemek için önce kayıt akışını durdurmalısın."
                );
                return;
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });

            originalPlayer.seekTo(0);
            originalPlayer.play();

            console.log("[RecordingScreen] Original audio started");
        } catch (error) {
            console.log("[RecordingScreen] Play original error:", error);
            Alert.alert("Hata", "Orijinal melodi oynatılamadı.");
        }
    };

    const pauseOriginal = async () => {
        try {
            console.log("[RecordingScreen] pauseOriginal pressed");

            originalPlayer.pause();

            console.log("[RecordingScreen] Original audio paused");
        } catch (error) {
            console.log("[RecordingScreen] Pause original error:", error);
        }
    };

    const startCountInAndRecording = async () => {
        try {
            console.log("[RecordingScreen] startCountInAndRecording pressed", {
                permissionGranted,
                submitting,
                originalPlaying: originalStatus.playing,
                currentPhase: recordingPhase,
            });

            if (!permissionGranted) {
                Alert.alert(
                    "Mikrofon izni gerekli",
                    "Kayıt alabilmek için mikrofon izni vermelisin."
                );
                return;
            }

            if (submitting) return;

            if (originalStatus.playing) {
                originalPlayer.pause();
                console.log("[RecordingScreen] Original audio paused before count-in");
            }

            countInActiveRef.current = false;
            clearMetronomeTimers();

            setRecordedUri(null);
            setRecordedDurationMillis(0);
            setCurrentBeat(1);
            setRecordingPhase("countIn");

            // Kritik değişiklik:
            // Count-in sırasında kayıt modu açılmıyor.
            // Böylece iOS'ta metronom sesinin ahizeye düşme ihtimalini azaltıyoruz.
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });

            recorderPreparedRef.current = false;

            console.log("[RecordingScreen] Count-in started in playback mode", {
                bpm,
                beatsBeforeRecording,
                beatDurationMs,
                lastTickAudibleDelayMs,
            });

            countInActiveRef.current = true;
            runCountInBeat(1);
        } catch (error) {
            console.log("[RecordingScreen] Start count-in recording error:", error);

            countInActiveRef.current = false;
            clearMetronomeTimers();
            setRecordingPhase("idle");
            setCurrentBeat(1);

            Alert.alert("Hata", "Kayıt hazırlığı başlatılamadı.");
        }
    };

    const cancelCountIn = async () => {
        try {
            console.log("[RecordingScreen] cancelCountIn pressed");

            countInActiveRef.current = false;
            clearMetronomeTimers();

            try {
                tickPlayer.pause();
                tickPlayer.seekTo(0);
            } catch {
                // Tick player cleanup error can be ignored.
            }

            // Artık count-in sırasında recorder hazırlanmadığı için stop çağırmıyoruz.
            recorderPreparedRef.current = false;

            setRecordedUri(null);
            setRecordedDurationMillis(0);
            setCurrentBeat(1);
            setRecordingPhase("idle");

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });

            console.log("[RecordingScreen] Count-in cancelled and audio mode restored");
        } catch (error) {
            console.log("[RecordingScreen] Cancel count-in error:", error);
        }
    };

    const stopRecording = async () => {
        try {
            const durationMillisBeforeStop = recorderState.durationMillis ?? 0;
            const durationSecondsBeforeStop = Math.floor(durationMillisBeforeStop / 1000);

            console.log("[RecordingScreen] stopRecording pressed", {
                durationMillisBeforeStop,
                durationSecondsBeforeStop,
                isRecordingBeforeStop: recorderState.isRecording,
                recorderUriBeforeStop: audioRecorder.uri,
            });

            clearVisualMetronomeTimer();

            await audioRecorder.stop();
            recorderPreparedRef.current = false;

            const uri = audioRecorder.uri;

            console.log("[RecordingScreen] Recording stopped", {
                uri,
                durationMillisBeforeStop,
                durationSecondsBeforeStop,
                durationMillisAfterStop: recorderState.durationMillis,
            });

            if (!uri) {
                setRecordingPhase("idle");

                Alert.alert("Hata", "Kayıt dosyası oluşturulamadı.");
                return;
            }

            setRecordedUri(uri);
            setRecordedDurationMillis(durationMillisBeforeStop);
            setRecordingPhase("recorded");
            setCurrentBeat(1);

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });

            console.log("[RecordingScreen] Audio mode restored after stop", {
                recordedUri: uri,
                recordedDurationMillis: durationMillisBeforeStop,
                recordedDurationSeconds: durationSecondsBeforeStop,
            });
        } catch (error) {
            console.log("[RecordingScreen] Stop recording error:", error);
            Alert.alert("Hata", "Kayıt durdurulamadı.");
        }
    };

    const handleMetronomePrimaryPress = () => {
        console.log("[RecordingScreen] Metronome primary pressed", {
            recordingPhase,
        });

        if (recordingPhase === "countIn") {
            cancelCountIn();
            return;
        }

        if (recordingPhase === "recording") {
            stopRecording();
            return;
        }

        startCountInAndRecording();
    };

    const handleBackPress = () => {
        console.log("[RecordingScreen] Back pressed", {
            recordingPhase,
        });

        if (recordingPhase === "countIn") {
            Alert.alert(
                "Hazırlık devam ediyor",
                "Geri dönmeden önce hazırlığı iptal etmelisin."
            );
            return;
        }

        if (recordingPhase === "recording") {
            Alert.alert(
                "Kayıt devam ediyor",
                "Geri dönmeden önce kaydı durdurmalısın."
            );
            return;
        }

        router.back();
    };

    const handleSendToAnalysis = async () => {
        try {
            console.log("[RecordingScreen] Send to analysis pressed", {
                hasUser: Boolean(user),
                songId,
                hasSong: Boolean(song),
                recordedUri,
                durationMillis,
                durationSeconds,
                recorderUri: audioRecorder.uri,
                submitStep,
            });

            if (!user) {
                Alert.alert("Hata", "Kullanıcı oturumu bulunamadı.");
                return;
            }

            if (!song) {
                Alert.alert("Hata", "Parça bilgisi bulunamadı.");
                return;
            }

            if (!songId) {
                Alert.alert("Hata", "Parça ID bilgisi bulunamadı.");
                return;
            }

            if (!recordedUri) {
                Alert.alert("Kayıt yok", "Önce bir kayıt oluşturmalısın.");
                return;
            }

            setSubmitting(true);
            setSubmitStep("creatingJob");
            console.log("[RecordingScreen] Recorded file before submit", {
                uri: recordedUri,
                durationMillis,
                durationSeconds,
            });

            console.log("[RecordingScreen] Submitting recording for analysis", {
                userId: user.uid,
                songId,
                localUri: recordedUri,
                durationMillis,
                durationSeconds,
            });

            const { jobId } = await submitRecordingForAnalysis({
                userId: user.uid,
                songId,
                localUri: recordedUri,
            });

            console.log("[RecordingScreen] Analysis job created", {
                jobId,
            });

            router.replace({
                pathname: "/processing/[jobId]",
                params: { jobId },
            });
        } catch (error) {
            console.log("[RecordingScreen] Send to analysis error:", error);

            setSubmitting(false);
            setSubmitStep("idle");

            showAlert({
                type: "error",
                title: "Analiz başlatılamadı",
                message:
                    "Analiz ekranı hazırlanırken bir sorun oluştu. Lütfen tekrar dene.",
            });
        }
    };

    if (screenLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                <ActivityIndicator size="large" color={colors.primary} />

                <Text style={{ marginTop: 12, color: colors.mutedText }}>
                    Çalışma ekranı hazırlanıyor...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: colors.background,
            }}
            contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 64,
                paddingBottom: 36,
            }}
        >
            <RecordingHeader
                title={song?.title ?? "Egzersiz"}
                description={song?.description}
                isDark={theme === "dark" ? true : false}
                onBackPress={handleBackPress}
                colors={colors}
            />

            <OriginalAudioCard
                isPlaying={originalStatus.playing}
                isLoading={originalLoading}
                disabled={
                    !originalUrl ||
                    submitting ||
                    recordingPhase === "countIn" ||
                    recordingPhase === "recording"
                }
                onPress={originalStatus.playing ? pauseOriginal : playOriginal}
                colors={colors}
            />

            <MetronomeCard
                bpm={bpm}
                beatsBeforeRecording={beatsBeforeRecording}
                currentBeat={currentBeat}
                phase={recordingPhase}
                disabled={!permissionGranted || submitting}
                durationSeconds={durationSeconds}
                onPrimaryPress={handleMetronomePrimaryPress}
                colors={colors}
            />

            {recordedUri ? <RecordingReadyCard colors={colors} /> : null}

            <SendToAnalysisButton
                disabled={
                    !recordedUri ||
                    recordingPhase === "countIn" ||
                    recordingPhase === "recording" ||
                    submitting
                }
                submitting={submitting}
                submitStep={submitStep}
                onPress={handleSendToAnalysis}
                colors={colors}
            />
        </ScrollView>
    );
}