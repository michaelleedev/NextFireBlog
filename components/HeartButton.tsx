import { firestore, auth } from '@/lib/firebase';
import { increment, doc, getDoc, collection, writeBatch } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';




export default function Heart( props : any ) {
    const heartRef = doc(firestore, 'users', `${props.uid}`, 'posts', `${props.slug}` , 'hearts', `${auth.currentUser?.uid}`);
    const postRef = doc(firestore, 'users', `${props.uid}`, 'posts', `${props.slug}`);
    let [heartDoc] = useDocument(heartRef);

    const addHeart = async () => {
        const uid = auth.currentUser?.uid;
        const batch = writeBatch(firestore);

        batch.update(postRef, { 'heartCount': increment(1) });
        batch.set(heartRef, { uid });

        await batch.commit();
    };

    const removeHeart = async () => {
        const batch = writeBatch(firestore);

        batch.update(postRef, { heartCount: increment(-1) });
        batch.delete(heartRef);

        await batch.commit();
    };

    return heartDoc?.exists() ? (
        <button onClick={removeHeart}>💔 Unheart</button>
    ) : (
        <button onClick={addHeart}>💗 Heart</button>
    );
}