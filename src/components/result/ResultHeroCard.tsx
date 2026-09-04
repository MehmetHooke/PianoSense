// src/components/result/ResultHeroCard.tsx

import { getSongImageUrl } from "@/src/services/songImageService";
import type { AppColors } from "@/src/theme/colors";
import type { AnalysisJob } from "@/src/types/analysisJob";
import {
    formatScore,
    getFocusArea,
    getScoreColor,
    getScoreTitle,
    safeNumber,
} from "@/src/utils/resultUtils";
import { getSongOrderFromId } from "@/src/utils/song";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
    job: AnalysisJob;
    colors: AppColors;
    feedback: string;
};

export function ResultHeroCard({ job, colors, feedback }: Props) {

    const result = job.result;
    if (!result) return null;

    const overallScore = safeNumber(result.overallScore);
    const scoreColor = getScoreColor(overallScore, colors);
    const scoreTitle = getScoreTitle(overallScore);
    const focusArea = getFocusArea(result);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadSongImage() {
            const order = getSongOrderFromId(job.songId);

            if (!order) {
                if (isMounted) {
                    setImageUrl(null);
                    setImageLoading(false);
                }
                return;
            }

            try {
                const url = await getSongImageUrl(order);

                if (isMounted) {
                    setImageUrl(url);
                }
            } catch (error) {
                console.log("RESULT HERO IMAGE ERROR:", error);

                if (isMounted) {
                    setImageUrl(null);
                }
            } finally {
                if (isMounted) {
                    setImageLoading(false);
                }
            }
        }

        setImageLoading(true);
        loadSongImage();

        return () => {
            isMounted = false;
        };
    }, [job.songId]);

    return (
        <View style={{ marginBottom: 16 }}>
            <Text
                style={{
                    fontSize: 32,
                    fontWeight: "900",
                    color: colors.text,
                    marginBottom: 8,
                    letterSpacing: -0.8,
                }}
            >
                Performans Özeti
            </Text>

            <Text
                style={{
                    fontSize: 15,
                    color: colors.mutedText,
                    lineHeight: 22,
                    marginBottom: 18,
                }}
            >
                {feedback}
            </Text>

            <View
                style={{
                    backgroundColor: colors.card,
                    borderRadius: 30,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                    shadowOpacity: 1,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 2,
                    overflow: "hidden",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                            style={{
                                color: colors.mutedText,
                                fontSize: 13,
                                fontWeight: "700",
                                marginBottom: 4,
                            }}
                        >
                            Genel skor
                        </Text>

                        <Text
                            style={{
                                color: scoreColor,
                                fontSize: 58,
                                fontWeight: "900",
                                letterSpacing: -2,
                            }}
                        >
                            {formatScore(overallScore)}
                        </Text>

                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 18,
                                fontWeight: "900",
                                marginTop: 2,
                            }}
                        >
                            {scoreTitle}
                        </Text>
                    </View>

                    <View
                        style={{
                            width: 124,
                            height: 124,
                            borderRadius: 28,
                            backgroundColor: colors.primarySoft,
                            overflow: "hidden",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {imageLoading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : null}

                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                }}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={200}
                            />
                        ) : (
                            !imageLoading && (
                                <Ionicons
                                    name="musical-notes"
                                    size={42}
                                    color={colors.primary}
                                />
                            )
                        )}
                    </View>
                </View>

                <View
                    style={{
                        marginTop: 18,
                        backgroundColor: colors.surface,
                        borderRadius: 22,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: colors.softBorder,
                        flexDirection: "row",
                        gap: 12,
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 16,
                            backgroundColor: colors.primarySoft,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons
                            name={focusArea.iconName}
                            size={21}
                            color={colors.primary}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 14,
                                fontWeight: "900",
                            }}
                        >
                            {focusArea.title}
                        </Text>

                        <Text
                            style={{
                                color: colors.mutedText,
                                fontSize: 12,
                                lineHeight: 18,
                                marginTop: 2,
                            }}
                        >
                            {focusArea.description}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}