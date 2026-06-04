import { useAppAlert } from "@/src/hooks/useAppAlert";
import { linkChildByStudentCode } from "@/src/services/parentService";
import type { AppColors } from "@/src/theme/colors";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View
} from "react-native";

type Props = {
    colors: AppColors;
    parentId?: string;
};

export function ParentChildLinkCard({ colors, parentId }: Props) {
    const [studentCode, setStudentCode] = useState("");
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAppAlert();

    const normalizedCode = studentCode.trim().toUpperCase();

    async function handleLinkChild() {
        if (!parentId) {
            showAlert({
                type: "error",
                title: "Hesap bulunamadı",
                message: "Çocuk eklemek için veli hesabına giriş yapmalısın.",
            });
            return;
        }

        if (!normalizedCode) {
            showAlert({
                type: "warning",
                title: "Kod gerekli",
                message: "Lütfen öğrencinin kodunu gir."
            });
            return;
        }

        try {
            setLoading(true);

            const child = await linkChildByStudentCode({
                parentId,
                studentCode: normalizedCode,
                autoApprove: true,
            });

            setStudentCode("");

            showAlert({
                type: "success",
                title: "Çocuk eklendi",
                message: `${child.displayName || "Öğrenci"} artık veli panelinde görünecek.`,
            });
        } catch (error) {
            console.log("LINK CHILD ERROR:", error);

            showAlert({
                type: "error",
                title: "Çocuk eklenemedi",
                message: "Bağlantı oluşturulurken bir sorun oluştu. Lütfen tekrar dene.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ gap: 14 }}>
            <View
                style={{
                    backgroundColor: colors.elevatedCard,
                    borderRadius: 20,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.softBorder,
                    flexDirection: "row",
                    gap: 11,
                    alignItems: "flex-start",
                }}
            >
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 14,
                        backgroundColor: alpha(colors.primary, 0.12),
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: alpha(colors.primary, 0.14),
                    }}
                >
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={19}
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
                        Öğrenci kodu ile bağlan
                    </Text>

                    <Text
                        style={{
                            color: colors.mutedText,
                            fontSize: 12,
                            fontWeight: "600",
                            lineHeight: 18,
                            marginTop: 4,
                        }}
                    >
                        Çocuğunun profilinde görünen öğrenci kodunu girerek çalışma
                        geçmişini veli panelinde takip edebilirsin.
                    </Text>
                </View>
            </View>

            <View>
                <Text
                    style={{
                        color: colors.text,
                        fontSize: 13,
                        fontWeight: "900",
                        marginBottom: 8,
                    }}
                >
                    Öğrenci kodu
                </Text>

                <TextInput
                    value={studentCode}
                    onChangeText={(value) => setStudentCode(value.toUpperCase())}
                    placeholder="Örn: A7K2M9"
                    placeholderTextColor={colors.inputPlaceholder}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!loading}
                    maxLength={8}
                    style={{
                        backgroundColor: colors.inputBackground,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: colors.inputBorder,
                        paddingHorizontal: 14,
                        paddingVertical: 13,
                        color: colors.text,
                        fontSize: 15,
                        fontWeight: "800",
                        letterSpacing: 1.2,
                    }}
                />
            </View>

            <Pressable
                onPress={handleLinkChild}
                disabled={loading}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                    borderRadius: 18,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    opacity: loading ? 0.75 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                })}
            >
                {loading ? (
                    <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                    <>
                        <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color={colors.primaryForeground}
                        />

                        <Text
                            style={{
                                color: colors.primaryForeground,
                                fontSize: 14,
                                fontWeight: "900",
                            }}
                        >
                            Çocuğu ekle
                        </Text>
                    </>
                )}
            </Pressable>

            <Text
                style={{
                    color: colors.subtleText,
                    fontSize: 11,
                    fontWeight: "600",
                    lineHeight: 16,
                }}
            >
                Not: Şu an geliştirme aşamasında bağlantı otomatik onaylanır. İleride
                öğrenci onayı eklendiğinde istek önce beklemede kalacak.
            </Text>
        </View>
    );
}