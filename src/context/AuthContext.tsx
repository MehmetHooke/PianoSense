// src/context/AuthContext.tsx

import { auth } from "@/src/services/firebase";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    type User,
} from "firebase/auth";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
});

const TEST_EMAIL = "test@gmail.com";
const TEST_PASSWORD = "test123";

async function loginWithTestUser() {
  await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function startAuth() {
      try {
        setLoading(true);
        setError(null);

        await loginWithTestUser();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (!isMounted) return;

          setUser(currentUser);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err: any) {
        console.log("Test user login error:", err);

        if (!isMounted) return;

        setUser(null);
        setError(
          err?.code === "auth/invalid-credential"
            ? "Test kullanıcısı bulunamadı veya şifre hatalı."
            : "Giriş yapılırken bir sorun oluştu."
        );
        setLoading(false);
      }
    }

    let unsubscribe: (() => void) | undefined;

    startAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}