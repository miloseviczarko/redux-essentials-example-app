import { useAppSelector, useAppDispatch } from '@/hooks'
import { selectAllPosts, fetchPosts } from '@/features/posts/postsSlice'
import { Link } from 'react-router-dom'
import { TimeAgo } from '@/components/TimeAgo'
import ReactionButtons from '@/features/posts/ReactionButtons'
import { useEffect } from 'react'
import PostAuthor from '@/features/posts/PostAuthor'

export function PostsList() {
  const posts = useAppSelector(selectAllPosts)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchPosts())
  }, [])
  const orderedPosts = posts.toSorted((a, b) => b.date.localeCompare(a.date))
  const renderPosts = orderedPosts.map((post) => (
    <article className="post-excerpt" key={post.id}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <TimeAgo timestamp={post.date} /> <PostAuthor userId={post.user} />
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButtons post={post} />
    </article>
  ))

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {renderPosts}
    </section>
  )
}
