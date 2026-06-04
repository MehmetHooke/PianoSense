import { db } from "@/src/services/firebase";
import type {
    ParentChildLink,
    ParentChildLinkStatus,
    ParentLinkedChild,
} from "@/src/types/parent";
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

function normalizeStudentCode(code: string) {
  return code.trim().toUpperCase();
}

function createParentLinkId(parentId: string, studentId: string) {
  return `${parentId}_${studentId}`;
}

function getSafeStudentProfile(
  studentId: string,
  student: UserProfile,
): Omit<
  ParentLinkedChild,
  "status" | "requestedAt" | "approvedAt" | "linkedAt"
> {
  return {
    studentId,
    studentCode: student.studentCode ?? "",
    displayName: student.displayName ?? "İsimsiz Öğrenci",
    name: student.name ?? "",
    surname: student.surname ?? "",
    profileImageId:
      (student.profileImageId as ProfileImageId | undefined) ?? "profile-boy-1",
  };
}

export async function linkChildByStudentCode(params: {
  parentId: string;
  studentCode: string;

  /**
   * Şimdilik geliştirmeyi hızlandırmak için true bırakabiliriz.
   * İleride öğrenci onay sistemi gelince false yapılmalı.
   */
  autoApprove?: boolean;
}) {
  const code = normalizeStudentCode(params.studentCode);

  if (!params.parentId) {
    throw new Error("Veli hesabı bulunamadı.");
  }

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

  if (studentDoc.id === params.parentId) {
    throw new Error("Kendi hesabını çocuk olarak ekleyemezsin.");
  }

  const safeStudent = getSafeStudentProfile(studentDoc.id, student);

  const status: ParentChildLinkStatus =
    params.autoApprove === false ? "pending" : "approved";

  const linkId = createParentLinkId(params.parentId, studentDoc.id);

  const parentLinkRef = doc(db, "parentLinks", linkId);

  const parentChildRef = doc(
    db,
    "parents",
    params.parentId,
    "children",
    studentDoc.id,
  );

  const studentParentLinkRef = doc(
    db,
    "users",
    studentDoc.id,
    "parentLinks",
    params.parentId,
  );

  const baseLinkData = {
    parentId: params.parentId,
    ...safeStudent,
    status,
    requestedAt: serverTimestamp(),
    ...(status === "approved"
      ? {
          approvedAt: serverTimestamp(),
          linkedAt: serverTimestamp(),
        }
      : {}),
  };

  await setDoc(
    parentLinkRef,
    {
      id: linkId,
      ...baseLinkData,
    },
    { merge: true },
  );

  await setDoc(parentChildRef, baseLinkData, { merge: true });

  await setDoc(
    studentParentLinkRef,
    {
      id: linkId,
      parentId: params.parentId,
      studentId: studentDoc.id,
      status,
      requestedAt: serverTimestamp(),
      ...(status === "approved"
        ? {
            approvedAt: serverTimestamp(),
            linkedAt: serverTimestamp(),
          }
        : {}),
    },
    { merge: true },
  );

  return {
    ...safeStudent,
    status,
  } satisfies ParentLinkedChild;
}

export function listenParentChildren(
  parentId: string,
  callback: (children: ParentLinkedChild[]) => void,
  onError?: (error: unknown) => void,
) {
  const childrenRef = collection(db, "parents", parentId, "children");

  const childrenQuery = query(
    childrenRef,
    where("status", "==", "approved"),
    orderBy("linkedAt", "desc"),
  );

  return onSnapshot(
    childrenQuery,
    (snapshot) => {
      const children = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          studentId: data.studentId ?? docSnap.id,
          studentCode: data.studentCode ?? "",
          displayName: data.displayName ?? "İsimsiz Öğrenci",
          name: data.name ?? "",
          surname: data.surname ?? "",
          profileImageId: data.profileImageId ?? "profile-boy-1",
          status: data.status ?? "approved",
          requestedAt: data.requestedAt,
          approvedAt: data.approvedAt,
          linkedAt: data.linkedAt,
        } as ParentLinkedChild;
      });

      callback(children);
    },
    onError,
  );
}

export function listenParentChildRequests(
  parentId: string,
  callback: (children: ParentLinkedChild[]) => void,
  onError?: (error: unknown) => void,
) {
  const childrenRef = collection(db, "parents", parentId, "children");

  const childrenQuery = query(childrenRef, orderBy("requestedAt", "desc"));

  return onSnapshot(
    childrenQuery,
    (snapshot) => {
      const children = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          studentId: data.studentId ?? docSnap.id,
          studentCode: data.studentCode ?? "",
          displayName: data.displayName ?? "İsimsiz Öğrenci",
          name: data.name ?? "",
          surname: data.surname ?? "",
          profileImageId: data.profileImageId ?? "profile-boy-1",
          status: data.status ?? "pending",
          requestedAt: data.requestedAt,
          approvedAt: data.approvedAt,
          linkedAt: data.linkedAt,
        } as ParentLinkedChild;
      });

      callback(children);
    },
    onError,
  );
}

export function listenParentLinksForStudent(
  studentId: string,
  callback: (links: ParentChildLink[]) => void,
  onError?: (error: unknown) => void,
) {
  const linksRef = collection(db, "users", studentId, "parentLinks");

  const linksQuery = query(linksRef, orderBy("requestedAt", "desc"));

  return onSnapshot(
    linksQuery,
    (snapshot) => {
      const links = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: data.id ?? docSnap.id,
          parentId: data.parentId ?? "",
          studentId: data.studentId ?? studentId,
          studentCode: data.studentCode ?? "",
          displayName: data.displayName ?? "İsimsiz Öğrenci",
          name: data.name ?? "",
          surname: data.surname ?? "",
          profileImageId: data.profileImageId ?? "profile-boy-1",
          status: data.status ?? "pending",
          requestedAt: data.requestedAt,
          approvedAt: data.approvedAt,
          rejectedAt: data.rejectedAt,
          removedAt: data.removedAt,
        } as ParentChildLink;
      });

      callback(links);
    },
    onError,
  );
}
