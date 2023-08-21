import { useState } from 'react';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Loader from './Loader';

// Uploads images to Firebase Storage
export default function ImageUploader() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState('');

    // Creates a Firebase Upload Task
    const uploadFile = async (e: any) => {
        // Get the file
        const file: any = Array.from(e.target.files)[0];
        const extension = file.type.split('/')[1];

        // Makes reference to the storage bucket location
        const storageRef = ref(storage, `uploads/${auth.currentUser ? auth.currentUser.uid : ''}/${Date.now()}.${extension}`);
        setUploading(true);

        // Starts the upload
        const task = uploadBytesResumable(storageRef, file);

        // Listen to updates to upload task
        task.on('state_changed',
            (snapshot) => {
                const pct: number = +((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
                setProgress(pct);

                task
                    .then((d) => getDownloadURL(task.snapshot.ref))
                    .then((url) =>{
                        setDownloadURL((url as string));
                        setUploading(false);
                    })

            });
    };

    return (
        <div className="box">
            <Loader show={uploading} />
            {uploading && <h3>{progress}%</h3>}

            {!uploading && (
                <>
                    <label className="btn">
                        📸 Upload Img
                        <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
                    </label>
                </>
            )}

            {downloadURL && <code className="upload-snippet">{`![alt](${downloadURL})`}</code>}
        </div>
    );
}