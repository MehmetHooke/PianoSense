// src/components/result/ResultEmptyNotesCard.tsx

import type { AppColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  colors: AppColors;
};

export function ResultEmptyNotesCard({ colors }: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 18,
          backgroundColor: colors.infoSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Ionicons name="information-circle-outline" size={24} color={colors.info} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        Nota detayı bulunamadı
      </Text>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 13,
          lineHeight: 19,
          textAlign: "center",
          marginTop: 5,
        }}
      >
        Skorlar hesaplandı ama nota bazlı detay listesi bu analizde kaydedilmemiş olabilir.
      </Text>
    </View>
  );
}