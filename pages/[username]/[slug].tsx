import styles from '@/styles/Post.module.css';
import PostContent from '../../components/PostContent';
import { firestore, getUserWithUsername, getUIDwithUsername, postToJSON } from '../../lib/firebase';
import {collectionGroup, getDocs, doc,  query, where, limit} from '@firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import Metatags from '@/components/Metatags';
import HeartButton from '@/components/HeartButton';
import AuthCheck from '@/components/AuthCheck';
import Link from 'next/link';

export async function getStaticProps({ params } : {params:any}) {
  const { slug, username } = params;
  const userDoc = await getUserWithUsername(username);

  const uid = await getUIDwithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = doc(firestore, 'users', `${uid}`, 'posts', `${slug}`);
    const postQuery = query(collectionGroup(firestore, 'posts'), where('slug', '==', slug), limit(1));
    post = (await getDocs(postQuery)).docs.map(postToJSON);

    path = postRef.path;
  }

  return {
    props: { post, path, uid, slug},
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  // Improve my using Admin SDK to select empty docs
  const snapshot = await getDocs(query(collectionGroup(firestore, 'posts')));

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: 'blocking',
  };
}

export default function Page(props : any) {
  const postRef = doc(firestore, props.path);
  const [realtimePost] = useDocumentData(postRef);
  
  const post = realtimePost || props.post;

  return (
    <main className={styles.container}>
      <Metatags title={`${props.post[0].title}`} description={`${props.post[0].username}'s post`} />
      <section>
        <PostContent post={props.post}/>
      </section>
      
      <aside className='card'>
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>
        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
          >
            <HeartButton uid={props.uid} slug={props.slug}/>
          </AuthCheck>
      </aside>
    </main>
  );
}