import type { AppColors } from "@/src/theme/colors";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    Text,
    View
} from "react-native";

export type RecordingPhase =
    | "idle"
    | "countIn"
    | "recording"
    | "recorded";

type Props = {
    bpm: number;
    beatsPerMeasure: number;
    beatsBeforeRecording: number;
    currentBeat: number;
    beatPulseKey: number;
    phase: RecordingPhase;
    disabled: boolean;
    durationSeconds: number;

    isMetronomeSilent: boolean;
    isPreparingRecording: boolean;
    onSilentModeChange: (silent: boolean) => void;

    onPrimaryPress: () => void;
    colors: AppColors;
};

function getTitle(phase: RecordingPhase) {
    if (phase === "countIn") return "Hazırlan";
    if (phase === "recorded") return "Kayıt tamamlandı";

    return "Hazırlık";
}

function getDescription({
    phase,
    beatsBeforeRecording,
    isMetronomeSilent,
}: {
    phase: RecordingPhase;
    beatsBeforeRecording: number;
    isMetronomeSilent: boolean;
}) {
    if (phase === "countIn") {
        return isMetronomeSilent
            ? "Kayıt birazdan otomatik başlayacak. Görsel vuruşları takip et."
            : "Kayıt birazdan otomatik başlayacak. Vuruşları takip et.";
    }

    if (phase === "recording") {
        return "Kayıt alınıyor. Metronom sesi kapalı, animasyon ritmi göstermeye devam ediyor.";
    }

    if (phase === "recorded") {
        return "Kaydın hazır. İstersen yeniden kaydedebilir veya analize gönderebilirsin.";
    }

    return isMetronomeSilent
        ? `Kayda bastığında önce ${beatsBeforeRecording} sessiz görsel vuruş göreceksin. Sonra kayıt otomatik başlayacak.`
        : `Kayda bastığında önce ${beatsBeforeRecording} vuruş metronom duyacaksın. Sonra kayıt otomatik başlayacak.`;
}

function getButtonLabel(phase: RecordingPhase) {
    if (phase === "countIn") return "Hazırlığı İptal Et";
    if (phase === "recording") return "Kaydı Durdur";
    if (phase === "recorded") return "Yeniden Kaydet";

    return "Kayda Başla";
}

function getIconName(phase: RecordingPhase) {
    if (phase === "countIn") return "timer";
    if (phase === "recording") return "radio-button-on";
    if (phase === "recorded") return "checkmark-circle";

    return "mic";
}

export function MetronomeCard({
    bpm,
    beatsPerMeasure,
    beatsBeforeRecording,
    currentBeat,
    beatPulseKey,
    phase,
    disabled,
    durationSeconds,

    isMetronomeSilent,
    isPreparingRecording,
    onSilentModeChange,

    onPrimaryPress,
    colors,
}: Props) {
    const isCountIn = phase === "countIn";
    const isRecording = phase === "recording";
    const isRecorded = phase === "recorded";

    /*
     * Dış kart scale efekti.
     */
    const cardScale = useRef(
        new Animated.Value(1)
    ).current;

    /*
     * Dış kart glow efekti.
     *
     * Artık backgroundColor / borderColor interpolate etmiyoruz.
     * Bunun yerine sabit renkli bir overlay'in opacity'sini değiştiriyoruz.
     */
    const outerGlowOpacity = useRef(
        new Animated.Value(0)
    ).current;

    /*
     * İçteki beat kartının sadece border efekti.
     */
    const innerBorderOpacity = useRef(
        new Animated.Value(0)
    ).current;

    useEffect(() => {
        /*
         * Count-in veya recording değilsek
         * bütün animasyonları normal hale getir.
         */
        if (!isCountIn && !isRecording) {
            cardScale.stopAnimation();
            outerGlowOpacity.stopAnimation();
            innerBorderOpacity.stopAnimation();

            cardScale.setValue(1);
            outerGlowOpacity.setValue(0);
            innerBorderOpacity.setValue(0);

            return;
        }

        /*
         * Yeni beat geldiğinde eski animasyonu kes
         * ve sıfırdan başlat.
         */
        cardScale.stopAnimation();
        outerGlowOpacity.stopAnimation();
        innerBorderOpacity.stopAnimation();

        cardScale.setValue(1);
        outerGlowOpacity.setValue(0);
        innerBorderOpacity.setValue(0);

        Animated.parallel([
            /*
             * Dış kart hafif heartbeat yapıyor.
             */
            Animated.sequence([
                Animated.timing(cardScale, {
                    toValue: 1.018,
                    duration: 80,
                    useNativeDriver: true,
                }),

                Animated.timing(cardScale, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]),

            /*
             * Dış glow.
             */
            Animated.sequence([
                Animated.timing(outerGlowOpacity, {
                    toValue: 1,
                    duration: 60,
                    useNativeDriver: true,
                }),

                Animated.timing(outerGlowOpacity, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]),

            /*
             * İç kart border glow.
             */
            Animated.sequence([
                Animated.timing(innerBorderOpacity, {
                    toValue: 1,
                    duration: 60,
                    useNativeDriver: true,
                }),

                Animated.timing(innerBorderOpacity, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [
        beatPulseKey,
        isCountIn,
        isRecording,
        cardScale,
        outerGlowOpacity,
        innerBorderOpacity,
    ]);

    const iconColor = isRecording
        ? colors.danger
        : isRecorded
            ? colors.success
            : colors.primary;

    const iconBackgroundColor = isRecording
        ? colors.dangerSoft
        : isRecorded
            ? colors.successSoft
            : colors.primarySoft;

    const buttonBackgroundColor = isCountIn
        ? colors.warning
        : isRecording
            ? colors.danger
            : colors.primary;

    const beatColor = isRecording
        ? colors.danger
        : colors.primary;

    const beatSoftColor = isRecording
        ? colors.dangerSoft
        : colors.primarySoft;

    return (
        <Animated.View
            style={{
                backgroundColor: colors.card,

                borderRadius: 28,
                padding: 20,

                borderWidth: 1,
                borderColor: colors.border,

                marginBottom: 16,

                shadowColor: colors.shadow,
                shadowOpacity: 1,
                shadowRadius: 18,

                shadowOffset: {
                    width: 0,
                    height: 10,
                },

                elevation: 2,

                transform: [
                    {
                        scale: cardScale,
                    },
                ],

                /*
                 * Overlay'in kart sınırları dışına taşmaması için.
                 */
                overflow: "hidden",
            }}
        >
            {/*
             * DIŞ KART GLOW OVERLAY
             *
             * Renk animasyonu yok.
             * Sadece opacity native tarafta değişiyor.
             */}
            {isCountIn || isRecording ? (
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,

                        borderRadius: 28,

                        backgroundColor: beatSoftColor,

                        borderWidth: 2,
                        borderColor: beatColor,

                        opacity: outerGlowOpacity,
                    }}
                />
            ) : null}

            <View
                style={{
                    alignItems: "center",
                    marginBottom: 18,
                }}
            >
                <View
                    style={{
                        width: 55,
                        height: 55,

                        borderRadius: 30,

                        backgroundColor:
                            iconBackgroundColor,

                        alignItems: "center",
                        justifyContent: "center",

                        borderWidth: 1,
                        borderColor:
                            colors.softBorder,

                        marginBottom: 16,
                    }}
                >
                    <Ionicons
                        name={getIconName(phase)}
                        size={30}
                        color={iconColor}
                    />
                </View>

                <Text
                    style={{
                        textAlign: "center",
                        color: colors.mutedText,
                        lineHeight: 21,
                        fontSize: 14,
                        paddingHorizontal: 4,
                    }}
                >
                    {isPreparingRecording
                        ? "Mikrofon ve kayıt sistemi hazırlanıyor. Birazdan geri sayım başlayacak."
                        : getDescription({
                            phase,
                            beatsBeforeRecording,
                            isMetronomeSilent,
                        })}
                </Text>

            </View>

            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 4,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: colors.softBorder,
                }}
            >
                <Pressable
                    disabled={
                        isPreparingRecording ||
                        isCountIn ||
                        isRecording
                    }
                    onPress={() => onSilentModeChange(false)}
                    style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        paddingVertical: 10,
                        borderRadius: 12,

                        backgroundColor:
                            !isMetronomeSilent
                                ? colors.primarySoft
                                : "transparent",

                        opacity:
                            isPreparingRecording ||
                                isCountIn ||
                                isRecording
                                ? 0.5
                                : pressed
                                    ? 0.8
                                    : 1,
                    })}
                >
                    <Ionicons
                        name="volume-high"
                        size={17}
                        color={
                            !isMetronomeSilent
                                ? colors.primary
                                : colors.mutedText
                        }
                    />

                    <Text
                        style={{
                            color:
                                !isMetronomeSilent
                                    ? colors.primary
                                    : colors.mutedText,
                            fontSize: 13,
                            fontWeight: "800",
                        }}
                    >
                        Sesli
                    </Text>
                </Pressable>

                <Pressable
                    disabled={
                        isPreparingRecording ||
                        isCountIn ||
                        isRecording
                    }
                    onPress={() => onSilentModeChange(true)}
                    style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        paddingVertical: 10,
                        borderRadius: 12,

                        backgroundColor:
                            isMetronomeSilent
                                ? colors.primarySoft
                                : "transparent",

                        opacity:
                            isPreparingRecording ||
                                isCountIn ||
                                isRecording
                                ? 0.5
                                : pressed
                                    ? 0.8
                                    : 1,
                    })}
                >
                    <Ionicons
                        name="volume-mute"
                        size={17}
                        color={
                            isMetronomeSilent
                                ? colors.primary
                                : colors.mutedText
                        }
                    />

                    <Text
                        style={{
                            color:
                                isMetronomeSilent
                                    ? colors.primary
                                    : colors.mutedText,
                            fontSize: 13,
                            fontWeight: "800",
                        }}
                    >
                        Sessiz
                    </Text>
                </Pressable>
            </View>
            <View
                style={{
                    backgroundColor:
                        colors.surface,

                    borderRadius: 22,

                    padding: 16,

                    borderWidth: 1,
                    borderColor:
                        colors.softBorder,

                    marginBottom: 16,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",

                        justifyContent:
                            "space-between",

                        gap: 12,
                        marginBottom: 14,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    colors.subtleText,

                                fontSize: 12,
                                fontWeight: "800",

                                marginBottom: 4,
                            }}
                        >
                            TEMPO
                        </Text>

                        <Text
                            style={{
                                color: colors.text,

                                fontSize: 18,
                                fontWeight: "900",
                            }}
                        >
                            {bpm} BPM
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    colors.subtleText,

                                fontSize: 12,
                                fontWeight: "800",

                                marginBottom: 4,

                                textAlign: "right",
                            }}
                        >
                            ÖLÇÜ
                        </Text>

                        <Text
                            style={{
                                color: colors.text,

                                fontSize: 18,
                                fontWeight: "900",

                                textAlign: "right",
                            }}
                        >
                            {beatsPerMeasure}/4
                        </Text>
                    </View>
                </View>

                {/*
                 * İÇ BEAT KARTI
                 *
                 * Kendi şekli / background'u değişmiyor.
                 * Scale yok.
                 * Sadece üstündeki border overlay yanıp sönüyor.
                 */}
                <View
                    style={{
                        height: 72,

                        borderRadius: 20,

                        backgroundColor:
                            colors.card,

                        borderWidth: 1.5,
                        borderColor:
                            colors.border,

                        alignItems: "center",
                        justifyContent: "center",

                        overflow: "hidden",
                    }}
                >
                    {isCountIn || isRecording ? (
                        <Animated.View
                            pointerEvents="none"
                            style={{
                                position: "absolute",

                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,

                                borderRadius: 20,

                                borderWidth: 2,

                                borderColor:
                                    beatColor,

                                opacity:
                                    innerBorderOpacity,
                            }}
                        />
                    ) : null}

                    {isCountIn ? (
                        <>
                            <Text
                                style={{
                                    color:
                                        colors.primary,

                                    fontSize: 32,
                                    fontWeight: "900",
                                }}
                            >
                                {currentBeat} /{" "}
                                {beatsBeforeRecording}
                            </Text>

                            <Text
                                style={{
                                    color: colors.subtleText,
                                    fontSize: 12,
                                    fontWeight: "700",
                                    marginTop: 2,
                                }}
                            >
                                {isMetronomeSilent
                                    ? "Sessiz hazırlık"
                                    : "Sesli hazırlık"}
                            </Text>
                        </>
                    ) : isRecording ? (
                        <>
                            <Text
                                style={{
                                    color:
                                        colors.danger,

                                    fontSize: 32,
                                    fontWeight: "900",
                                }}
                            >
                                {currentBeat} /{" "}
                                {beatsPerMeasure}
                            </Text>

                            <Text
                                style={{
                                    color:
                                        colors.subtleText,

                                    fontSize: 12,
                                    fontWeight: "700",

                                    marginTop: 2,
                                }}
                            >
                                Sessiz metronom aktif
                            </Text>
                        </>
                    ) : isRecorded ? (
                        <>
                            <Ionicons
                                name="checkmark-circle"
                                size={25}
                                color={
                                    colors.success
                                }
                            />

                            <Text
                                style={{
                                    color:
                                        colors.successForeground,

                                    fontSize: 12,
                                    fontWeight: "800",

                                    marginTop: 4,
                                }}
                            >
                                Analize göndermeye hazır
                            </Text>
                        </>
                    ) : (
                        <>
                            <Ionicons
                                name="musical-note"
                                size={25}
                                color={
                                    colors.primary
                                }
                            />

                            <Text
                                style={{
                                    color:
                                        colors.subtleText,

                                    fontSize: 12,
                                    fontWeight: "800",

                                    marginTop: 4,
                                }}
                            >
                                {beatsBeforeRecording}{" "}
                                vuruş hazırlık
                            </Text>
                        </>
                    )}
                </View>

                <View
                    style={{
                        marginTop: 12,

                        flexDirection: "row",
                        justifyContent: "center",

                        gap: 8,
                    }}
                >
                    {Array.from({
                        length: isRecording
                            ? beatsPerMeasure
                            : beatsBeforeRecording,
                    }).map((_, index) => {
                        const beatNumber =
                            index + 1;

                        const isActiveBeat =
                            (
                                isCountIn ||
                                isRecording
                            ) &&
                            currentBeat ===
                            beatNumber;

                        return (
                            <View
                                key={beatNumber}
                                style={{
                                    width:
                                        isActiveBeat
                                            ? 28
                                            : 10,

                                    height: 10,

                                    borderRadius: 999,

                                    backgroundColor:
                                        isActiveBeat
                                            ? isRecording
                                                ? colors.danger
                                                : colors.primary
                                            : colors.progressTrack,
                                }}
                            />
                        );
                    })}
                </View>
            </View>

            <Pressable
                onPress={onPrimaryPress}
                disabled={disabled}
                style={({ pressed }) => ({
                    backgroundColor: buttonBackgroundColor,
                    borderRadius: 18,
                    paddingVertical: 16,
                    alignItems: "center",
                    opacity: disabled
                        ? 0.5
                        : pressed
                            ? 0.85
                            : 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                })}
            >
                {isPreparingRecording ? (
                    <ActivityIndicator
                        size="small"
                        color={colors.primaryForeground}
                    />
                ) : (
                    <Ionicons
                        name={
                            isCountIn
                                ? "close"
                                : isRecording
                                    ? "stop"
                                    : isRecorded
                                        ? "refresh"
                                        : "mic"
                        }
                        size={19}
                        color={colors.primaryForeground}
                    />
                )}

                <Text
                    style={{
                        color: colors.primaryForeground,
                        fontWeight: "900",
                        fontSize: 16,
                    }}
                >
                    {isPreparingRecording
                        ? "Kayıt hazırlanıyor..."
                        : getButtonLabel(phase)}
                </Text>
            </Pressable>
        </Animated.View>
    );
}