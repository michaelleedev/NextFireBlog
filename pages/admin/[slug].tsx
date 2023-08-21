import React from 'react'
import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import { firestore, auth, serverTime } from '../../lib/firebase';
import { doc, updateDoc, } from '@firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ErrorMessage } from '@hookform/error-message';
import ImageUploader from '@/components/ImageUploader';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useCollectionDataOnce, useDocumentData } from 'react-firebase-hooks/firestore';
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
  const [user] = useAuthState(auth);

  const router = useRouter();
  const { slug } = router.query;

  const uid = user?.uid;
  const postRef = doc(firestore, 'users', `${uid}`, 'posts', `${slug}`);
  const [post] = useDocumentData(postRef);

  return (
    <main className={styles.container}>

      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>
            <ImageUploader />
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
  const { register, handleSubmit, reset, watch, formState, formState: { errors }, setError } = useForm({ defaultValues, mode: 'onChange' });
  const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }: { content: string, published: boolean }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTime,
    });

    reset({ content, published });

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

        <textarea {...register('content', {
          required: 'content is required',
          maxLength: {
            value: 20000,
            message: 'content is too long',
          },
          minLength: {
            value: 10,
            message: 'content is too short'
          },
        })}></textarea>

        <ErrorMessage
          errors={errors}
          name="content"
          render={({ message }) => <p className='text-danger'>{message}</p>}
        />

        <fieldset>
          <input className={styles.checkbox} type="checkbox" {...register('published')} />
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green">
          Save Changes
        </button>
      </div>
    </form>
  );
}