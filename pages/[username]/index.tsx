import React from 'react'
import { firestore, getUserWithUsername, postToJSON } from '../../lib/firebase';
import { query, collectionGroup, orderBy, limit, where, getDocs, } from 'firebase/firestore';
import UserProfile from '../../components/UserProfile';
import PostFeed from '../../components/PostFeed';
import Metatags from '@/components/Metatags';

export async function getServerSideProps(context : any){
  const {username} = context.query;

  const userDoc : any = await getUserWithUsername(username);

  let user = null;
  let posts = null;

  if(userDoc){
    user = userDoc.data();
    const postsQuery = query(collectionGroup(firestore, 'posts'), where('published', '==', true), orderBy('createdAt', 'desc'), limit(5));
    posts = (await getDocs(postsQuery)).docs.map(postToJSON);
  }
  else{
    return {
      notFound: true,
    }
  }

  return {
    props: {user, posts, username},
  };
}

export default function Page({user, posts, username} : {user: any, posts: any, username: string}) {
  return (
    <main>
      <Metatags title={username} description={`${username}'s profile page`} />
      <UserProfile user={user} />
      <PostFeed posts={posts} admin={true} />
    </main>
  )
}
