import { useAppSelector, useAppDispatch } from '@/hooks'
import { fetchPosts, selectAllPostsIds, selectPostById } from '@/features/posts/postsSlice'
import { Link } from 'react-router-dom'
import { TimeAgo } from '@/components/TimeAgo'
import ReactionButtons from '@/features/posts/ReactionButtons'
import { useEffect } from 'react'
import PostAuthor from '@/features/posts/PostAuthor'

const PostExcerpt = function ({ postId }: { postId: string }) {
  const post = useAppSelector((state) => selectPostById(state, postId))

  return (
    <article className="post-excerpt">
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <TimeAgo timestamp={post.date} /> <PostAuthor userId={post.user} />
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButtons post={post} />
    </article>
  )
}

export function PostsList() {
  const postsIds = useAppSelector(selectAllPostsIds)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchPosts())
  }, [])

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {postsIds?.map((post) => <PostExcerpt key={post} postId={post} />)}
    </section>
  )
}
