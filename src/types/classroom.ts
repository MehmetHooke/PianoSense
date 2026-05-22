import type { ProfileImageId } from "@/src/types/userProfile";
import type { Timestamp } from "firebase/firestore";

export type ClassStatus = "active" | "archived";
export type ClassStudentStatus = "active" | "removed";
export type StudentClassStatus = "active" | "left";

export type TeacherClass = {
  id: string;
  teacherId: string;
  name: string;
  joinCode: string;
  status: ClassStatus;
  studentCount?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ClassStudent = {
  studentId: string;
  studentCode: string;
  displayName: string;
  name: string;
  surname: string;
  profileImageId: ProfileImageId;
  status: ClassStudentStatus;
  joinedAt?: Timestamp;
};

export type StudentClass = {
  classId: string;
  teacherId: string;
  className: string;
  joinCode: string;
  status: StudentClassStatus;
  joinedAt?: Timestamp;
};
