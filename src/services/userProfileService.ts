// src/services/userProfileService.ts

import { DEFAULT_PROFILE_IMAGE_ID } from "@/src/constants/profileImages";
import { db } from "@/src/services/firebase";
import type {
    ProfileImageId,
    UserProfile,
    UserRole,
} from "@/src/types/userProfile";
import {
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";

const USER_COLLECTION = "users";

export function generateStudentCode(seed: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += chars[hash % chars.length];
    hash = Math.floor(hash / chars.length) || hash + i + 17;
  }

  return code;
}

export async function createUserProfile({
  uid,
  name,
  surname,
  displayName,
  email,
  role,
}: {
  uid: string;
  name: string;
  surname: string;
  displayName: string;
  email: string;
  role: UserRole;
}) {
  const userRef = doc(db, USER_COLLECTION, uid);

  await setDoc(
    userRef,
    {
      uid,
      name,
      surname,
      displayName,
      email,
      role,
      profileImageId: DEFAULT_PROFILE_IMAGE_ID,
      studentCode: generateStudentCode(uid),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createMockUserProfileForExistingAccount({
  uid,
  email,
}: {
  uid: string;
  email: string;
}) {
  const userRef = doc(db, USER_COLLECTION, uid);

  await setDoc(
    userRef,
    {
      uid,
      name: "Test",
      surname: "Öğrenci",
      displayName: "Test Öğrenci",
      email,
      role: "student",
      profileImageId: DEFAULT_PROFILE_IMAGE_ID,
      studentCode: generateStudentCode(uid),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function listenUserProfile(
  uid: string,
  onChange: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void,
) {
  const userRef = doc(db, USER_COLLECTION, uid);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }

      onChange(snapshot.data() as UserProfile);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function updateUserProfileImage({
  uid,
  profileImageId,
}: {
  uid: string;
  profileImageId: ProfileImageId;
}) {
  const userRef = doc(db, USER_COLLECTION, uid);

  await updateDoc(userRef, {
    profileImageId,
    updatedAt: serverTimestamp(),
  });
}
