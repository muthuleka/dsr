// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxGhavE7GR75aWAijvkEwPLbPPSASwHRI",
  authDomain: "fir-537be.firebaseapp.com",
  projectId: "fir-537be",
  storageBucket: "fir-537be.appspot.com",
  messagingSenderId: "946773413235",
  appId: "1:946773413235:web:e953654ec02231f5800906",
  measurementId: "G-QRJ4MQ2JBK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app