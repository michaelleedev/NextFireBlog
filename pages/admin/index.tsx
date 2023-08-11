import React from 'react'
import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import PostFeed from '../../components/PostFeed';
import { UserContext } from '../../lib/context';
import { firestore, auth, serverTime, postToJSON } from '../../lib/firebase';
import { collection, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { useCollection } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';

const kebabCase = require('lodash.kebabcase');

export default function index(props: any) {

  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  )
}

function PostList() {
  let currentUser = auth.currentUser;

  const ref = collection(firestore, 'users', currentUser === null ? '' : currentUser.uid, 'posts');
  const q = query(ref, orderBy('createdAt'));
  const [querySnapshot] = useCollection(q);

  const posts = querySnapshot?.docs.map((doc) => doc.data())


  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
}



function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  const slug = encodeURI(kebabCase(title));

  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e: any) => {
    e.preventDefault();
    const uid = auth.currentUser === null ? '' : auth.currentUser.uid;
    const ref = doc(firestore, 'users', uid, 'posts', slug);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# start writing here',
      createdAt: serverTime,
      updatedAt: serverTime,
      heartCount: 0,
    };

    await setDoc(ref, data);

    toast.success('Post crated!');

    router.push(`/admin/${slug}`);

  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}