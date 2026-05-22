import { db } from "@/src/services/firebase";
import type {
    ClassStudent,
    StudentClass,
    TeacherClass,
} from "@/src/types/classroom";
import type { UserProfile } from "@/src/types/userProfile";
import {
    collection,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    where
} from "firebase/firestore";

const JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeJoinCode(code: string) {
  return code.trim().toUpperCase();
}

function generateJoinCode(length = 6) {
  let code = "";

  for (let i = 0; i < length; i += 1) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }

  return code;
}

async function createUniqueJoinCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateJoinCode();

    const classesQuery = query(
      collection(db, "classes"),
      where("joinCode", "==", code),
      limit(1),
    );

    const snapshot = await getDocs(classesQuery);

    if (snapshot.empty) {
      return code;
    }
  }

  throw new Error("Sınıf kodu üretilemedi. Lütfen tekrar dene.");
}

export async function createClass(params: { teacherId: string; name: string }) {
  const className = params.name.trim();

  if (!className) {
    throw new Error("Lütfen sınıf adı gir.");
  }

  const joinCode = await createUniqueJoinCode();
  const classRef = doc(collection(db, "classes"));

  const newClass = {
    teacherId: params.teacherId,
    name: className,
    joinCode,
    status: "active",
    studentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await runTransaction(db, async (transaction) => {
    transaction.set(classRef, newClass);
  });

  return {
    id: classRef.id,
    teacherId: params.teacherId,
    name: className,
    joinCode,
    status: "active",
    studentCount: 0,
  } as TeacherClass;
}

export function listenTeacherClasses(
  teacherId: string,
  callback: (classes: TeacherClass[]) => void,
  onError?: (error: unknown) => void,
) {
  const classesQuery = query(
    collection(db, "classes"),
    where("teacherId", "==", teacherId),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    classesQuery,
    (snapshot) => {
      const classes = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          teacherId: data.teacherId ?? teacherId,
          name: data.name ?? "İsimsiz Sınıf",
          joinCode: data.joinCode ?? "",
          status: data.status ?? "active",
          studentCount: data.studentCount ?? 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as TeacherClass;
      });

      callback(classes);
    },
    onError,
  );
}

export function listenStudentClasses(
  studentId: string,
  callback: (classes: StudentClass[]) => void,
  onError?: (error: unknown) => void,
) {
  const classesQuery = query(
    collection(db, "users", studentId, "classes"),
    where("status", "==", "active"),
    orderBy("joinedAt", "desc"),
  );

  return onSnapshot(
    classesQuery,
    (snapshot) => {
      const classes = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          classId: data.classId ?? docSnap.id,
          teacherId: data.teacherId ?? "",
          className: data.className ?? "İsimsiz Sınıf",
          joinCode: data.joinCode ?? "",
          status: data.status ?? "active",
          joinedAt: data.joinedAt,
        } as StudentClass;
      });

      callback(classes);
    },
    onError,
  );
}

export function listenClassStudents(
  classId: string,
  callback: (students: ClassStudent[]) => void,
  onError?: (error: unknown) => void,
) {
  const studentsQuery = query(
    collection(db, "classes", classId, "students"),
    where("status", "==", "active"),
    orderBy("joinedAt", "desc"),
  );

  return onSnapshot(
    studentsQuery,
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
          joinedAt: data.joinedAt,
        } as ClassStudent;
      });

      callback(students);
    },
    onError,
  );
}

export async function joinClassByCode(params: {
  studentId: string;
  joinCode: string;
}) {
  const code = normalizeJoinCode(params.joinCode);

  if (!code) {
    throw new Error("Lütfen sınıf kodu gir.");
  }

  const classesQuery = query(
    collection(db, "classes"),
    where("joinCode", "==", code),
    where("status", "==", "active"),
    limit(1),
  );

  const classSnapshot = await getDocs(classesQuery);

  if (classSnapshot.empty) {
    throw new Error("Bu koda sahip aktif sınıf bulunamadı.");
  }

  const classDoc = classSnapshot.docs[0];
  const classData = classDoc.data() as Omit<TeacherClass, "id">;

  const studentRef = doc(db, "users", params.studentId);

  await runTransaction(db, async (transaction) => {
    const studentSnap = await transaction.get(studentRef);

    if (!studentSnap.exists()) {
      throw new Error("Öğrenci profili bulunamadı.");
    }

    const student = studentSnap.data() as UserProfile;

    if (student.role !== "student") {
      throw new Error("Sadece öğrenci hesapları sınıfa katılabilir.");
    }

    const classStudentRef = doc(
      db,
      "classes",
      classDoc.id,
      "students",
      params.studentId,
    );

    const studentClassRef = doc(
      db,
      "users",
      params.studentId,
      "classes",
      classDoc.id,
    );

    const followedStudentRef = doc(
      db,
      "teachers",
      classData.teacherId,
      "followedStudents",
      params.studentId,
    );

    const now = serverTimestamp();

    const classStudentData: ClassStudent = {
      studentId: params.studentId,
      studentCode: student.studentCode,
      displayName: student.displayName,
      name: student.name,
      surname: student.surname,
      profileImageId: student.profileImageId,
      status: "active",
    };

    transaction.set(
      classStudentRef,
      {
        ...classStudentData,
        joinedAt: now,
      },
      { merge: true },
    );

    transaction.set(
      studentClassRef,
      {
        classId: classDoc.id,
        teacherId: classData.teacherId,
        className: classData.name,
        joinCode: classData.joinCode,
        status: "active",
        joinedAt: now,
      },
      { merge: true },
    );

    transaction.set(
      followedStudentRef,
      {
        studentId: params.studentId,
        studentCode: student.studentCode,
        displayName: student.displayName,
        name: student.name,
        surname: student.surname,
        profileImageId: student.profileImageId,
        status: "active",
        addedAt: now,
      },
      { merge: true },
    );
  });

  return {
    classId: classDoc.id,
    teacherId: classData.teacherId,
    className: classData.name,
    joinCode: classData.joinCode,
    status: "active",
  } as StudentClass;
}
