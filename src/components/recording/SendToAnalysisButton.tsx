import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type SubmitStep = "idle" | "uploading" | "creatingJob";

type Props = {
  disabled: boolean;
  submitting: boolean;
  submitStep: SubmitStep;
  onPress: () => void;
  colors: AppColors;
};

function getLabel({
  submitting,
  submitStep,
}: {
  submitting: boolean;
  submitStep: SubmitStep;
}) {
  if (!submitting) return "Analize Gönder";

  if (submitStep === "uploading") {
    return "Kayıt yükleniyor...";
  }

  if (submitStep === "creatingJob") {
    return "Analiz başlatılıyor...";
  }

  return "Hazırlanıyor...";
}

export function SendToAnalysisButton({
  disabled,
  submitting,
  submitStep,
  onPress,
  colors,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 17,
        alignItems: "center",
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 2,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {submitting ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Ionicons
            name="analytics"
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
          {getLabel({ submitting, submitStep })}
        </Text>
      </View>
    </Pressable>
  );
}