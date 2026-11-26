
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "fresherai-764d7.firebaseapp.com",
  projectId: "fresherai-764d7",
  storageBucket: "fresherai-764d7.firebasestorage.app",
  messagingSenderId: "686610861065",
  appId: "1:686610861065:web:3aecc3cc49fb65c9c73cd8"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth, provider}