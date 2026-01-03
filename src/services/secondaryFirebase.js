import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig2 = {
  apiKey: "AIzaSyByaanMNIi6HDTX03HVWGQdhXPsITMgj14",
  authDomain: "application-form-d7bc9.firebaseapp.com",
  projectId: "application-form-d7bc9",
};

let secondaryApp;

if (getApps().some(a => a.name === "secondary")) {
  secondaryApp = getApp("secondary");
} else {
  secondaryApp = initializeApp(firebaseConfig2, "secondary");
}

export const db2 = getFirestore(secondaryApp);
export const auth2 = getAuth(secondaryApp);
