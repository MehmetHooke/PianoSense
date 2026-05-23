// src\components\teacher\home\useTeacherHomeData.ts
import { getCompletedAnalysisJobsByUser } from "@/src/services/analysisJobService";
import { listenTeacherClasses } from "@/src/services/classroomService";
import {
  listenFollowedStudents,
  type FollowedStudent,
} from "@/src/services/teacherStudentService";
import type { AnalysisJob } from "@/src/types/analysisJob";
import type { TeacherClass } from "@/src/types/classroom";
import { useEffect, useMemo, useState } from "react";

export type TeacherHomeActivity = {
  id: string;
  title: string;
  description: string;
  score?: number;
  dateText?: string;
  type: "analysis" | "student" | "class";
};

function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

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

function getRelativeDateText(value: unknown) {
  const date = toDate(value);

  if (!date) return undefined;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Az önce";
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function isThisWeek(value: unknown) {
  const date = toDate(value);

  if (!date) return false;

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  return date >= sevenDaysAgo;
}

export function useTeacherHomeData(teacherId?: string) {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [followedStudents, setFollowedStudents] = useState<FollowedStudent[]>(
    [],
  );
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>([]);

  const [classesLoading, setClassesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!teacherId) {
      setClasses([]);
      setClassesLoading(false);
      return;
    }

    setClassesLoading(true);

    const unsubscribe = listenTeacherClasses(
      teacherId,
      (nextClasses) => {
        setClasses(nextClasses);
        setClassesLoading(false);
      },
      (err) => {
        console.log("TEACHER HOME CLASSES ERROR:", err);
        setError(err);
        setClassesLoading(false);
      },
    );

    return unsubscribe;
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) {
      setFollowedStudents([]);
      setStudentsLoading(false);
      return;
    }

    setStudentsLoading(true);

    const unsubscribe = listenFollowedStudents(
      teacherId,
      (nextStudents) => {
        setFollowedStudents(nextStudents);
        setStudentsLoading(false);
      },
      (err) => {
        console.log("TEACHER HOME STUDENTS ERROR:", err);
        setError(err);
        setStudentsLoading(false);
      },
    );

    return unsubscribe;
  }, [teacherId]);

  useEffect(() => {
    let cancelled = false;

    async function loadStudentAnalyses() {
      if (followedStudents.length === 0) {
        setAnalysisJobs([]);
        setAnalysisLoading(false);
        return;
      }

      setAnalysisLoading(true);

      try {
        const results = await Promise.all(
          followedStudents.map((student) =>
            getCompletedAnalysisJobsByUser(student.studentId, 5),
          ),
        );

        if (cancelled) return;

        const mergedJobs = results.flat().sort((a, b) => {
          const dateA = toDate(a.completedAt)?.getTime() ?? 0;
          const dateB = toDate(b.completedAt)?.getTime() ?? 0;

          return dateB - dateA;
        });

        setAnalysisJobs(mergedJobs);
      } catch (err) {
        if (cancelled) return;

        console.log("TEACHER HOME ANALYSIS ERROR:", err);
        setError(err);
      } finally {
        if (!cancelled) {
          setAnalysisLoading(false);
        }
      }
    }

    loadStudentAnalyses();

    return () => {
      cancelled = true;
    };
  }, [followedStudents]);

  const totalClassCount = classes.length;

  const totalClassStudentCount = useMemo(() => {
    return classes.reduce((total, classItem) => {
      return total + (classItem.studentCount ?? 0);
    }, 0);
  }, [classes]);

  const thisWeekAnalysisCount = useMemo(() => {
    return analysisJobs.filter((job) => isThisWeek(job.completedAt)).length;
  }, [analysisJobs]);

  const averageScore = useMemo(() => {
    const scoredJobs = analysisJobs.filter(
      (job) => typeof job.result?.overallScore === "number",
    );

    if (scoredJobs.length === 0) return null;

    const totalScore = scoredJobs.reduce((total, job) => {
      return total + (job.result?.overallScore ?? 0);
    }, 0);

    return Math.round(totalScore / scoredJobs.length);
  }, [analysisJobs]);

  const recentActivities = useMemo<TeacherHomeActivity[]>(() => {
    const analysisActivities = analysisJobs.slice(0, 5).map((job) => {
      const student = followedStudents.find(
        (item) => item.studentId === job.userId,
      );

      const studentName =
        student?.displayName ||
        `${student?.name ?? ""} ${student?.surname ?? ""}`.trim() ||
        "Bir öğrenci";

      return {
        id: job.id,
        title: `${studentName}`,
        description: job.songTitle
          ? `${job.songTitle} çalışması tamamlandı.`
          : "Yeni bir çalışma sonucu hazır.",
        score: job.result?.overallScore,
        dateText: getRelativeDateText(job.completedAt),
        type: "analysis",
      } satisfies TeacherHomeActivity;
    });

    if (analysisActivities.length > 0) {
      return analysisActivities;
    }

    return followedStudents.slice(0, 3).map((student) => {
      const studentName =
        student.displayName ||
        `${student.name ?? ""} ${student.surname ?? ""}`.trim() ||
        "İsimsiz Öğrenci";

      return {
        id: student.studentId,
        title: `${studentName} takip listende`,
        description: "Öğrencinin analizleri tamamlandıkça burada görünecek.",
        dateText: getRelativeDateText(student.addedAt),
        type: "student",
      } satisfies TeacherHomeActivity;
    });
  }, [analysisJobs, followedStudents]);

  return {
    classes,
    followedStudents,
    analysisJobs,

    stats: {
      totalClassCount,
      totalClassStudentCount,
      followedStudentCount: followedStudents.length,
      thisWeekAnalysisCount,
      averageScore,
    },

    recentActivities,

    loading: classesLoading || studentsLoading || analysisLoading,
    error,
  };
}
