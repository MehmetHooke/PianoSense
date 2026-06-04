import { RecentAnalysisCard } from "@/src/components/insights/RecentAnalysisCard";
import { getProfileImageSource } from "@/src/constants/profileImages";
import { listenCompletedAnalysisJobsByUserId } from "@/src/services/analysisJobService";
import type { AppColors } from "@/src/theme/colors";
import type { AnalysisJob } from "@/src/types/analysisJob";
import type { ParentLinkedChild } from "@/src/types/parent";
import { alpha } from "@/src/utils/color";
import { calculateInsightsSummary } from "@/src/utils/insights";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  colors: AppColors;
  child: ParentLinkedChild;
  expanded: boolean;
  onPress: () => void;
  onOpenJob: (jobId: string) => void;
};

const accordionTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}

function getJobDate(job: AnalysisJob) {
  return (
    toDate(job.completedAt) ??
    toDate(job.updatedAt) ??
    toDate(job.createdAt)
  );
}

function getThisWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;

  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  return start;
}

function getThisMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function countJobsAfter(jobs: AnalysisJob[], startDate: Date) {
  return jobs.filter((job) => {
    const date = getJobDate(job);
    return date ? date >= startDate : false;
  }).length;
}

export function ParentChildAccordion({
  colors,
  child,
  expanded,
  onPress,
  onOpenJob,
}: Props) {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    if (!child.studentId) {
      setJobs([]);
      setJobsLoading(false);
      return;
    }

    setJobsLoading(true);

    const unsubscribe = listenCompletedAnalysisJobsByUserId(
      child.studentId,
      (items) => {
        setJobs(items);
        setJobsLoading(false);
      },
      (error) => {
        console.log("PARENT CHILD ANALYSIS LISTEN ERROR:", error);
        setJobs([]);
        setJobsLoading(false);
      },
    );

    return unsubscribe;
  }, [child.studentId]);

  const summary = useMemo(() => calculateInsightsSummary(jobs), [jobs]);

  const thisMonthCount = useMemo(
    () => countJobsAfter(jobs, getThisMonthStart()),
    [jobs],
  );

  const thisWeekCount = useMemo(
    () => countJobsAfter(jobs, getThisWeekStart()),
    [jobs],
  );

  const recentJobs = jobs.slice(0, 6);

  const childName =
    `${child.name ?? ""} ${child.surname ?? ""}`.trim() ||
    child.displayName ||
    "İsimsiz Öğrenci";

  const profileImageSource = getProfileImageSource(child.profileImageId);

  return (
    <Animated.View
      layout={accordionTransition}
      style={{
        backgroundColor: colors.card,
        borderRadius: 26,
        padding: 16,
        borderWidth: 1,
        borderColor: expanded ? alpha(colors.primary, 0.22) : colors.softBorder,
        shadowColor: colors.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 7 },
        elevation: 2,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 21,
            backgroundColor: colors.primarySoft,
            borderWidth: 2,
            borderColor: colors.softBorder,
            overflow: "hidden",
          }}
        >
          <Image
            source={profileImageSource}
            resizeMode="cover"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.text,
              fontSize: 17,
              fontWeight: "900",
              letterSpacing: -0.25,
            }}
          >
            {childName}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 5,
            }}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.mutedText}
            />

            <Text
              numberOfLines={1}
              style={{
                color: colors.mutedText,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              Son çalışma: {summary.lastActivityText ?? "Henüz yok"}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 13,
            backgroundColor: expanded
              ? colors.primarySoft
              : colors.elevatedCard,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: expanded
              ? alpha(colors.primary, 0.18)
              : colors.softBorder,
          }}
        >
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={expanded ? colors.primary : colors.mutedText}
          />
        </View>
      </Pressable>

      {expanded ? (
        <Animated.View
          layout={accordionTransition}
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.softBorder,
          }}
        >
          {jobsLoading ? (
            <View
              style={{
                paddingVertical: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color={colors.primary} />

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 13,
                  fontWeight: "700",
                  marginTop: 10,
                }}
              >
                Analizler yükleniyor...
              </Text>
            </View>
          ) : (
            <>
              <ParentChildMetricRow
                colors={colors}
                averageScore={summary.averageScore}
                averagePitchScore={summary.averagePitchScore}
                averageTimingScore={summary.averageTimingScore}
                hasData={summary.totalAnalyses > 0}
              />

              <ParentChildAnalysisStats
                colors={colors}
                thisMonthCount={thisMonthCount}
                thisWeekCount={thisWeekCount}
              />

              <ParentChildPracticeList
                colors={colors}
                jobs={recentJobs}
                onOpenJob={onOpenJob}
              />
            </>
          )}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function ParentChildMetricRow({
  colors,
  averageScore,
  averagePitchScore,
  averageTimingScore,
  hasData,
}: {
  colors: AppColors;
  averageScore: number;
  averagePitchScore: number;
  averageTimingScore: number;
  hasData: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
      }}
    >
      <MetricMiniCard
        colors={colors}
        label="Ortalama"
        value={hasData ? `%${averageScore}` : "--"}
        iconName="analytics-outline"
      />

      <MetricMiniCard
        colors={colors}
        label="Nota"
        value={hasData ? `%${averagePitchScore}` : "--"}
        iconName="musical-notes-outline"
      />

      <MetricMiniCard
        colors={colors}
        label="Zamanlama"
        value={hasData ? `%${averageTimingScore}` : "--"}
        iconName="timer-outline"
      />
    </View>
  );
}

function MetricMiniCard({
  colors,
  label,
  value,
  iconName,
}: {
  colors: AppColors;
  label: string;
  value: string;
  iconName: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.elevatedCard,
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.softBorder,
        minHeight: 92,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 13,
          backgroundColor: alpha(colors.primary, 0.1),
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 9,
        }}
      >
        <Ionicons name={iconName} size={17} color={colors.primary} />
      </View>

      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        minimumFontScale={0.75}
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "900",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: colors.mutedText,
          fontSize: 11,
          fontWeight: "800",
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ParentChildAnalysisStats({
  colors,
  thisMonthCount,
  thisWeekCount,
}: {
  colors: AppColors;
  thisMonthCount: number;
  thisWeekCount: number;
}) {
  return (
    <View
      style={{
        marginTop: 12,
        flexDirection: "row",
        gap: 10,
      }}
    >
      <AnalysisCountCard
        colors={colors}
        title="Bu ay"
        value={String(thisMonthCount)}
        description="analiz"
        iconName="calendar-outline"
      />

      <AnalysisCountCard
        colors={colors}
        title="Bu hafta"
        value={String(thisWeekCount)}
        description="analiz"
        iconName="calendar-number-outline"
      />
    </View>
  );
}

function AnalysisCountCard({
  colors,
  title,
  value,
  description,
  iconName,
}: {
  colors: AppColors;
  title: string;
  value: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 13,
        borderWidth: 1,
        borderColor: colors.softBorder,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 15,
          backgroundColor: alpha(colors.secondary, 0.1),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={iconName} size={19} color={colors.secondary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.mutedText,
            fontSize: 11,
            fontWeight: "800",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: colors.text,
            fontSize: 19,
            fontWeight: "900",
            marginTop: 1,
          }}
        >
          {value}{" "}
          <Text
            style={{
              color: colors.mutedText,
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            {description}
          </Text>
        </Text>
      </View>
    </View>
  );
}

function ParentChildPracticeList({
  colors,
  jobs,
  onOpenJob,
}: {
  colors: AppColors;
  jobs: AnalysisJob[];
  onOpenJob: (jobId: string) => void;
}) {
  return (
    <View style={{ marginTop: 18 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View>
          <Text
            style={{
              color: colors.text,
              fontSize: 17,
              fontWeight: "900",
              letterSpacing: -0.25,
            }}
          >
            Çalışılan parçalar
          </Text>

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 12,
              fontWeight: "600",
              marginTop: 3,
            }}
          >
            Son tamamlanan çalışmalar
          </Text>
        </View>

        <Text
          style={{
            color: colors.primary,
            fontSize: 12,
            fontWeight: "900",
          }}
        >
          {jobs.length} sonuç
        </Text>
      </View>

      {jobs.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.elevatedCard,
            borderRadius: 20,
            padding: 15,
            borderWidth: 1,
            borderColor: colors.softBorder,
            flexDirection: "row",
            gap: 11,
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 15,
              backgroundColor: alpha(colors.primary, 0.1),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="musical-note-outline"
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
              Henüz çalışma görünmüyor
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
              Çocuğun analiz tamamladığında çalıştığı parçalar ve doğruluk
              oranları burada listelenecek.
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {jobs.map((job, index) => (
            <RecentAnalysisCard
              key={job.id}
              job={job}
              index={index}
              onPress={() => onOpenJob(job.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}