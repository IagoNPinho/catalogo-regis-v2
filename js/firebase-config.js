import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCozYqjh7XFVJtFyf8OumOfYXE4k-F9mM0",
  authDomain: "catalogo-relges.firebaseapp.com",
  projectId: "catalogo-relges",
  storageBucket: "catalogo-relges.firebasestorage.app",
  messagingSenderId: "603621379712",
  appId: "1:603621379712:web:c2802717c953ef8e922065",
  measurementId: "G-FECMPY2Q4S"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

enableIndexedDbPersistence(db).catch(() => {
  console.warn("Offline persistence failed");
});