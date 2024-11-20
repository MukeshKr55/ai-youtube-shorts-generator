// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai-shorts-generator-91a42.firebaseapp.com",
  projectId: "ai-shorts-generator-91a42",
  storageBucket: "ai-shorts-generator-91a42.appspot.com",
  messagingSenderId: "915923486166",
  appId: "1:915923486166:web:3ac5ca9a3745903f0a5077",
  measurementId: "G-Q7L3EB0QG1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
