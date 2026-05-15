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
import { createAnalysisJob } from "@/src/services/analysisJobService";
import { uploadRecordingAudio } from "@/src/services/audioUploadService";
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
    const { colors } = useAppTheme();
    const recorderPreparedRef = useRef(false);
    const router = useRouter();
    const { songId } = useLocalSearchParams<{ songId: string }>();

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    const [song, setSong] = useState<Song | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [screenLoading, setScreenLoading] = useState(true);
    const [originalLoading, setOriginalLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [recordedUri, setRecordedUri] = useState<string | null>(null);

    const [recordingPhase, setRecordingPhase] =
        useState<RecordingPhase>("idle");
    const [currentBeat, setCurrentBeat] = useState(1);

    const [submitting, setSubmitting] = useState(false);
    const [submitStep, setSubmitStep] = useState<
        "idle" | "uploading" | "creatingJob"
    >("idle");

    const countInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const visualMetronomeTimerRef =
        useRef<ReturnType<typeof setInterval> | null>(null);
    const countInActiveRef = useRef(false);

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

    const durationSeconds = Math.floor((recorderState.durationMillis ?? 0) / 1000);

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
        } catch (error) {
            console.log("Metronome tick error:", error);
        }
    }

    function startSilentVisualMetronome() {
        clearVisualMetronomeTimer();

        setCurrentBeat(1);

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
            if (!countInActiveRef.current) return;

            countInActiveRef.current = false;
            clearCountInTimer();


            audioRecorder.record();
            recorderPreparedRef.current = false;

            setRecordingPhase("recording");
            startSilentVisualMetronome();

            console.log("Recording started after count-in");
        } catch (error) {
            console.log("Begin recording after count-in error:", error);

            countInActiveRef.current = false;
            clearMetronomeTimers();
            setRecordingPhase("idle");
            setCurrentBeat(1);

            Alert.alert("Hata", "Kayıt başlatılamadı.");
        }
    }

    function runCountInBeat(beat: number) {
        if (!countInActiveRef.current) return;

        setCurrentBeat(beat);
        playTick();

        if (beat >= beatsBeforeRecording) {
            countInTimerRef.current = setTimeout(() => {
                beginRecordingAfterCountIn();
            }, beatDurationMs);

            return;
        }

        countInTimerRef.current = setTimeout(() => {
            runCountInBeat(beat + 1);
        }, beatDurationMs);
    }

    useEffect(() => {
        const configureAudio = async () => {
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });
        };

        configureAudio();
    }, []);

    useEffect(() => {
        async function prepare() {
            try {
                setScreenLoading(true);

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

                setSong(selectedSong);

                setOriginalLoading(true);
                const url = await getStorageFileUrl(selectedSong.originalAudioPath);
                setOriginalUrl(url);
                setOriginalLoading(false);

                const permission = await AudioModule.requestRecordingPermissionsAsync();

                if (!permission.granted) {
                    setPermissionGranted(false);

                    Alert.alert(
                        "Mikrofon izni gerekli",
                        "Kayıt alabilmek için mikrofon izni vermelisin."
                    );

                    return;
                }

                setPermissionGranted(true);

                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: true,
                    shouldRouteThroughEarpiece: false,
                    shouldPlayInBackground: false,
                    interruptionMode: "doNotMix",
                });
            } catch (error) {
                console.log("Recording screen prepare error:", error);

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
        } catch (error) {
            console.log("Play original error:", error);
            Alert.alert("Hata", "Orijinal melodi oynatılamadı.");
        }
    };

    const pauseOriginal = async () => {
        try {
            originalPlayer.pause();
        } catch (error) {
            console.log("Pause original error:", error);
        }
    };

    const startCountInAndRecording = async () => {
        try {
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
            }

            countInActiveRef.current = false;
            clearMetronomeTimers();

            setRecordedUri(null);
            setCurrentBeat(1);
            setRecordingPhase("countIn");

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });

            await audioRecorder.prepareToRecordAsync();
            recorderPreparedRef.current = true;

            countInActiveRef.current = true;
            runCountInBeat(1);
        } catch (error) {
            console.log("Start count-in recording error:", error);

            countInActiveRef.current = false;
            clearMetronomeTimers();
            setRecordingPhase("idle");
            setCurrentBeat(1);

            Alert.alert("Hata", "Kayıt hazırlığı başlatılamadı.");
        }
    };

    const cancelCountIn = async () => {
        try {
            countInActiveRef.current = false;
            clearMetronomeTimers();

            try {
                tickPlayer.pause();
                tickPlayer.seekTo(0);
            } catch {
                // Tick player cleanup error can be ignored.
            }

            if (recorderPreparedRef.current) {
                try {
                    await audioRecorder.stop();
                    recorderPreparedRef.current = false;
                } catch (error) {
                    console.log("Cancel count-in recorder stop ignored:", error);
                    recorderPreparedRef.current = true;
                }
            }

            setRecordedUri(null);
            setCurrentBeat(1);
            setRecordingPhase("idle");

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });
        } catch (error) {
            console.log("Cancel count-in error:", error);
        }
    };

    const stopRecording = async () => {
        try {
            clearVisualMetronomeTimer();

            await audioRecorder.stop();
            recorderPreparedRef.current = false;

            const uri = audioRecorder.uri;

            console.log("Recording stopped. URI:", uri);

            if (!uri) {
                setRecordingPhase("idle");

                Alert.alert("Hata", "Kayıt dosyası oluşturulamadı.");
                return;
            }

            setRecordedUri(uri);
            setRecordingPhase("recorded");
            setCurrentBeat(1);

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });
        } catch (error) {
            console.log("Stop recording error:", error);
            Alert.alert("Hata", "Kayıt durdurulamadı.");
        }
    };

    const handleMetronomePrimaryPress = () => {
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
            setSubmitStep("uploading");

            const uploadResult = await uploadRecordingAudio({
                userId: user.uid,
                songId,
                localUri: recordedUri,
            });

            setSubmitStep("creatingJob");

            const jobId = await createAnalysisJob({
                songId,
                recordingId: uploadResult.recordingId,
                recordedAudioPath: uploadResult.recordedAudioPath,
            });

            router.replace({
                pathname: "/processing/[jobId]",
                params: { jobId },
            });
        } catch (error) {
            console.log("Send to analysis error:", error);

            Alert.alert(
                "Analiz başlatılamadı",
                "Kayıt analize gönderilirken bir sorun oluştu. Lütfen tekrar dene."
            );
        } finally {
            setSubmitting(false);
            setSubmitStep("idle");
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
                bpm={bpm}
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