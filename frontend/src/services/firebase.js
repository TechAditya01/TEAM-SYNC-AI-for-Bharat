import { getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '0000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:0000000000:web:demo',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = {
  app,
  currentUser: {
    uid: 'demo-user',
    displayName: 'Citizen User',
    email: 'demo@example.com',
  },
  signOut: async () => {
    auth.currentUser = null;
    return true;
  },
};

export default app;
