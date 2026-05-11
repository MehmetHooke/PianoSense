// app/record/[songId].tsx

import { AuthGate } from "@/src/components/auth/AuthGate";
import { useAuth } from "@/src/context/AuthContext";
import { createAnalysisJob } from "@/src/services/analysisJobService";
import { uploadRecordingAudio } from "@/src/services/audioUploadService";
import { getSongById } from "@/src/services/songService";
import { getStorageFileUrl } from "@/src/services/storageService";
import type { Song } from "@/src/types/song";
import { Ionicons } from "@expo/vector-icons";
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
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

export default function RecordingScreen() {
    return (
        <AuthGate>
            <RecordingScreenContent />
        </AuthGate>
    );
}

function RecordingScreenContent() {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
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

    const originalSource = useMemo(() => {
        if (!originalUrl) return null;
        return { uri: originalUrl };
    }, [originalUrl]);

    const originalPlayer = useAudioPlayer(originalSource);
    const originalStatus = useAudioPlayerStatus(originalPlayer);

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

    const playOriginal = async () => {
        try {
            if (!originalUrl) {
                Alert.alert("Hata", "Orijinal ses dosyası bulunamadı.");
                return;
            }

            if (recorderState.isRecording) {
                Alert.alert(
                    "Kayıt devam ediyor",
                    "Orijinal melodiyi dinlemek için önce kaydı durdur."
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

    const startRecording = async () => {
        try {
            setRecordedUri(null);

            if (originalStatus.playing) {
                originalPlayer.pause();
            }

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();

            console.log("Recording started");
        } catch (error) {
            console.log("Start recording error:", error);
            Alert.alert("Hata", "Kayıt başlatılamadı.");
        }
    };

    const stopRecording = async () => {
        try {
            await audioRecorder.stop();

            const uri = audioRecorder.uri;

            console.log("Recording stopped. URI:", uri);

            if (!uri) {
                Alert.alert("Hata", "Kayıt dosyası oluşturulamadı.");
                return;
            }

            setRecordedUri(uri);
        } catch (error) {
            console.log("Stop recording error:", error);
            Alert.alert("Hata", "Kayıt durdurulamadı.");
        }
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

            const uploadResult = await uploadRecordingAudio({
                userId: user.uid,
                songId,
                localUri: recordedUri,
            });

            const jobId = await createAnalysisJob({
                userId: user.uid,
                songId,
                recordingId: uploadResult.recordingId,
                originalAudioPath: song.originalAudioPath,
                recordedAudioPath: uploadResult.recordedAudioPath,
            });

            router.replace({
                pathname: "/processing/[jobId]",
                params: { jobId },
            });
        } catch (error) {
            console.log("Send to analysis error:", error);
            Alert.alert("Hata", "Kayıt analize gönderilirken bir sorun oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDevMockAnalysis = async () => {
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

            setSubmitting(true);

            const recordingId = `dev-recording-${Date.now()}`;

            const fakeRecordedAudioPath = `users/${user.uid}/songs/${songId}/recordings/${recordingId}.wav`;

            const jobId = await createAnalysisJob({
                userId: user.uid,
                songId,
                recordingId,
                originalAudioPath: song.originalAudioPath,
                recordedAudioPath: fakeRecordedAudioPath,
            });

            router.replace({
                pathname: "/processing/[jobId]",
                params: { jobId },
            });
        } catch (error) {
            console.log("Dev mock analysis error:", error);
            Alert.alert("Hata", "Dev analiz testi başlatılamadı.");
        } finally {
            setSubmitting(false);
        }
    };

    if (screenLoading) {
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
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={{ marginTop: 12, color: "#6B7280" }}>
                    Çalışma ekranı hazırlanıyor...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: "#F8F7FF",
            }}
            contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 64,
                paddingBottom: 36,
            }}
        >
            <Pressable
                onPress={() => router.back()}
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
                <Ionicons name="chevron-back" size={24} color="#111827" />
            </Pressable>

            <View style={{ marginBottom: 22 }}>
                <Text
                    style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: "#4F46E5",
                        marginBottom: 8,
                    }}
                >
                    ÇALIŞMA AKIŞI
                </Text>

                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: "900",
                        color: "#111827",
                        marginBottom: 8,
                    }}
                >
                    {song?.title}
                </Text>

                <Text
                    style={{
                        fontSize: 15,
                        color: "#6B7280",
                        lineHeight: 22,
                    }}
                >
                    Önce orijinal melodiyi dinle. Sonra aynı melodiyi piyanoda çalıp
                    kaydet.
                </Text>
            </View>

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
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 18,
                    }}
                >
                    <View
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 18,
                            backgroundColor: "#EEF2FF",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="play" size={24} color="#4F46E5" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: "#111827",
                                fontSize: 18,
                                fontWeight: "900",
                            }}
                        >
                            1. Orijinali dinle
                        </Text>

                        <Text
                            style={{
                                color: "#6B7280",
                                marginTop: 4,
                                lineHeight: 20,
                            }}
                        >
                            Melodiyi duy, ritmi ve notaları aklında tut.
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={originalStatus.playing ? pauseOriginal : playOriginal}
                    disabled={originalLoading || !originalUrl}
                    style={{
                        backgroundColor: originalStatus.playing ? "#111827" : "#4F46E5",
                        borderRadius: 18,
                        paddingVertical: 15,
                        alignItems: "center",
                        opacity: originalLoading || !originalUrl ? 0.5 : 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    {originalLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Ionicons
                            name={originalStatus.playing ? "pause" : "play"}
                            size={20}
                            color="#FFFFFF"
                        />
                    )}

                    <Text
                        style={{
                            color: "#FFFFFF",
                            fontWeight: "900",
                            fontSize: 15,
                        }}
                    >
                        {originalStatus.playing ? "Durdur" : "Orijinali Oynat"}
                    </Text>
                </Pressable>

                <Text
                    style={{
                        color: "#9CA3AF",
                        fontSize: 12,
                        marginTop: 12,
                    }}
                    numberOfLines={1}
                >
                    {song?.originalAudioPath}
                </Text>
            </View>

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
                <View
                    style={{
                        width: 82,
                        height: 82,
                        borderRadius: 28,
                        backgroundColor: recorderState.isRecording ? "#FEE2E2" : "#EEF2FF",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "center",
                        marginBottom: 18,
                    }}
                >
                    <Ionicons
                        name={recorderState.isRecording ? "radio-button-on" : "mic"}
                        size={42}
                        color={recorderState.isRecording ? "#EF4444" : "#4F46E5"}
                    />
                </View>

                <Text
                    style={{
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: "900",
                        color: "#111827",
                        marginBottom: 6,
                    }}
                >
                    2. Şimdi sen çal
                </Text>

                <Text
                    style={{
                        textAlign: "center",
                        color: "#6B7280",
                        marginBottom: 20,
                    }}
                >
                    Süre: {Math.floor((recorderState.durationMillis ?? 0) / 1000)} sn
                </Text>

                <Pressable
                    onPress={recorderState.isRecording ? stopRecording : startRecording}
                    disabled={!permissionGranted}
                    style={{
                        backgroundColor: recorderState.isRecording ? "#EF4444" : "#4F46E5",
                        borderRadius: 18,
                        paddingVertical: 16,
                        alignItems: "center",
                        opacity: permissionGranted ? 1 : 0.5,
                    }}
                >
                    <Text
                        style={{
                            color: "#FFFFFF",
                            fontWeight: "900",
                            fontSize: 16,
                        }}
                    >
                        {recorderState.isRecording ? "Kaydı Durdur" : "Kaydı Başlat"}
                    </Text>
                </Pressable>
            </View>

            {recordedUri ? (
                <View
                    style={{
                        backgroundColor: "#ECFDF5",
                        borderRadius: 22,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: "#BBF7D0",
                        marginBottom: 16,
                    }}
                >
                    <Text
                        style={{
                            color: "#166534",
                            fontWeight: "900",
                            marginBottom: 6,
                        }}
                    >
                        Kayıt hazır
                    </Text>

                    <Text
                        style={{
                            color: "#166534",
                            lineHeight: 20,
                            fontSize: 13,
                        }}
                        numberOfLines={2}
                    >
                        {recordedUri}
                    </Text>
                </View>
            ) : null}

            {/*  DEV only: tests callable analysis flow without real audio upload. */}
            {__DEV__ ? (
                <Pressable
                    onPress={handleDevMockAnalysis}
                    disabled={submitting || !song}
                    style={{
                        backgroundColor: "#4F46E5",
                        borderRadius: 20,
                        paddingVertical: 17,
                        alignItems: "center",
                        marginBottom: 12,
                        opacity: submitting || !song ? 0.5 : 1,
                    }}
                >
                    <Text
                        style={{
                            color: "#FFFFFF",
                            fontWeight: "900",
                            fontSize: 16,
                        }}
                    >
                        DEV: Mock Analiz Test Et
                    </Text>
                </Pressable>
            ) : null}

            <Pressable
                onPress={handleSendToAnalysis}
                disabled={!recordedUri || recorderState.isRecording || submitting}
                style={{
                    backgroundColor: "#111827",
                    borderRadius: 20,
                    paddingVertical: 17,
                    alignItems: "center",
                    opacity:
                        recordedUri && !recorderState.isRecording && !submitting ? 1 : 0.45,
                }}
            >
                <Text
                    style={{
                        color: "#FFFFFF",
                        fontWeight: "900",
                        fontSize: 16,
                    }}
                >
                    {submitting ? "Analize gönderiliyor..." : "Analize Gönder"}
                </Text>
            </Pressable>
        </ScrollView>
    );
}
