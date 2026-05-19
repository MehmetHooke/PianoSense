// src/constants/profileImages.ts

import type { ProfileImageId } from "@/src/types/userProfile";
import type { ImageSourcePropType } from "react-native";

export type ProfileImageOption = {
  id: ProfileImageId;
  label: string;
  source: ImageSourcePropType;
};

export const DEFAULT_PROFILE_IMAGE_ID: ProfileImageId = "profile-boy-1";

export const profileImageOptions: ProfileImageOption[] = [
  {
    id: "profile-boy-1",
    label: "Berk",
    source: require("@/src/assets/images/profile/profile-boy-1.png"),
  },
  {
    id: "profile-boy-2",
    label: "Doğa",
    source: require("@/src/assets/images/profile/profile-boy-2.png"),
  },
  {
    id: "profile-girl-1",
    label: "Nil",
    source: require("@/src/assets/images/profile/profile-girl-1.png"),
  },
  {
    id: "profile-girl-2",
    label: "Filiz",
    source: require("@/src/assets/images/profile/profile-girl-2.png"),
  },
];

export function getProfileImageSource(profileImageId?: ProfileImageId | null) {
  return (
    profileImageOptions.find((option) => option.id === profileImageId)
      ?.source ?? profileImageOptions[0].source
  );
}
