import React from 'react'
import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import { firestore, auth, serverTime } from '../../lib/firebase';
import { doc, collection, collectionGroup, updateDoc, } from '@firebase/firestore';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useCollectionDataOnce, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';


export default function Page() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  )
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const currUser = auth.currentUser;
  const uid = auth.currentUser ? auth.currentUser.uid : null;
  const postRef = doc(firestore, 'users');
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, postRef, preview }: { defaultValues: any, postRef: any, preview: any }) {
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues, mode: 'onChange' });
  const { onChange, onBlur, name, ref } = register('content'); 

  const updatePost = async ({content, published} : {content: string, published: boolean}) =>{
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTime,
    });

    reset({content, published});

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
    {preview && (
      <div className="card">
        <ReactMarkdown>{watch('content')}</ReactMarkdown>
      </div>
    )}

    <div className={preview ? styles.hidden : styles.controls}>

      <textarea name="content" ref={ref}></textarea>

      <fieldset>
        <input className={styles.checkbox} name="published" type="checkbox" ref={ref} />
        <label>Published</label>
      </fieldset>

      <button type="submit" className="btn-green">
        Save Changes
      </button>
    </div>
  </form>
  );
}