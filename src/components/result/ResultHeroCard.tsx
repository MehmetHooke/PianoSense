// src/components/result/ResultHeroCard.tsx

import type { AppColors } from "@/src/theme/colors";
import type { AnalysisJob } from "@/src/types/analysisJob";
import {
    formatScore,
    getFocusArea,
    getScoreColor,
    getScoreTitle,
    safeNumber,
} from "@/src/utils/resultUtils";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

const insightsLightImage = require("@/src/assets/images/insights/insights-light.png");
const insightsDarkImage = require("@/src/assets/images/insights/insights-dark.png");

type Props = {
    job: AnalysisJob;
    colors: AppColors;
    feedback: string;
};

export function ResultHeroCard({ job, colors, feedback }: Props) {
    const [imageLoading, setImageLoading] = useState(true);

    const result = job.result;
    if (!result) return null;

    const overallScore = safeNumber(result.overallScore);
    const scoreColor = getScoreColor(overallScore, colors);
    const scoreTitle = getScoreTitle(overallScore);
    const focusArea = getFocusArea(result);

    /**
     * ThemeProvider yapını görmediğim için burada mevcut token üzerinden karar veriyoruz.
     * Eğer ThemeContext içinde `theme === "dark"` gibi bir alan varsa bunu prop olarak
     * geçirmek daha temiz olur.
     */
    const isDarkTheme = colors.background === "#09090B";
    const heroImage = isDarkTheme ? insightsDarkImage : insightsLightImage;

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
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {imageLoading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : null}

                        <Image
                            source={heroImage}
                            resizeMode="contain"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            style={{
                                position: "absolute",
                                width: 132,
                                height: 132,
                                opacity: imageLoading ? 0 : 1,
                            }}
                        />
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