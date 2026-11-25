import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase Web SDK の公開識別設定（環境変数 VITE_FIREBASE_* で上書き可能）
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyAYgoSCXsyllRQU3rrTC3M-Dh7h4G_FaVc',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'gen-lang-client-0479260632.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0479260632',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'gen-lang-client-0479260632.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '702291546010',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:702291546010:web:f2fdf61936f6a809c9f423',
};

const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  'ai-studio-179b2869-9896-43da-aada-b39bacd0769c';

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, firestoreDatabaseId);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export { app, auth, db, googleProvider };
