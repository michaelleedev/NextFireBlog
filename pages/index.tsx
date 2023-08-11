import { Inter } from 'next/font/google'

import PostFeed from '../components/PostFeed';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { firestore, fromMillis, postToJSON } from '../lib/firebase';
import { query, where, orderBy, limit, getDocs, collectionGroup, startAfter } from 'firebase/firestore';
import Metatags from '@/components/Metatags';

import { useState } from 'react';

const LIMIT = 2;

export async function getServerSideProps(context: any) {
  const postsQuery = query(collectionGroup(firestore, 'posts'), where('published', '==', true), orderBy('createdAt', 'desc'), limit(LIMIT));

  const posts = (await getDocs(postsQuery)).docs.map(postToJSON);

  return {
    props: { posts },
  }
}

const inter = Inter({ subsets: ['latin'] })

export default function Home(props : any) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor = typeof last.createdAt === 'number' ? fromMillis(last.createdAt) : last.createdAt;
  
    const q = query(collectionGroup(firestore, 'posts'), where('published', '==', true), orderBy('createdAt', 'desc'), startAfter(cursor), limit(LIMIT));
    const newPosts = (await getDocs(q)).docs.map((doc) => doc.data());
    setPosts(posts.concat(newPosts));
    setLoading(false);

    if(newPosts.length < LIMIT){
      setPostsEnd(true);
    }
  }


  return (
    <main>
      <Metatags title="home page" />

      <PostFeed posts={posts} admin={false}/>

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  )
}
