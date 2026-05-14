import { AppAlert } from "@/src/components/common/AppAlert";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AppAlertType = "success" | "error" | "warning" | "info";

export type AppAlertPayload = {
  type: AppAlertType;
  title: string;
  message?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  durationMs?: number;
};

type AlertState = AppAlertPayload & {
  id: number;
};

type AppAlertContextValue = {
  showAlert: (payload: AppAlertPayload) => void;
  hideAlert: () => void;
};

export const AppAlertContext = createContext<AppAlertContextValue | undefined>(
  undefined,
);

const DEFAULT_DURATION_MS = 3600;

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertIdRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideAlert = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  const showAlert = useCallback(
    (payload: AppAlertPayload) => {
      clearTimer();
      alertIdRef.current += 1;

      setAlert({
        id: alertIdRef.current,
        ...payload,
      });
      setVisible(true);

      if (!payload.onPrimaryAction) {
        timerRef.current = setTimeout(() => {
          setVisible(false);
        }, payload.durationMs ?? DEFAULT_DURATION_MS);
      }
    },
    [clearTimer],
  );

  const handleHidden = useCallback(() => {
    setAlert((currentAlert) => {
      if (!currentAlert || visible) {
        return currentAlert;
      }

      return null;
    });
  }, [visible]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const value = useMemo(
    () => ({
      showAlert,
      hideAlert,
    }),
    [showAlert, hideAlert],
  );

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <AppAlert
        alert={alert}
        visible={visible}
        onDismiss={hideAlert}
        onHidden={handleHidden}
      />
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AppAlertContext);

  if (!context) {
    throw new Error("useAppAlert must be used within AppAlertProvider");
  }

  return context;
}