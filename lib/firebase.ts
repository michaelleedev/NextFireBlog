import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, getDocs, getDoc, collection, query, where, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC1qvIC4PchuiN4nfSS9yF99qxqGJWlcDo",
    authDomain: "nextfire-ae8f4.firebaseapp.com",
    projectId: "nextfire-ae8f4",
    storageBucket: "nextfire-ae8f4.appspot.com",
    messagingSenderId: "288926736421",
    appId: "1:288926736421:web:259e6233f47798f20adfcc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const serverTime = serverTimestamp();

export async function getUserWithUsername(username: string) {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const userDoc = (await getDocs(q)).docs[0];
    return userDoc;
}

export async function getUIDwithUsername(username: string){
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const userDoc = (await getDocs(q)).docs[0];
    return userDoc.id;
}

export function postToJSON(doc: any) {
    const data = doc.data();
    return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
    };
}

export const fromMillis = (millis: number) => Timestamp.fromMillis(millis);
