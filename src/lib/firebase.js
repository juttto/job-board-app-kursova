import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBz4DInefmh1IjQl1lmK3eIkHqgLbffmjE",
  authDomain: "job-board-kursova.firebaseapp.com",
  projectId: "job-board-kursova",
  storageBucket: "job-board-kursova.firebasestorage.app",
  messagingSenderId: "220013746798",
  appId: "1:220013746798:web:baac1429447536c95fa47f",
  measurementId: "G-QQVQP2K6XZ"
};

// Ініціалізуємо Firebase лише один раз
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
