// src/types/userProfile.ts

import type { Timestamp } from "firebase/firestore";

export type ProfileImageId =
  | "profile-boy-1"
  | "profile-boy-2"
  | "profile-girl-1"
  | "profile-girl-2";

export type UserRole = "student" | "teacher" | "parent";

export type UserProfile = {
  uid: string;
  name: string;
  surname: string;
  displayName: string;
  email: string;
  role: UserRole;
  profileImageId: ProfileImageId;
  studentCode: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
