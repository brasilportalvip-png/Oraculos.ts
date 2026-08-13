import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId || undefined
};

let app: FirebaseApp;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn('[ORACULOS.TS] Firebase App initialization error, using existing app fallback:', error);
  app = getApps().length ? getApp() : ({} as FirebaseApp);
}

let auth: Auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.warn('[ORACULOS.TS] Firebase Auth initialization warning:', error);
  auth = {} as Auth;
}

let db: Firestore;
try {
  db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);
} catch (error) {
  console.warn('[ORACULOS.TS] Firestore database instantiation fallback:', error);
  try {
    db = getFirestore(app);
  } catch (err) {
    console.warn('[ORACULOS.TS] Default Firestore fallback warning:', err);
    db = {} as Firestore;
  }
}

export { app, auth, db };

