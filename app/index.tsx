// app/index.tsx

import {
  AuthErrorScreen,
  AuthLoadingScreen,
} from "@/src/components/auth/AuthGate";
import { useAuth } from "@/src/context/AuthContext";
import { listenUserProfile } from "@/src/services/userProfileService";
import type { UserProfile } from "@/src/types/userProfile";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const { user, loading, error } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    const unsubscribe = listenUserProfile(
      user.uid,
      (nextProfile) => {
        setProfile(nextProfile);
        setProfileLoading(false);
      },
      (err) => {
        console.log("USER PROFILE LISTEN ERROR:", err);
        setProfileError("Profil bilgileri yüklenemedi.");
        setProfileLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  if (loading || profileLoading) {
    return <AuthLoadingScreen />;
  }

  if (error) {
    return <AuthErrorScreen message={error} />;
  }

  if (profileError) {
    return <AuthErrorScreen message={profileError} />;
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (!profile) {
    return <AuthErrorScreen message="Kullanıcı profili bulunamadı." />;
  }

  if (profile.role === "teacher") {
    return <Redirect href="/(teacher)" />;
  }

  return <Redirect href="/(student)" />;
}