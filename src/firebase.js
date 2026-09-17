import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {

  apiKey: "AIzaSyDFFF6UAkcnmkO83xkjaZfHSbpK65BkX04",

  authDomain: "e-report-a9e2b.firebaseapp.com",

  projectId: "e-report-a9e2b",

  storageBucket: "e-report-a9e2b.firebasestorage.app",

  messagingSenderId: "524228537274",

  appId: "1:524228537274:web:41bd07b1c4386cddcfcb83",

  measurementId: "G-BT9V531KVR"

};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);