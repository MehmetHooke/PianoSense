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
import { getExerciseTitle } from "@/src/constants/exerciseNames";
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
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";

const metronomeTickSource = require("@/src/assets/sound/metronom-tick.wav");


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

    const isIOS = Platform.OS === "ios";

    const router = useRouter();
    const { songId } = useLocalSearchParams<{ songId: string }>();

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    const recorderPreparedRef = useRef(false);
    const countInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const visualMetronomeTimerRef =
        useRef<ReturnType<typeof setInterval> | null>(null);
    const countInActiveRef = useRef(false);

    const visualBeatDelayTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);




    const lastAudibleTickAtRef = useRef<number | null>(null);
    const lastTickFinishedResolverRef = useRef<(() => void) | null>(null);

    const [song, setSong] = useState<Song | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [screenLoading, setScreenLoading] = useState(true);
    const [originalLoading, setOriginalLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [recordedUri, setRecordedUri] = useState<string | null>(null);
    const [recordedDurationMillis, setRecordedDurationMillis] = useState(0);
    const [recordingPhase, setRecordingPhase] =
        useState<RecordingPhase>("idle");
    const [originalPlayingUi, setOriginalPlayingUi] = useState(false);
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

    const tickPlayer = useAudioPlayer(
        metronomeTickSource,
        { downloadFirst: true }
    );
    const tickWarmedUpRef = useRef(false);

    async function warmUpTickPlayerForAndroid() {
        if (isIOS) return;
        if (tickWarmedUpRef.current) return;
        if (!tickStatus.isLoaded) return;

        try {
            console.log("[RecordingScreen][Android] Tick warm-up started");

            const originalVolume = tickPlayer.volume;

            tickPlayer.volume = 0;

            await tickPlayer.seekTo(0);
            tickPlayer.play();

            await new Promise<void>((resolve) => {
                setTimeout(resolve, 100);
            });

            tickPlayer.pause();
            await tickPlayer.seekTo(0);

            tickPlayer.volume = originalVolume;

            tickWarmedUpRef.current = true;

            console.log("[RecordingScreen][Android] Tick warm-up completed");
        } catch (error) {
            console.log(
                "[RecordingScreen][Android] Tick warm-up error:",
                error
            );

            // Volume yanlışlıkla 0'da kalmasın.
            tickPlayer.volume = 1;
        }
    }

    const tickStatus = useAudioPlayerStatus(tickPlayer);



    const bpm = song?.bpm ?? 80;
    const beatsPerMeasure = song?.beatsPerMeasure ?? 4;
    const beatsBeforeRecording = song?.beatsBeforeRecording ?? beatsPerMeasure;
    const beatDurationMs = 60000 / bpm;

    const lastTickPlaybackGraceMs = isIOS
        ? 220
        : Math.min(
            180,
            Math.max(120, beatDurationMs * 0.2)
        );


    // Son tick sesinin duyulması için playback modunda kısa süre kal.
    // Bu süre kayıt başlangıç zamanı değildir.


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

        if (visualBeatDelayTimerRef.current) {
            clearTimeout(visualBeatDelayTimerRef.current);
            visualBeatDelayTimerRef.current = null;
        }
    }

    useEffect(() => {
        const subscription = tickPlayer.addListener(
            "playbackStatusUpdate",
            (status) => {
                if (status.didJustFinish && lastTickFinishedResolverRef.current) {
                    console.log("[RecordingScreen] Last tick really finished", {
                        currentTime: status.currentTime,
                    });

                    const resolve = lastTickFinishedResolverRef.current;
                    lastTickFinishedResolverRef.current = null;

                    resolve();
                }

            }
        );

        return () => {
            subscription.remove();
        };
    }, [tickPlayer]);


    async function playTick(beat: number) {
        try {
            console.log("[RecordingScreen] Tick play", {
                beat,
                isLoaded: tickStatus.isLoaded,
                playbackState: tickStatus.playbackState,
            });

            await tickPlayer.seekTo(0);
            tickPlayer.play();
        } catch (error) {
            console.log("[RecordingScreen] Metronome tick error:", error);
        }
    }
    function waitForLastTickToFinish() {
        return new Promise<void>((resolve) => {
            let finished = false;

            const finish = () => {
                if (finished) return;

                finished = true;

                if (lastTickFinishedResolverRef.current === finish) {
                    lastTickFinishedResolverRef.current = null;
                }

                clearTimeout(fallbackTimer);
                resolve();
            };

            // Native didJustFinish event'i gelmezse count-in kilitlenmesin.
            const fallbackTimer = setTimeout(() => {
                console.log(
                    "[RecordingScreen] Last tick finish fallback triggered"
                );

                finish();
            }, 250);

            lastTickFinishedResolverRef.current = finish;
        });
    }

    function startSilentVisualMetronome() {
        clearVisualMetronomeTimer();

        setCurrentBeat(1);

        console.log("[RecordingScreen] Silent visual metronome started", {
            beatDurationMs,
            beatsPerMeasure,
        });

        visualMetronomeTimerRef.current = setInterval(() => {
            setCurrentBeat((previousBeat) => {
                if (previousBeat >= beatsPerMeasure) {
                    return 1;
                }

                return previousBeat + 1;
            });
        }, beatDurationMs);
    }

    async function beginIOSRecordingAfterCountIn(
        recordingTargetAtMs: number
    ) {
        try {
            console.log(
                "[RecordingScreen][iOS] beginIOSRecordingAfterCountIn called",
                {
                    recordingTargetAtMs,
                    now: Date.now(),
                    countInActive: countInActiveRef.current,
                    beatDurationMs,
                    lastTickPlaybackGraceMs,
                }
            );

            if (!countInActiveRef.current) {
                console.log(
                    "[RecordingScreen][iOS] Recording start ignored because count-in is inactive"
                );
                return;
            }

            clearCountInTimer();

            /*
             * Son tick zaten çaldı.
             * Buradan sonra recorder hazırlığına geçiyoruz.
             */
            try {
                tickPlayer.pause();
            } catch (error) {
                console.log(
                    "[RecordingScreen][iOS] Tick cleanup error:",
                    error
                );
            }

            const setupStartedAt = Date.now();

            console.log(
                "[RecordingScreen][iOS] Starting recording setup BEFORE silent beat boundary",
                {
                    setupStartedAt,
                    recordingTargetAtMs,
                    remainingUntilSilentBeat:
                        recordingTargetAtMs - setupStartedAt,
                }
            );

            /*
             * iOS recording session.
             */
            const audioModeStartedAt = Date.now();

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "doNotMix",
            });

            const audioModeFinishedAt = Date.now();

            console.log(
                "[RecordingScreen][iOS] Recording audio mode ready",
                {
                    audioModeDurationMs:
                        audioModeFinishedAt - audioModeStartedAt,

                    remainingUntilSilentBeat:
                        recordingTargetAtMs - audioModeFinishedAt,
                }
            );

            if (!countInActiveRef.current) {
                console.log(
                    "[RecordingScreen][iOS] Recording cancelled after audio mode switch"
                );
                return;
            }

            /*
             * ÖNEMLİ:
             *
             * Warm recorder kullanmıyoruz.
             * Eski çalışan iOS akışındaki gibi fresh prepare ediyoruz.
             */
            const prepareStartedAt = Date.now();

            console.log(
                "[RecordingScreen][iOS] Fresh recorder prepare started"
            );

            await audioRecorder.prepareToRecordAsync();

            const prepareFinishedAt = Date.now();

            recorderPreparedRef.current = true;

            console.log(
                "[RecordingScreen][iOS] Fresh recorder prepare finished",
                {
                    prepareDurationMs:
                        prepareFinishedAt - prepareStartedAt,

                    remainingUntilSilentBeat:
                        recordingTargetAtMs - prepareFinishedAt,

                    status: audioRecorder.getStatus(),

                    uri: audioRecorder.uri,
                }
            );

            if (!countInActiveRef.current) {
                console.log(
                    "[RecordingScreen][iOS] Recording cancelled after prepare"
                );

                recorderPreparedRef.current = false;
                return;
            }

            /*
             * KRİTİK DEĞİŞİKLİK:
             *
             * recordingTargetAtMs'yi BEKLEMİYORUZ.
             *
             * Recorder hazır olduğu anda kayıt başlasın.
             * Böylece record() çağrısını 4 -> 1 animasyon sınırına
             * bindirmiyoruz.
             */
            const recordCalledAt = Date.now();

            console.log(
                "[RecordingScreen][iOS] Calling record BEFORE silent beat boundary",
                {
                    recordCalledAt,
                    recordingTargetAtMs,

                    differenceFromSilentBeatMs:
                        recordCalledAt - recordingTargetAtMs,

                    gapAfterLastAudibleTickMs:
                        lastAudibleTickAtRef.current !== null
                            ? recordCalledAt -
                            lastAudibleTickAtRef.current
                            : null,
                }
            );

            audioRecorder.record();

            const recordReturnedAt = Date.now();

            console.log(
                "[RecordingScreen][iOS] record() returned",
                {
                    recordCallDurationMs:
                        recordReturnedAt - recordCalledAt,

                    recordCalledAt,
                    recordReturnedAt,

                    recordingTargetAtMs,

                    differenceFromSilentBeatMs:
                        recordReturnedAt - recordingTargetAtMs,

                    uri: audioRecorder.uri,
                }
            );

            /*
             * BURADA:
             *
             * countInActiveRef.current = false YOK
             * setRecordingPhase("recording") YOK
             * startSilentVisualMetronome() YOK
             *
             * Bunların hepsini tam müzikal sınırda
             * runCountInBeat içindeki visual timer yapacak.
             */

            setTimeout(() => {
                const status = audioRecorder.getStatus();

                console.log(
                    "[RecordingScreen][iOS] Recorder status after early start",
                    {
                        canRecord: status.canRecord,
                        isRecording: status.isRecording,
                        durationMillis: status.durationMillis,
                        uri: audioRecorder.uri,
                    }
                );
            }, 200);
        } catch (error) {
            console.log(
                "[RecordingScreen][iOS] Begin recording error:",
                error
            );

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
            } catch { }

            showAlert({
                type: "warning",
                title: "Hata",
                message: "Kayıt başlatılamadı.",
            });
        }
    }
    async function beginRecordingAfterCountIn(
        recordingTargetAtMs: number
    ) {
        try {
            console.log("[RecordingScreen] beginRecordingAfterCountIn called", {
                countInActive: countInActiveRef.current,
                recorderPrepared: recorderPreparedRef.current,
                recorderUriBeforePrepare: audioRecorder.uri,
                recordingTargetAtMs,
            });

            if (!countInActiveRef.current) {
                return;
            }

            //countInActiveRef.current = false;
            clearCountInTimer();

            try {
                tickPlayer.pause();
                tickPlayer.seekTo(0);
            } catch {
                // Tick cleanup hatası kritik değil.
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

            const recorderStatusBeforePrepare = audioRecorder.getStatus();

            console.log("[RecordingScreen] Recorder status before prepare", {
                canRecord: recorderStatusBeforePrepare.canRecord,
                isRecording: recorderStatusBeforePrepare.isRecording,
                durationMillis: recorderStatusBeforePrepare.durationMillis,
                jsPreparedRef: recorderPreparedRef.current,
            });

            if (!recorderStatusBeforePrepare.canRecord) {
                console.log("[RecordingScreen] Preparing recorder after count-in...");

                await audioRecorder.prepareToRecordAsync();

                console.log("[RecordingScreen] Recorder freshly prepared");
            } else {
                console.log(
                    "[RecordingScreen] Recorder already prepared natively, skipping prepare"
                );
            }

            recorderPreparedRef.current = true;

            const prepareFinishedAt = Date.now();
            const remainingMs =
                recordingTargetAtMs - prepareFinishedAt;

            console.log("[RecordingScreen] Recorder prepared. Timing check", {
                recorderUriAfterPrepare: audioRecorder.uri,
                recordingTargetAtMs,
                prepareFinishedAt,
                remainingMs,
                beatDurationMs,
            });

            if (remainingMs > 0) {
                console.log(
                    "[RecordingScreen] Waiting remaining beat time before recording",
                    {
                        remainingMs,
                    }
                );

                await new Promise<void>((resolve) => {
                    setTimeout(resolve, remainingMs);
                });
            } else {
                console.log(
                    "[RecordingScreen] Recording target already reached, starting immediately",
                    {
                        lateByMs: Math.abs(remainingMs),
                    }
                );
            }

            if (!countInActiveRef.current) {
                console.log(
                    "[RecordingScreen] Recording start aborted during remaining beat wait"
                );

                recorderPreparedRef.current = false;

                return;
            }

            const recordCalledAt = Date.now();

            console.log("[RecordingScreen] Starting recorder", {
                recordingTargetAtMs,
                recordCalledAt,
                timingDifferenceMs:
                    recordCalledAt - recordingTargetAtMs,
                gapAfterLastAudibleTickMs:
                    lastAudibleTickAtRef.current !== null
                        ? recordCalledAt - lastAudibleTickAtRef.current
                        : null,
            });

            audioRecorder.record();

            countInActiveRef.current = false;
            setRecordingPhase("recording");
            startSilentVisualMetronome();

            console.log("[RecordingScreen] Recording started after count-in", {
                recorderPrepared: recorderPreparedRef.current,
                recorderUriAfterStart: audioRecorder.uri,
                recordCalledAt,
            });
        } catch (error) {
            console.log(
                "[RecordingScreen] Begin recording after count-in error:",
                error
            );

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
                    "[RecordingScreen] Failed to restore audio mode after recording start error:",
                    audioModeError
                );
            }
            showAlert({
                type: "warning",
                title: "Hata",
                message: "Kayıt başlatılamadı.",
            });
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
        });

        const tickPlayRequestedAt = Date.now();
        const isLastBeat = beat >= beatsBeforeRecording;

        // Son beat için listener'ı tick'i başlatmadan ÖNCE hazırla.
        // Böylece çok kısa WAV'da didJustFinish event'ini kaçırmayız.
        const lastTickFinishedPromise =
            isLastBeat && !isIOS
                ? waitForLastTickToFinish()
                : null;

        playTick(beat);
        // Görsel beat her vuruşta güncellensin.
        // Son beat dahil.
        setCurrentBeat(beat);

        if (isLastBeat) {
            lastAudibleTickAtRef.current = tickPlayRequestedAt;

            const recordingTargetAtMs =
                tickPlayRequestedAt + beatDurationMs;

            console.log("[RecordingScreen] Last count-in tick started", {
                tickPlayRequestedAt,
                recordingTargetAtMs,
                beatDurationMs,
                platform: Platform.OS,
            });

            if (isIOS) {
                console.log(
                    "[RecordingScreen][iOS] Last tick grace period started",
                    {
                        lastTickPlaybackGraceMs,
                        recordingTargetAtMs,
                    }
                );

                countInTimerRef.current = setTimeout(() => {
                    if (!countInActiveRef.current) return;

                    console.log(
                        "[RecordingScreen][iOS] Last tick grace finished. Starting recorder setup."
                    );

                    beginIOSRecordingAfterCountIn(
                        recordingTargetAtMs
                    );
                    const visualDelayMs = Math.max(
                        0,
                        recordingTargetAtMs - Date.now()
                    );

                    visualBeatDelayTimerRef.current = setTimeout(() => {
                        visualBeatDelayTimerRef.current = null;

                        if (!countInActiveRef.current) {
                            return;
                        }

                        console.log(
                            "[RecordingScreen][iOS] Visual beat boundary reached",
                            {
                                target: recordingTargetAtMs,
                                actual: Date.now(),
                                differenceMs: Date.now() - recordingTargetAtMs,
                            }
                        );

                        // Sessiz moda tam beat sınırında geç.
                        // record() native tarafta biraz geç dönse bile UI ritmi bozulmasın.

                        setRecordingPhase("recording");
                        startSilentVisualMetronome();
                    }, visualDelayMs);
                }, lastTickPlaybackGraceMs);

                return;
            }

            // ANDROID AYNEN ESKİ SİSTEMİYLE DEVAM EDİYOR.
            lastTickFinishedPromise?.then(() => {
                if (!countInActiveRef.current) return;

                console.log(
                    "[RecordingScreen][Android] Last tick finished. Preparing recording."
                );

                beginRecordingAfterCountIn(
                    recordingTargetAtMs
                );
            });

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
                    interruptionMode: "mixWithOthers",
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

                    showAlert({
                        type: "error",
                        title: "Hata",
                        message: "Parça bilgisi bulunamadı.",
                    });
                    router.back();
                    return;
                }

                const selectedSong = await getSongById(songId);

                if (!selectedSong) {
                    showAlert({
                        type: "warning",
                        title: "Hata",
                        message: "Seçilen parça bulunamadı.",
                    });
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


                    showAlert({
                        type: "warning",
                        title: "Mikrofon izni gerekli",
                        message: "Kayıt alabilmek için mikrofon izni vermelisin.",
                    });

                    return;
                }

                setPermissionGranted(true);

                if (isIOS) {
                    // iOS:
                    // Ekran açılırken recorder prepare ETMİYORUZ.
                    // Sadece metronom/original playback için session hazır olsun.
                    recorderPreparedRef.current = false;

                    await setAudioModeAsync({
                        playsInSilentMode: true,
                        allowsRecording: false,
                        shouldRouteThroughEarpiece: false,
                        shouldPlayInBackground: false,
                        interruptionMode: "mixWithOthers",
                    });

                    console.log(
                        "[RecordingScreen][iOS] Screen prepared in playback mode"
                    );
                } else {
                    // ANDROID AYNEN KALIYOR.
                    recorderPreparedRef.current = false;

                    await setAudioModeAsync({
                        playsInSilentMode: true,
                        allowsRecording: false,
                        shouldRouteThroughEarpiece: false,
                        shouldPlayInBackground: false,
                        interruptionMode: "mixWithOthers",
                    });

                    await warmUpTickPlayerForAndroid();
                }

                console.log(
                    "[RecordingScreen] Screen prepare completed in playback mode"
                );
            } catch (error) {
                console.log("[RecordingScreen] Recording screen prepare error:", error);


                showAlert({
                    type: "error",
                    title: "Hata",
                    message:
                        "Kayıt ekranı hazırlanırken bir sorun oluştu.",
                });
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
            lastTickFinishedResolverRef.current = null;
            clearMetronomeTimers();

            try {
                originalPlayer.pause();
                tickPlayer.pause();
            } catch {
                // Ignore cleanup errors.
            }
        };
    }, []);



    const playOriginal = async () => {
        try {
            console.log("[RecordingScreen] playOriginal pressed", {
                hasOriginalUrl: Boolean(originalUrl),
                recordingPhase,
                originalPlaying: originalStatus.playing,
            });

            if (!originalUrl) {
                showAlert({
                    type: "error",
                    title: "Hata",
                    message: "Orijinal ses dosyası bulunamadı.",
                });
                return;
            }

            if (recordingPhase === "countIn" || recordingPhase === "recording") {
                showAlert({
                    type: "info",
                    title: "Kayıt hazırlanıyor",
                    message: "Orijinal melodiyi dinlemek için önce kayıt akışını durdurmalısın.",
                });
                return;
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "mixWithOthers",
            });

            await originalPlayer.seekTo(0);
            originalPlayer.play();

            setOriginalPlayingUi(true);

            console.log("[RecordingScreen] Original audio started");
        } catch (error) {
            setOriginalPlayingUi(false);
            console.log("[RecordingScreen] Play original error:", error);
            showAlert({
                type: "warning",
                title: "Hata",
                message: "Orijinal melodi oynatılamadı.",
            });
        }
    };

    const pauseOriginal = async () => {
        try {
            console.log("[RecordingScreen] pauseOriginal pressed");

            originalPlayer.pause();

            setOriginalPlayingUi(false);

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
                showAlert({
                    type: "warning",
                    title: "Mikrofon izni gerekli",
                    message: "Kayıt alabilmek için mikrofon izni vermelisin.",
                });
                return;
            }

            if (submitting) return;

            try {
                originalPlayer.pause();
                await originalPlayer.seekTo(0);

                setOriginalPlayingUi(false);

                console.log(
                    "[RecordingScreen] Original audio paused and reset before count-in"
                );
            } catch (error) {
                console.log(
                    "[RecordingScreen] Original audio reset before count-in error:",
                    error
                );
            }

            countInActiveRef.current = false;
            clearMetronomeTimers();

            setRecordedUri(null);
            setRecordedDurationMillis(0);
            setCurrentBeat(1);
            setRecordingPhase("countIn");

            if (isIOS) {
                console.log(
                    "[RecordingScreen][iOS] Count-in starting in playback mode"
                );

                recorderPreparedRef.current = false;

                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: false,
                    shouldRouteThroughEarpiece: false,
                    shouldPlayInBackground: false,
                    interruptionMode: "doNotMix",
                });

                console.log(
                    "[RecordingScreen][iOS] Playback audio mode ready for audible count-in",
                    {
                        bpm,
                        beatsBeforeRecording,
                        beatDurationMs,
                        lastTickPlaybackGraceMs,
                        nativeCanRecord:
                            audioRecorder.getStatus().canRecord,
                    }
                );
            } else {
                // ANDROID KODUNU DEĞİŞTİRMİYORUZ.
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: false,
                    shouldRouteThroughEarpiece: false,
                    shouldPlayInBackground: false,
                    interruptionMode: "doNotMix",
                });

                recorderPreparedRef.current = false;

                console.log(
                    "[RecordingScreen][Android] Count-in started in playback mode",
                    {
                        bpm,
                        beatsBeforeRecording,
                        beatDurationMs,
                    }
                );
            }

            console.log("[RecordingScreen] About to start first count-in beat", {
                tickLoaded: tickStatus.isLoaded,
                tickPlaying: tickStatus.playing,
                tickCurrentTime: tickStatus.currentTime,
                tickDuration: tickStatus.duration,
                tickBuffering: tickStatus.isBuffering,
            });

            if (!tickStatus.isLoaded) {
                console.log("[RecordingScreen] Tick audio is not loaded yet");

                setRecordingPhase("idle");
                setCurrentBeat(1);

                showAlert({
                    type: "info",
                    title: "Metronom hazırlanıyor",
                    message:
                        "Metronom sesi henüz hazır değil. Lütfen bir an sonra tekrar dene.",
                });

                return;
            }

            countInActiveRef.current = true;
            runCountInBeat(1);

        } catch (error) {
            console.log("[RecordingScreen] Start count-in recording error:", error);

            countInActiveRef.current = false;
            clearMetronomeTimers();
            setRecordingPhase("idle");
            setCurrentBeat(1);

            showAlert({
                type: "warning",
                title: "Hata",
                message: "Kayıt hazırlığı başlatılamadı.",
            });
        }
    };

    const cancelCountIn = async () => {
        try {
            console.log("[RecordingScreen] cancelCountIn pressed");

            countInActiveRef.current = false;
            clearMetronomeTimers();
            lastTickFinishedResolverRef.current = null;

            try {
                tickPlayer.pause();
                tickPlayer.seekTo(0);
            } catch {
                // Tick player cleanup error can be ignored.
            }

            if (recorderPreparedRef.current) {
                if (isIOS) {
                    try {
                        const statusBeforeCancel =
                            audioRecorder.getStatus();

                        console.log(
                            "[RecordingScreen][iOS] Releasing prepared recorder during cancel",
                            {
                                canRecord:
                                    statusBeforeCancel.canRecord,
                                isRecording:
                                    statusBeforeCancel.isRecording,
                                durationMillis:
                                    statusBeforeCancel.durationMillis,
                            }
                        );

                        if (statusBeforeCancel.isRecording) {
                            await audioRecorder.stop();
                        } else if (statusBeforeCancel.canRecord) {
                            // expo-audio'da explicit "unprepare" yok.
                            // Prepared session'ı kapatmak için discard recording.
                            audioRecorder.record();
                            await audioRecorder.stop();
                        }

                        console.log(
                            "[RecordingScreen][iOS] Prepared recorder released after cancel",
                            audioRecorder.getStatus()
                        );
                    } catch (error) {
                        console.log(
                            "[RecordingScreen][iOS] Recorder cleanup during cancel failed:",
                            error
                        );
                    } finally {
                        recorderPreparedRef.current = false;
                    }
                } else {
                    try {
                        const statusBeforeCancel = audioRecorder.getStatus();

                        console.log(
                            "[RecordingScreen][Android] Recorder state during cancel",
                            {
                                canRecord: statusBeforeCancel.canRecord,
                                isRecording: statusBeforeCancel.isRecording,
                                durationMillis: statusBeforeCancel.durationMillis,
                            }
                        );

                        // Sadece gerçekten recording başladıysa stop çağır.
                        // Prepared ama henüz recording başlamadıysa Android stop() kabul etmiyor.
                        if (statusBeforeCancel.isRecording) {
                            await audioRecorder.stop();

                            console.log(
                                "[RecordingScreen][Android] Active recorder stopped during cancel"
                            );
                        } else {
                            console.log(
                                "[RecordingScreen][Android] Recorder prepared but not recording, stop skipped"
                            );
                        }
                    } catch (error) {
                        console.log(
                            "[RecordingScreen][Android] Recorder cleanup during cancel error:",
                            error
                        );
                    } finally {
                        recorderPreparedRef.current = false;
                    }
                }
            }

            setRecordedUri(null);
            setRecordedDurationMillis(0);
            setCurrentBeat(1);
            setRecordingPhase("idle");

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                shouldRouteThroughEarpiece: false,
                shouldPlayInBackground: false,
                interruptionMode: "mixWithOthers",
            });

            console.log(
                "[RecordingScreen] Count-in cancelled and audio mode restored"
            );
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
            if (isIOS && visualBeatDelayTimerRef.current) {
                clearTimeout(visualBeatDelayTimerRef.current);
                visualBeatDelayTimerRef.current = null;

                console.log(
                    "[RecordingScreen][iOS] Pending visual beat start cleared during stop"
                );
            }

            if (isIOS) {
                const nativeStatusBeforeStop =
                    audioRecorder.getStatus();

                console.log(
                    "[RecordingScreen][iOS] Native recorder status before stop",
                    {
                        canRecord:
                            nativeStatusBeforeStop.canRecord,
                        isRecording:
                            nativeStatusBeforeStop.isRecording,
                        durationMillis:
                            nativeStatusBeforeStop.durationMillis,
                        currentTime:
                            audioRecorder.currentTime,
                        uri:
                            audioRecorder.uri,
                    }
                );
            }
            await audioRecorder.stop();

            if (isIOS) {
                console.log(
                    "[RecordingScreen][iOS] Native recording stopped",
                    {
                        currentTime:
                            audioRecorder.currentTime,
                        uri:
                            audioRecorder.uri,
                        recordedDurationFromState:
                            durationMillisBeforeStop,
                    }
                );
            }
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

                showAlert({
                    type: "warning",
                    title: "Hata",
                    message: "Kayıt dosyası oluşturulamadı.",
                });
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
                interruptionMode: "mixWithOthers",
            });

            console.log("[RecordingScreen] Audio mode restored after stop", {
                recordedUri: uri,
                recordedDurationMillis: durationMillisBeforeStop,
                recordedDurationSeconds: durationSecondsBeforeStop,
            });
        } catch (error) {
            console.log("[RecordingScreen] Stop recording error:", error);

            showAlert({
                type: "warning",
                title: "Hata",
                message: "Kayıt dosyası oluşturulamadı.",
            });
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
            showAlert({
                type: "info",
                title: "Hazırlık devam ediyor",
                message: "Geri dönmeden önce hazırlığı iptal etmelisin.",
            });
            return;
        }

        if (recordingPhase === "recording") {
            showAlert({
                type: "info",
                title: "Kayıt devam ediyor",
                message: "Geri dönmeden önce kaydı durdurmalısın.",
            });
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
                showAlert({
                    type: "warning",
                    title: "Hata",
                    message: "Kullanıcı oturumu bulunamadı.",
                });
                return;
            }

            if (!song) {
                showAlert({
                    type: "warning",
                    title: "Hata",
                    message: "Parça bilgisi bulunamadı.",
                });
                return;
            }

            if (!songId) {
                showAlert({
                    type: "warning",
                    title: "Hata",
                    message: "Parça ID bilgisi bulunamadı.",
                });
                return;
            }

            if (!recordedUri) {
                showAlert({
                    type: "warning",
                    title: "Hata",
                    message: "Önce bir kayıt oluşturmalısın.",
                });
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
                title={getExerciseTitle(song?.order)}
                description={song?.description}
                songOrder={song?.order}
                onBackPress={handleBackPress}
                colors={colors}
            />

            <OriginalAudioCard
                isPlaying={originalPlayingUi}
                isLoading={originalLoading}
                disabled={
                    !originalUrl ||
                    submitting ||
                    recordingPhase === "countIn" ||
                    recordingPhase === "recording"
                }
                onPress={originalPlayingUi ? pauseOriginal : playOriginal}
                colors={colors}
            />

            <MetronomeCard
                bpm={bpm}
                beatsPerMeasure={beatsPerMeasure}
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