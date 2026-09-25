import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log("[Notifications] Foreground notification received", {
      identifier: notification.request.identifier,
      data: notification.request.content.data,
    });

    return {
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

export async function registerPushNotificationsForUser(userId: string) {
  try {
    if (!Device.isDevice) {
      console.log(
        "[Notifications] Physical device required for push notifications",
      );

      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("analysis-results", {
        name: "Analiz Sonuçları",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const currentPermission = await Notifications.getPermissionsAsync();

    let finalStatus = currentPermission.status;

    if (finalStatus !== "granted") {
      const requestedPermission = await Notifications.requestPermissionsAsync();

      finalStatus = requestedPermission.status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission not granted");

      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("[Notifications] EAS projectId not found");

      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const expoPushToken = tokenResponse.data;

    console.log("[Notifications] Expo push token acquired", {
      expoPushToken,
    });

    const tokenId = encodeURIComponent(expoPushToken);

    await setDoc(
      doc(db, "users", userId, "pushTokens", tokenId),
      {
        token: expoPushToken,
        platform: Platform.OS,
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    console.log("[Notifications] Push token saved to Firestore");

    return expoPushToken;
  } catch (error) {
    console.log("[Notifications] Registration error:", error);

    return null;
  }
}
