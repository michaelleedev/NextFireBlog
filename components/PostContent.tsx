import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { fromMillis } from '@/lib/firebase';

// UI component for main post content
export default function PostContent(props: any) {

    
    const post = props.post[0];
    let createdAt;
    if(typeof post.createdAt === 'number'){
        createdAt = fromMillis(post.createdAt).toDate().toISOString();
    }
    else{
        createdAt = post.createdAt;
    }

    return (

        <div className="card">
            <h1>{post.title}</h1>
            <span className="text-sm">
                Written by{' '}
                <Link className="text-info" href={`/${post.username}/`}>
                    @{post.username}
                </Link>{' '}
                on {createdAt}
            </span>
            <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
    )
    
}