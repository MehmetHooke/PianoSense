// src/components/result/ResultNoteDetailItem.tsx

import type { AppColors } from "@/src/theme/colors";
import type { AnalysisResultItem } from "@/src/types/analysisJob";
import {
    alpha,
    formatSeconds,
    getStatusColor,
    getStatusDescription,
    getStatusIcon,
    getStatusLabel,
} from "@/src/utils/resultUtils";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  item: AnalysisResultItem;
  index: number;
  colors: AppColors;
};

export function ResultNoteDetailItem({ item, index, colors }: Props) {
  const statusColor = getStatusColor(item.status, colors);
  const icon = getStatusIcon(item.status);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          backgroundColor: alpha(statusColor, 0.14),
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: alpha(statusColor, 0.18),
        }}
      >
        <Ionicons name={icon} size={18} color={statusColor} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          {index + 1}. {item.expectedNote ?? "-"} → {item.playedNote ?? "-"}
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            marginTop: 3,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          {getStatusDescription(item)}
        </Text>

        <Text
          style={{
            color: colors.subtleText,
            marginTop: 4,
            fontSize: 12,
            lineHeight: 17,
          }}
        >
          Beklenen: {formatSeconds(item.expectedStart)}
          {item.playedStart !== null && item.playedStart !== undefined
            ? ` / Çalınan: ${formatSeconds(item.playedStart)}`
            : ""}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: alpha(statusColor, 0.13),
          borderRadius: 999,
          paddingVertical: 6,
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            color: statusColor,
            fontSize: 12,
            fontWeight: "900",
          }}
        >
          {getStatusLabel(item.status)}
        </Text>
      </View>
    </View>
  );
}