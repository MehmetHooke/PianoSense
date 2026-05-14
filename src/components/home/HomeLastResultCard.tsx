import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type LastResult = {
  jobId: string;
  exerciseTitle: string;
  overallScore: number;
  pitchScore: number;
  timingScore: number;
};

type Props = {
  result: LastResult | null;
  onOpenResult: (jobId: string) => void;
  onStartPractice: () => void;
};

export function HomeLastResultCard({
  result,
  onOpenResult,
  onStartPractice,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "900",
          marginBottom: 12,
        }}
      >
        Son analiz
      </Text>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 26,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.softBorder,
        }}
      >
        {result ? (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 17,
                    fontWeight: "900",
                  }}
                >
                  {result.exerciseTitle}
                </Text>

                <Text
                  style={{
                    color: colors.mutedText,
                    fontSize: 13,
                    fontWeight: "600",
                    marginTop: 3,
                  }}
                >
                  En son çalışmandan alınan sonuç
                </Text>
              </View>

              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 24,
                  backgroundColor: colors.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 20,
                    fontWeight: "900",
                  }}
                >
                  %{result.overallScore}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 16,
              }}
            >
              <ScoreMiniItem label="Nota" value={result.pitchScore} />
              <ScoreMiniItem label="Zamanlama" value={result.timingScore} />
            </View>

            <Pressable
              onPress={() => onOpenResult(result.jobId)}
              style={({ pressed }) => ({
                marginTop: 16,
                backgroundColor: pressed
                  ? colors.surfacePressed
                  : colors.surface,
                borderRadius: 16,
                paddingVertical: 13,
                alignItems: "center",
              })}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Sonucu görüntüle
              </Text>
            </Pressable>
          </>
        ) : (
          <View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 18,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={23}
                color={colors.mutedText}
              />
            </View>

            <Text
              style={{
                color: colors.text,
                fontSize: 17,
                fontWeight: "900",
              }}
            >
              Henüz analiz yok
            </Text>

            <Text
              style={{
                color: colors.mutedText,
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "600",
                marginTop: 5,
              }}
            >
              İlk egzersizini tamamladığında sonucun burada görünecek.
            </Text>

            <Pressable
              onPress={onStartPractice}
              style={({ pressed }) => ({
                marginTop: 16,
                backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                borderRadius: 16,
                paddingVertical: 13,
                alignItems: "center",
              })}
            >
              <Text
                style={{
                  color: colors.primaryForeground,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                İlk analizi başlat
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function ScoreMiniItem({ label, value }: { label: string; value: number }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 12,
      }}
    >
      <Text
        style={{
          color: colors.mutedText,
          fontSize: 12,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "900",
          marginTop: 3,
        }}
      >
        %{value}
      </Text>
    </View>
  );
}