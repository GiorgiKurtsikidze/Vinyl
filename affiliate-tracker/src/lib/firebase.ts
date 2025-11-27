import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'YOUR_PROJECT.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:123456789:web:abcdef',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export async function ensureAuth() {
  const customToken = import.meta.env.VITE_FIREBASE_CUSTOM_TOKEN?.trim();
  if (customToken) {
    await signInWithCustomToken(auth, customToken);
    return;
  }
  await signInAnonymously(auth);
}

export const defaultAppScope = (import.meta.env.VITE_APP_SCOPE_ID ?? 'affiliate-tracker').trim();
