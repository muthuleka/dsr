// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6rFpD2w0XeCfYus2pxpUX0A2chVK42Cc",
  authDomain: "minmalin.firebaseapp.com",
  projectId: "minmalin",
  storageBucket: "minmalin.appspot.com",
  messagingSenderId: "284069940879",
  appId: "1:284069940879:web:36aaf217c7c9baaebfeafa",
  measurementId: "G-KGG94W47TB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app