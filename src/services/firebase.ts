import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";

// prettier-ignore
// @ts-ignore Firebase React Native runtime export
import { getAuth, getReactNativePersistence, initializeAuth, type Auth, } from "firebase/auth";

import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

export const functions = getFunctions(app, "us-central1");
export const db = getFirestore(app);
export const storage = getStorage(app);

const globalFlags = globalThis as typeof globalThis & {
  __recalllyFunctionsEmulatorConnected?: boolean;
  __recalllyFirestoreEmulatorConnected?: boolean;
};

const useEmulator =
  __DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === "true";

if (useEmulator) {
  const emulatorHost =
    Platform.OS === "android"
      ? "10.0.2.2"
      : Platform.OS === "web"
        ? "127.0.0.1"
        : "localhost";

  console.log("[firebase] Connecting Functions emulator", {
    platform: Platform.OS,
    host: emulatorHost,
    port: 5001,
  });

  if (!globalFlags.__recalllyFunctionsEmulatorConnected) {
    connectFunctionsEmulator(functions, emulatorHost, 5001);
    globalFlags.__recalllyFunctionsEmulatorConnected = true;
  }

  console.log("[firebase] Connecting Firestore emulator", {
    platform: Platform.OS,
    host: emulatorHost,
    port: 8080,
  });

  if (!globalFlags.__recalllyFirestoreEmulatorConnected) {
    connectFirestoreEmulator(db, emulatorHost, 8080);
    globalFlags.__recalllyFirestoreEmulatorConnected = true;
  }
}

export default app;
