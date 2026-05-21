import {
    DEFAULT_PROFILE_IMAGE_ID,
    getProfileImageSource,
} from "@/src/constants/profileImages";
import { useAuth } from "@/src/context/AuthContext";
import { FollowedStudent, followStudentByCode, listenFollowedStudents } from "@/src/services/teacherStudentService";
import { Image } from "expo-image";

import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

export default function TeacherStudentsScreen() {
    const { colors } = useAppTheme();
    const { user } = useAuth();

    const [studentCode, setStudentCode] = useState("");
    const [students, setStudents] = useState<FollowedStudent[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = listenFollowedStudents(
            user.uid,
            setStudents,
            (error) => {
                console.log("FOLLOWED STUDENTS LISTEN ERROR:", error);
                setErrorMessage("Öğrenci listesi yüklenemedi.");
            }
        );

        return unsubscribe;
    }, [user?.uid]);

    async function handleFollowStudent() {
        if (!user?.uid || isSubmitting) return;

        const code = studentCode.trim().toUpperCase();

        if (!code) {
            setErrorMessage("Lütfen öğrenci kodu gir.");
            return;
        }

        try {
            setErrorMessage("");
            setIsSubmitting(true);

            await followStudentByCode({
                teacherId: user.uid,
                studentCode: code,
            });

            setStudentCode("");
        } catch (error: any) {
            console.log("FOLLOW STUDENT ERROR:", error);
            setErrorMessage(error?.message ?? "Öğrenci takibe alınamadı.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function openStudent(student: FollowedStudent) {
        router.push({
            pathname: "/student/[studentId]",
            params: {
                studentId: student.studentId,
                name: student.name,
                surname: student.surname,
                displayName: student.displayName,
                studentCode: student.studentCode,
            },
        });
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                padding: 20,
                paddingTop: 60,
                paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
        >
            <Text
                style={{
                    color: colors.text,
                    fontSize: 30,
                    fontWeight: "900",
                    letterSpacing: -0.8,
                }}
            >
                Öğrenciler
            </Text>

            <Text
                style={{
                    marginTop: 6,
                    color: colors.mutedText,
                    fontSize: 14,
                    fontWeight: "600",
                    lineHeight: 20,
                }}
            >
                Öğrenci kodu ile öğrenciyi takibe al ve analiz geçmişini görüntüle.
            </Text>

            <View
                style={{
                    marginTop: 24,
                    backgroundColor: colors.card,
                    borderRadius: 26,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            >
                <Text
                    style={{
                        color: colors.text,
                        fontSize: 17,
                        fontWeight: "900",
                    }}
                >
                    Öğrenciyi takibe al
                </Text>

                <View
                    style={{
                        marginTop: 14,
                        flexDirection: "row",
                        gap: 10,
                    }}
                >
                    <TextInput
                        value={studentCode}
                        onChangeText={(value) => {
                            setStudentCode(value.toUpperCase());
                            setErrorMessage("");
                        }}
                        placeholder="Örn: A7K92Q"
                        placeholderTextColor={colors.subtleText}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        style={{
                            flex: 1,
                            height: 50,
                            borderRadius: 18,
                            paddingHorizontal: 16,
                            backgroundColor: colors.surface,
                            color: colors.text,
                            borderWidth: 1,
                            borderColor: colors.softBorder,
                            fontSize: 15,
                            fontWeight: "800",
                        }}
                    />

                    <Pressable
                        onPress={handleFollowStudent}
                        disabled={isSubmitting}
                        style={{
                            minWidth: 54,
                            height: 50,
                            paddingHorizontal: 16,
                            borderRadius: 18,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colors.primary,
                            opacity: isSubmitting ? 0.65 : 1,
                        }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={colors.primaryForeground} />
                        ) : (
                            <Ionicons
                                name="person-add"
                                size={21}
                                color={colors.primaryForeground}
                            />
                        )}
                    </Pressable>
                </View>

                {errorMessage ? (
                    <Text
                        style={{
                            marginTop: 12,
                            color: colors.danger ?? colors.text,
                            fontSize: 13,
                            fontWeight: "700",
                            lineHeight: 18,
                        }}
                    >
                        {errorMessage}
                    </Text>
                ) : (
                    <Text
                        style={{
                            marginTop: 12,
                            color: colors.mutedText,
                            fontSize: 13,
                            fontWeight: "600",
                            lineHeight: 18,
                        }}
                    >
                        Öğrenci kodunu girerek öğrenciyi takip listene ekleyebilirsin.
                    </Text>
                )}
            </View>

            <View
                style={{
                    marginTop: 20,
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
                    Takip edilen öğrenciler
                </Text>

                {students.length === 0 ? (
                    <Text
                        style={{
                            marginTop: 8,
                            color: colors.mutedText,
                            fontSize: 14,
                            fontWeight: "600",
                            lineHeight: 20,
                        }}
                    >
                        Henüz takip ettiğin öğrenci yok. Öğrenci kodu girerek ilk öğrencini
                        ekleyebilirsin.
                    </Text>
                ) : (
                    <View style={{ marginTop: 14, gap: 10 }}>
                        {students.map((student) => {
                            const fullName =
                                `${student.name ?? ""} ${student.surname ?? ""}`.trim() ||
                                student.displayName ||
                                "İsimsiz Öğrenci";

                            const profileImageSource = getProfileImageSource(
                                student.profileImageId ?? DEFAULT_PROFILE_IMAGE_ID,
                            );

                            return (
                                <Pressable
                                    key={student.studentId}
                                    onPress={() => openStudent(student)}
                                    style={{
                                        backgroundColor: colors.surface,
                                        borderRadius: 22,
                                        padding: 14,
                                        borderWidth: 1,
                                        borderColor: colors.softBorder,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            flex: 1,
                                            gap: 12,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 52,
                                                height: 52,
                                                borderRadius: 18,
                                                backgroundColor: colors.card,
                                                borderWidth: 1,
                                                borderColor: colors.softBorder,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Image
                                                source={profileImageSource}
                                                style={{
                                                    width: 52,
                                                    height: 52,
                                                }}
                                                contentFit="cover"
                                            />
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    color: colors.text,
                                                    fontSize: 16,
                                                    fontWeight: "900",
                                                }}
                                                numberOfLines={1}
                                            >
                                                {fullName}
                                            </Text>

                                            <Text
                                                style={{
                                                    marginTop: 4,
                                                    color: colors.mutedText,
                                                    fontSize: 12,
                                                    fontWeight: "700",
                                                }}
                                                numberOfLines={1}
                                            >
                                                Kod: {student.studentCode}
                                            </Text>
                                        </View>
                                    </View>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={colors.subtleText}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}