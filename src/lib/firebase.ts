import { initializeApp, getApps } from "firebase/app";

// 必要な機能をインポート
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_STG_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_STG_AUTH_DOMEIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_STG_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STG_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_STG_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_STG_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_STG_MEASUREMENT_ID,
};

// const firebaseConfig =
//   process.env.NODE_ENV === "production"
//     ? {
//         apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//         authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMEIN,
//         projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//         storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//         messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//         appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//         measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
//       }
//     : {
//         apiKey: process.env.NEXT_PUBLIC_FIREBASE_STG_API_KEY,
//         authDomain: process.env.NEXT_PUBLIC_FIREBASE_STG_AUTH_DOMEIN,
//         projectId: process.env.NEXT_PUBLIC_FIREBASE_STG_PROJECT_ID,
//         storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STG_STORAGE_BUCKET,
//         messagingSenderId:
//           process.env.NEXT_PUBLIC_FIREBASE_STG_MESSAGING_SENDER_ID,
//         appId: process.env.NEXT_PUBLIC_FIREBASE_STG_APP_ID,
//         measurementId: process.env.NEXT_PUBLIC_FIREBASE_STG_MEASUREMENT_ID,
//       };

if (!getApps()?.length) {
  // Firebaseアプリの初期化
  initializeApp(firebaseConfig);
}

// 他ファイルで使うために機能をエクスポート
export const db = getFirestore();
export const storage = getStorage();
export const auth = getAuth();
export const funcions = getFunctions();
