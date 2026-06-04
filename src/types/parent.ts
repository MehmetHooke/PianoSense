import type { ProfileImageId } from "@/src/types/userProfile";

export type ParentChildLinkStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "removed";

export type ParentLinkedChild = {
  studentId: string;
  studentCode: string;
  displayName: string;
  name: string;
  surname: string;
  profileImageId: ProfileImageId;
  status: ParentChildLinkStatus;
  requestedAt?: unknown;
  approvedAt?: unknown;
  linkedAt?: unknown;
};

export type ParentChildLink = {
  id: string;
  parentId: string;
  studentId: string;
  studentCode: string;
  displayName: string;
  name: string;
  surname: string;
  profileImageId: ProfileImageId;
  status: ParentChildLinkStatus;
  requestedAt?: unknown;
  approvedAt?: unknown;
  rejectedAt?: unknown;
  removedAt?: unknown;
};
