// src\services\teacherStudentService.ts
import { db } from "@/src/services/firebase";
import type { ProfileImageId, UserProfile } from "@/src/types/userProfile";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

export type FollowedStudent = {
  studentId: string;
  studentCode: string;
  displayName: string;
  name: string;
  surname: string;
  profileImageId: ProfileImageId;
  status: "active" | "removed";
  addedAt?: unknown;
};

function normalizeStudentCode(code: string) {
  return code.trim().toUpperCase();
}

export async function followStudentByCode(params: {
  teacherId: string;
  studentCode: string;
}) {
  const code = normalizeStudentCode(params.studentCode);

  if (!code) {
    throw new Error("Lütfen öğrenci kodu gir.");
  }

  const usersRef = collection(db, "users");

  const studentQuery = query(
    usersRef,
    where("role", "==", "student"),
    where("studentCode", "==", code),
    limit(1),
  );

  const snapshot = await getDocs(studentQuery);

  if (snapshot.empty) {
    throw new Error("Bu koda sahip öğrenci bulunamadı.");
  }

  const studentDoc = snapshot.docs[0];
  const student = studentDoc.data() as UserProfile;

  const followedRef = doc(
    db,
    "teachers",
    params.teacherId,
    "followedStudents",
    studentDoc.id,
  );

  const followedStudent: FollowedStudent = {
    studentId: studentDoc.id,
    studentCode: student.studentCode,
    displayName: student.displayName,
    name: student.name,
    surname: student.surname,
    profileImageId: student.profileImageId,
    status: "active",
  };

  await setDoc(
    followedRef,
    {
      ...followedStudent,
      addedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return followedStudent;
}

export function listenFollowedStudents(
  teacherId: string,
  callback: (students: FollowedStudent[]) => void,
  onError?: (error: unknown) => void,
) {
  const followedRef = collection(db, "teachers", teacherId, "followedStudents");

  const followedQuery = query(
    followedRef,
    where("status", "==", "active"),
    orderBy("addedAt", "desc"),
  );

  return onSnapshot(
    followedQuery,
    (snapshot) => {
      const students = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          studentId: data.studentId ?? docSnap.id,
          studentCode: data.studentCode ?? "",
          displayName: data.displayName ?? "İsimsiz Öğrenci",
          name: data.name ?? "",
          surname: data.surname ?? "",
          profileImageId: data.profileImageId ?? "profile-boy-1",
          status: data.status ?? "active",
          addedAt: data.addedAt,
        } as FollowedStudent;
      });

      callback(students);
    },
    onError,
  );
}
