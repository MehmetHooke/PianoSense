import { InsightsContent } from "@/src/components/insights/InsightsContent";
import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

export default function TeacherStudentDetailScreen() {
    const { colors } = useAppTheme();
    const params = useLocalSearchParams<{
        studentId?: string;
        name?: string;
        surname?: string;
        displayName?: string;
        studentCode?: string;
    }>();

    const [refreshing, setRefreshing] = useState(false);
    const [refreshToken, setRefreshToken] = useState(0);

    const studentId = Array.isArray(params.studentId)
        ? params.studentId[0]
        : params.studentId;

    const name = Array.isArray(params.name) ? params.name[0] : params.name;
    const surname = Array.isArray(params.surname)
        ? params.surname[0]
        : params.surname;
    const displayName = Array.isArray(params.displayName)
        ? params.displayName[0]
        : params.displayName;
    const studentCode = Array.isArray(params.studentCode)
        ? params.studentCode[0]
        : params.studentCode;

    const studentFullName =
        `${name ?? ""} ${surname ?? ""}`.trim() ||
        displayName ||
        "Öğrenci Detayı";

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshToken((value) => value + 1);
    }, []);

    const handleRefreshEnd = useCallback(() => {
        setRefreshing(false);
    }, []);

    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: colors.background,
            }}
            contentContainerStyle={{
                paddingHorizontal: 18,
                paddingTop: 80,
                paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
        >
            <View
                style={{
                    marginBottom: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.text} />
                </Pressable>

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: 27,

                            fontWeight: "900",
                            letterSpacing: -0.8,
                        }}
                        numberOfLines={1}
                    >
                        {studentFullName}
                    </Text>

                    <Text
                        style={{
                            color: colors.mutedText,
                            fontSize: 14,
                            fontWeight: "600",
                            lineHeight: 21,
                            marginTop: 3,
                        }}
                        numberOfLines={1}
                    >
                        {studentCode
                            ? `${studentCode} kodlu öğrencinin analiz geçmişi`
                            : "Öğrencinin analiz geçmişi ve gelişim özeti"}
                    </Text>
                </View>
            </View>

            {studentId ? (
                <InsightsContent
                    targetUserId={studentId}
                    mode="teacher"
                    refreshToken={refreshToken}
                    onRefreshEnd={handleRefreshEnd}
                />
            ) : (
                <View
                    style={{
                        backgroundColor: colors.card,
                        borderRadius: 26,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: 18,
                            fontWeight: "900",
                        }}
                    >
                        Öğrenci bulunamadı
                    </Text>

                    <Text
                        style={{
                            marginTop: 8,
                            color: colors.mutedText,
                            fontSize: 14,
                            fontWeight: "600",
                            lineHeight: 20,
                        }}
                    >
                        Öğrenci bilgisi eksik geldi. Lütfen tekrar dene.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}