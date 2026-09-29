import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOLpPq_BdxDRz9Q-IYheSn0HH7-dm0o_I",
    authDomain: "ensaio-samba-nigth.firebaseapp.com",
    projectId: "ensaio-samba-nigth",
    storageBucket: "ensaio-samba-nigth.firebasestorage.app",
    messagingSenderId: "326650899617",
    appId: "1:326650899617:web:2538748c878209dfb414e0"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export {
    app,
    auth,
    db
};