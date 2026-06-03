import { useAppAlert } from "@/src/hooks/useAppAlert";
import { useAppTheme } from "@/src/theme/useTheme";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Pressable, Text, View } from "react-native";

type Props = {
    studentCode: string;
};

export function StudentCodeCard({ studentCode }: Props) {
    const { colors } = useAppTheme();

    const { showAlert } = useAppAlert();

    const handleCopyCode = async () => {
        await Clipboard.setStringAsync(studentCode);

        showAlert({
            type: "success",
            title: "Kod kopyalandı",
            message: "Öğrenci kodun panoya kopyalandı.",
        });
    };

    return (
        <View>
            <View
                style={{
                    backgroundColor: colors.elevatedCard,
                    borderRadius: 22,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.softBorder,
                }}
            >
                <Text
                    style={{
                        color: colors.text,
                        fontSize: 14,
                        fontWeight: "900",
                    }}
                >
                    ID
                </Text>

                <Text
                    style={{
                        color: colors.mutedText,
                        fontSize: 12,
                        fontWeight: "600",
                        lineHeight: 18,
                        marginTop: 5,
                    }}
                >
                    Kopyala ve paylaş !
                </Text>

                <Pressable
                    onPress={handleCopyCode}
                    style={({ pressed }) => ({
                        marginTop: 15,
                        backgroundColor: colors.card,
                        borderRadius: 20,
                        paddingVertical: 14,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: alpha(colors.primary, 0.18),
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: pressed ? 0.86 : 1,
                        transform: [{ scale: pressed ? 0.99 : 1 }],
                    })}
                >
                    <View>
                        <Text
                            style={{
                                color: colors.subtleText,
                                fontSize: 11,
                                fontWeight: "900",
                                letterSpacing: 0.8,
                                textTransform: "uppercase",
                            }}
                        >
                            PianoSense ID
                        </Text>

                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 28,
                                fontWeight: "900",
                                letterSpacing: 3,
                                marginTop: 3,
                            }}
                        >
                            {studentCode}
                        </Text>
                    </View>

                    <View
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 15,
                            backgroundColor: colors.primarySoft,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons
                            name="copy-outline"
                            size={20}
                            color={colors.primary}
                        />
                    </View>
                </Pressable>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 8,
                    marginTop: 12,
                    paddingHorizontal: 2,
                }}
            >
                <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={colors.successForeground}
                    style={{ marginTop: 1 }}
                />

                <Text
                    style={{
                        flex: 1,
                        color: colors.mutedText,
                        fontSize: 12,
                        fontWeight: "600",
                        lineHeight: 18,
                    }}
                >
                    Bu kod seni takip etmelerini sağlayacak
                </Text>
            </View>
        </View>
    );
}