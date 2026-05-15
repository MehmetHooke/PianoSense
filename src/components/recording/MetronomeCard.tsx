import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export type RecordingPhase = "idle" | "countIn" | "recording" | "recorded";

type Props = {
    bpm: number;
    beatsBeforeRecording: number;
    currentBeat: number;
    phase: RecordingPhase;
    disabled: boolean;
    durationSeconds: number;
    onPrimaryPress: () => void;
    colors: AppColors;
};

function getTitle(phase: RecordingPhase) {
    if (phase === "countIn") return "Hazırlan";
    if (phase === "recording") return "Şimdi çal";
    if (phase === "recorded") return "Kayıt tamamlandı";
    return "2. Metronomla hazırlan";
}

function getDescription({
    phase,
    beatsBeforeRecording,
}: {
    phase: RecordingPhase;
    beatsBeforeRecording: number;
}) {
    if (phase === "countIn") {
        return "Kayıt birazdan otomatik başlayacak. Vuruşları takip et.";
    }

    if (phase === "recording") {
        return "Kayıt alınıyor. Metronom sesi kapalı, animasyon ritmi göstermeye devam ediyor.";
    }

    if (phase === "recorded") {
        return "Kaydın hazır. İstersen yeniden kaydedebilir veya analize gönderebilirsin.";
    }

    return `Kayda bastığında önce ${beatsBeforeRecording} vuruş metronom duyacaksın. Sonra kayıt otomatik başlayacak.`;
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
    beatsBeforeRecording,
    currentBeat,
    phase,
    disabled,
    durationSeconds,
    onPrimaryPress,
    colors,
}: Props) {
    const isCountIn = phase === "countIn";
    const isRecording = phase === "recording";
    const isRecorded = phase === "recorded";

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

    return (
        <View
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
                shadowOffset: { width: 0, height: 10 },
                elevation: 2,
            }}
        >
            <View
                style={{
                    alignItems: "center",
                    marginBottom: 18,
                }}
            >
                <View
                    style={{
                        width: 88,
                        height: 88,
                        borderRadius: 30,
                        backgroundColor: iconBackgroundColor,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: colors.softBorder,
                        marginBottom: 16,
                    }}
                >
                    <Ionicons name={getIconName(phase)} size={42} color={iconColor} />
                </View>

                <Text
                    style={{
                        textAlign: "center",
                        fontSize: 19,
                        fontWeight: "900",
                        color: colors.text,
                        marginBottom: 6,
                    }}
                >
                    {getTitle(phase)}
                </Text>

                <Text
                    style={{
                        textAlign: "center",
                        color: colors.mutedText,
                        lineHeight: 21,
                        fontSize: 14,
                        paddingHorizontal: 4,
                    }}
                >
                    {getDescription({ phase, beatsBeforeRecording })}
                </Text>
            </View>

            <View
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 22,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.softBorder,
                    marginBottom: 16,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 14,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: colors.subtleText,
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

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: colors.subtleText,
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
                            4/4
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        height: 72,
                        borderRadius: 20,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {isCountIn ? (
                        <>
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: 32,
                                    fontWeight: "900",
                                }}
                            >
                                {currentBeat} / {beatsBeforeRecording}
                            </Text>

                            <Text
                                style={{
                                    color: colors.subtleText,
                                    fontSize: 12,
                                    fontWeight: "700",
                                    marginTop: 2,
                                }}
                            >
                                Sesli hazırlık
                            </Text>
                        </>
                    ) : isRecording ? (
                        <>
                            <Text
                                style={{
                                    color: colors.danger,
                                    fontSize: 22,
                                    fontWeight: "900",
                                }}
                            >
                                {durationSeconds} sn
                            </Text>

                            <Text
                                style={{
                                    color: colors.subtleText,
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
                                size={28}
                                color={colors.success}
                            />

                            <Text
                                style={{
                                    color: colors.successForeground,
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
                                size={28}
                                color={colors.primary}
                            />

                            <Text
                                style={{
                                    color: colors.subtleText,
                                    fontSize: 12,
                                    fontWeight: "800",
                                    marginTop: 4,
                                }}
                            >
                                {beatsBeforeRecording} vuruş hazırlık
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
                    {Array.from({ length: beatsBeforeRecording }).map((_, index) => {
                        const beatNumber = index + 1;
                        const isActiveBeat =
                            (isCountIn || isRecording) && currentBeat === beatNumber;

                        return (
                            <View
                                key={beatNumber}
                                style={{
                                    width: isActiveBeat ? 28 : 10,
                                    height: 10,
                                    borderRadius: 999,
                                    backgroundColor: isActiveBeat
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
                    opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                })}
            >
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

                <Text
                    style={{
                        color: colors.primaryForeground,
                        fontWeight: "900",
                        fontSize: 16,
                    }}
                >
                    {getButtonLabel(phase)}
                </Text>
            </Pressable>
        </View>
    );
}