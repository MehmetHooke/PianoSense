import { useAppTheme } from "@/src/theme/useTheme";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ParentChildOverviewScreen() {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 22 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.8,
          }}
        >
          Çocuğum
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 21,
            marginTop: 8,
          }}
        >
          Bağlı çocuğunun çalışma geçmişini ve gelişim durumunu burada
          görebilirsin.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 30,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.softBorder,
          marginBottom: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 22,
              backgroundColor: alpha(colors.primary, 0.12),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={27} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 20,
                fontWeight: "900",
                letterSpacing: -0.3,
              }}
            >
              Ahmet T.
            </Text>

            <Text
              style={{
                color: colors.mutedText,
                fontSize: 13,
                fontWeight: "700",
                marginTop: 4,
              }}
            >
              Son çalışma: Dün
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginVertical: 18,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          <MetricBox colors={colors} value="8" label="Bu ay analiz" />
          <MetricBox colors={colors} value="%76" label="Ortalama" />
          <MetricBox colors={colors} value="3" label="Bu hafta" />
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 26,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.softBorder,
          marginBottom: 22,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            fontWeight: "900",
            letterSpacing: -0.3,
          }}
        >
          Gelişim yorumu
        </Text>

        <Text
          style={{
            color: colors.mutedText,
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 21,
            marginTop: 8,
          }}
        >
          Son çalışmalarda nota doğruluğu daha dengeli görünüyor. Zamanlama için
          parçaya başlamadan önce kısa metronom tekrarı faydalı olabilir.
        </Text>
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "900",
          letterSpacing: -0.3,
          marginBottom: 12,
        }}
      >
        Son çalışmalar
      </Text>

      <View style={{ gap: 12 }}>
        <RecentPracticeCard
          colors={colors}
          songTitle="Song 004"
          dateText="Dün"
          scoreText="%82"
          comment="Güzel bir tekrar. Nota doğruluğu iyi seviyede."
        />

        <RecentPracticeCard
          colors={colors}
          songTitle="Song 002"
          dateText="3 gün önce"
          scoreText="%71"
          comment="Ritim tarafında biraz daha sakin tekrar iyi olur."
        />

        <RecentPracticeCard
          colors={colors}
          songTitle="Song 001"
          dateText="Geçen hafta"
          scoreText="%68"
          comment="Parçaya girişlerde küçük zamanlama farkları var."
        />
      </View>

      <Pressable
        style={({ pressed }) => ({
          marginTop: 22,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          borderRadius: 22,
          paddingVertical: 15,
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <Text
          style={{
            color: colors.inverseText,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          Tüm çalışmaları gör
        </Text>
      </Pressable>
    </ScrollView>
  );
}

type ParentChildColors = ReturnType<typeof useAppTheme>["colors"];

function MetricBox({
  colors,
  value,
  label,
}: {
  colors: ParentChildColors;
  value: string;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.elevatedCard,
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.softBorder,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: colors.mutedText,
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function RecentPracticeCard({
  colors,
  songTitle,
  dateText,
  scoreText,
  comment,
}: {
  colors: ParentChildColors;
  songTitle: string;
  dateText: string;
  scoreText: string;
  comment: string;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.softBorder,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "900",
            }}
          >
            {songTitle}
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "700",
              marginTop: 4,
            }}
          >
            {dateText}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: alpha(colors.success, 0.12),
            borderRadius: 16,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}
        >
          <Text
            style={{
              color: colors.success,
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            {scoreText}
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: colors.mutedText,
          fontSize: 13,
          fontWeight: "600",
          lineHeight: 19,
          marginTop: 10,
        }}
      >
        {comment}
      </Text>
    </View>
  );
}