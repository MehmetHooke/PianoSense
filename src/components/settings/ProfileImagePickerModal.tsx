// src/components/profile/ProfileImagePickerModal.tsx

import { profileImageOptions } from "@/src/constants/profileImages";
import { useAppTheme } from "@/src/theme/useTheme";
import type { ProfileImageId } from "@/src/types/userProfile";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    Text,
    View,
} from "react-native";

type Props = {
    visible: boolean;
    selectedImageId: ProfileImageId;
    saving: boolean;
    onClose: () => void;
    onSelect: (imageId: ProfileImageId) => void;
};

export function ProfileImagePickerModal({
    visible,
    selectedImageId,
    saving,
    onClose,
    onSelect,
}: Props) {
    const { colors } = useAppTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 18,
                }}
            >
                <Pressable
                    onPress={onClose}
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }}
                />

                <View
                    style={{
                        width: "100%",
                        maxWidth: 390,
                        backgroundColor: colors.card,
                        borderRadius: 32,
                        paddingHorizontal: 20,
                        paddingTop: 18,
                        paddingBottom: 24,
                        borderWidth: 1,
                        borderColor: colors.softBorder,
                        shadowColor: colors.shadow,
                        shadowOpacity: 0.16,
                        shadowRadius: 24,
                        shadowOffset: { width: 0, height: 14 },
                        elevation: 8,
                    }}
                >


                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <View>
                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: 21,
                                    fontWeight: "900",
                                    letterSpacing: -0.4,
                                }}
                            >
                                Profil resmini seç
                            </Text>

                            <Text
                                style={{
                                    color: colors.mutedText,
                                    fontSize: 13,
                                    fontWeight: "600",
                                    marginTop: 4,
                                }}
                            >
                                Seçimin hesabına kaydedilir.
                            </Text>
                        </View>

                        <Pressable
                            onPress={onClose}
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 14,
                                backgroundColor: colors.background,
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 1,
                                borderColor: colors.softBorder,
                            }}
                        >
                            <Ionicons name="close" size={20} color={colors.text} />
                        </Pressable>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 12,
                        }}
                    >
                        {profileImageOptions.map((option) => {
                            const selected = option.id === selectedImageId;

                            return (
                                <Pressable
                                    key={option.id}
                                    disabled={saving}
                                    onPress={() => onSelect(option.id)}
                                    style={({ pressed }) => ({
                                        width: "47.8%",
                                        borderRadius: 24,
                                        padding: 12,
                                        backgroundColor: selected
                                            ? alpha(colors.primary, 0.1)
                                            : colors.background,
                                        borderWidth: 2,
                                        borderColor: selected ? colors.primary : colors.softBorder,
                                        opacity: pressed || saving ? 0.82 : 1,
                                        transform: [{ scale: pressed ? 0.98 : 1 }],
                                    })}
                                >
                                    <View
                                        style={{
                                            height: 124,
                                            borderRadius: 20,
                                            backgroundColor: colors.primarySoft,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Image
                                            source={option.source}
                                            resizeMode="cover"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        />

                                        {selected ? (
                                            <View
                                                style={{
                                                    position: "absolute",
                                                    right: 8,
                                                    top: 8,
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: 999,
                                                    backgroundColor: colors.primary,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {saving ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color={colors.primaryForeground}
                                                    />
                                                ) : (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={18}
                                                        color={colors.primaryForeground}
                                                    />
                                                )}
                                            </View>
                                        ) : null}
                                    </View>

                                    <Text
                                        style={{
                                            color: selected ? colors.primary : colors.text,
                                            fontSize: 13,
                                            fontWeight: "900",
                                            textAlign: "center",
                                            marginTop: 10,
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}