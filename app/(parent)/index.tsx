// app/(parent)/index.tsx

import { RecentAnalysisCard } from "@/src/components/insights/RecentAnalysisCard";
import { ParentChildHeroCard } from "@/src/components/parent/ParentChildHeroCard";
import { ParentEmptyChildCard } from "@/src/components/parent/ParentEmptyChildCard";
import { ParentHomeHeader } from "@/src/components/parent/ParentHomeHeader";
import { useAuth } from "@/src/context/AuthContext";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { listenCompletedAnalysisJobsByUserId } from "@/src/services/analysisJobService";
import { listenParentChildren } from "@/src/services/parentService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { AnalysisJob } from "@/src/types/analysisJob";
import type { ParentLinkedChild } from "@/src/types/parent";
import { calculateInsightsSummary } from "@/src/utils/insights";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

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

function countJobsAfter(jobs: AnalysisJob[], startDate: Date) {
  return jobs.filter((job) => {
    const date = getJobDate(job);
    return date ? date >= startDate : false;
  }).length;
}

function getChildName(child?: ParentLinkedChild | null) {
  if (!child) return "Çocuğun";

  return (
    `${child.name ?? ""} ${child.surname ?? ""}`.trim() ||
    child.displayName ||
    "Çocuğun"
  );
}

export default function ParentHomeScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  const [children, setChildren] = useState<ParentLinkedChild[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);

  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const parentName = user?.displayName || "Veli";
  const { profile } = useUserProfile();

  useEffect(() => {
    if (!user?.uid) {
      setChildren([]);
      setChildrenLoading(false);
      return;
    }

    setChildrenLoading(true);

    const unsubscribe = listenParentChildren(
      user.uid,
      (items) => {
        setChildren(items);
        setChildrenLoading(false);
      },
      (error) => {
        console.log("PARENT CHILDREN LISTEN ERROR:", error);
        setChildren([]);
        setChildrenLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  const firstChild = children[0];
  const hasLinkedChild = children.length > 0;

  useEffect(() => {
    if (!firstChild?.studentId) {
      setJobs([]);
      setJobsLoading(false);
      return;
    }

    setJobsLoading(true);

    const unsubscribe = listenCompletedAnalysisJobsByUserId(
      firstChild.studentId,
      (items) => {
        setJobs(items);
        setJobsLoading(false);
      },
      (error) => {
        console.log("PARENT HOME ANALYSIS LISTEN ERROR:", error);
        setJobs([]);
        setJobsLoading(false);
      },
    );

    return unsubscribe;
  }, [firstChild?.studentId]);

  const summary = useMemo(() => calculateInsightsSummary(jobs), [jobs]);

  const weeklyPracticeCount = useMemo(
    () => countJobsAfter(jobs, getThisWeekStart()),
    [jobs],
  );

  const recentJobs = jobs.slice(0, 3);

  const childSummary = {
    childName: getChildName(firstChild),
    weeklyPracticeCount,
    lastPracticeLabel: summary.lastActivityText ?? "Henüz yok",
    noteAccuracy:
      summary.totalAnalyses > 0 ? summary.averagePitchScore : undefined,
  };

  function handleAddChild() {
    router.push({
      pathname: "/(parent)/profile",
      params: {
        open: "childLink",
      },
    });
  }

  function handleOpenOverview() {
    router.push("/(parent)/overview");
  }

  function handleOpenJob(jobId: string) {
    router.push(`/result/${jobId}`);
  }

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
      <ParentHomeHeader colors={colors} parentName={profile?.name} />

      {childrenLoading ? (
        <View
          style={{
            marginTop: 26,
            backgroundColor: colors.card,
            borderRadius: 30,
            padding: 22,
            borderWidth: 1,
            borderColor: colors.softBorder,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 160,
            shadowColor: colors.shadow,
            shadowOpacity: 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 3,
          }}
        >
          <ActivityIndicator color={colors.primary} />

          <Text
            style={{
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "700",
              marginTop: 12,
            }}
          >
            Çocuk bilgileri yükleniyor...
          </Text>
        </View>
      ) : hasLinkedChild ? (
        <>
          <ParentChildHeroCard
            colors={colors}
            childName={childSummary.childName}
            weeklyPracticeCount={childSummary.weeklyPracticeCount}
            lastPracticeLabel={childSummary.lastPracticeLabel}
            noteAccuracy={childSummary.noteAccuracy}
          />

          <View style={{ marginTop: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "900",
                    letterSpacing: -0.3,
                  }}
                >
                  Son çalışmalar
                </Text>

                <Text
                  style={{
                    color: colors.mutedText,
                    fontSize: 12,
                    fontWeight: "700",
                    marginTop: 3,
                  }}
                >
                  {childSummary.childName} için son 3 piyano çalışması
                </Text>
              </View>

              <Text
                onPress={handleOpenOverview}
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                Tümünü gör
              </Text>
            </View>

            {jobsLoading ? (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 24,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: colors.softBorder,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 120,
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
                  Son çalışmalar yükleniyor...
                </Text>
              </View>
            ) : recentJobs.length > 0 ? (
              <View style={{ gap: 12 }}>
                {recentJobs.map((job, index) => (
                  <RecentAnalysisCard
                    key={job.id}
                    job={job}
                    index={index}
                    onPress={() => handleOpenJob(job.id)}
                  />
                ))}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 24,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.softBorder,
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    backgroundColor: colors.primarySoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="musical-notes-outline"
                    size={21}
                    color={colors.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: "900",
                    }}
                  >
                    Henüz çalışma görünmüyor
                  </Text>

                  <Text
                    style={{
                      color: colors.mutedText,
                      fontSize: 13,
                      fontWeight: "600",
                      lineHeight: 19,
                      marginTop: 4,
                    }}
                  >
                    Çocuğun ilk analizini tamamladığında son çalışmalar burada
                    listelenecek.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </>
      ) : (
        <ParentEmptyChildCard colors={colors} onAddChild={handleAddChild} />
      )}
    </ScrollView>
  );
}