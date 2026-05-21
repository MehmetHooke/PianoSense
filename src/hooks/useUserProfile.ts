import { useAuth } from "@/src/context/AuthContext";
import { listenUserProfile } from "@/src/services/userProfileService";
import type { UserProfile } from "@/src/types/userProfile";
import { useEffect, useState } from "react";

export function useUserProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = listenUserProfile(
      user.uid,
      (nextProfile) => {
        setProfile(nextProfile);
        setLoading(false);
      },
      (err) => {
        console.log("USER PROFILE LISTEN ERROR:", err);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  return {
    user,
    profile,
    loading,
    error,
  };
}
