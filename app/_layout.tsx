// app/_layout.tsx

import { AppAlertProvider } from "@/src/context/AppAlertContext";
import {
  AuthProvider,
  useAuth,
} from "@/src/context/AuthContext";
import { registerPushNotificationsForUser } from "@/src/services/notificationService";
import { ThemeProvider } from "@/src/theme/ThemeProvider";

import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";

function NotificationBootstrap() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /*
   * Aynı notification'ın cold start + listener tarafından
   * iki kez işlenmesini engellemek için.
   */
  const handledNotificationIdRef =
    useRef<string | null>(null);

  /*
   * Kullanıcı login olduğunda Expo Push Token'ını kaydet.
   */
  useEffect(() => {
    if (loading || !user?.uid) {
      return;
    }

    registerPushNotificationsForUser(user.uid)
      .then((token) => {
        console.log(
          "[Notifications] Registration finished",
          {
            hasToken: Boolean(token),
          }
        );
      })
      .catch((error) => {
        console.log(
          "[Notifications] Registration failed:",
          error
        );
      });
  }, [loading, user?.uid]);

  useEffect(() => {
    if (loading || !user?.uid) {
      return;
    }

    const handleNotificationResponse = (
      response: Notifications.NotificationResponse
    ) => {
      const notification =
        response.notification;

      const notificationId =
        notification.request.identifier;

      /*
       * Aynı notification'ı iki kez açma.
       */
      if (
        handledNotificationIdRef.current ===
        notificationId
      ) {
        return;
      }

      const data =
        notification.request.content.data;

      console.log(
        "[Notifications] Notification opened",
        {
          notificationId,
          data,
        }
      );

      if (
        data?.type !== "analysis-completed" ||
        typeof data?.jobId !== "string"
      ) {
        return;
      }

      handledNotificationIdRef.current =
        notificationId;

      router.push({
        pathname: "/result/[jobId]",
        params: {
          jobId: data.jobId,
        },
      });
    };

    /*
     * App açık / background durumundayken
     * kullanıcı notification'a basarsa.
     */
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    /*
     * App tamamen kapalıyken notification'a
     * basılarak açılmış olabilir.
     */
    const checkInitialNotification =
      async () => {
        try {
          const response =
            await Notifications.getLastNotificationResponseAsync();

          if (response) {
            handleNotificationResponse(response);

            /*
             * Aynı response sonraki mount'ta
             * yeniden kullanılmasın.
             */
            await Notifications.clearLastNotificationResponseAsync();
          }
        } catch (error) {
          console.log(
            "[Notifications] Initial notification check failed:",
            error
          );
        }
      };

    checkInitialNotification();

    return () => {
      responseSubscription.remove();
    };
  }, [loading, user?.uid, router]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppAlertProvider>
          <NotificationBootstrap />

          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="record/[songId]" />
            <Stack.Screen name="processing/[jobId]" />
            <Stack.Screen name="result/[jobId]" />
          </Stack>
        </AppAlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}