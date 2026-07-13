import { Post, useGetPostsQuery } from '@/features/posts/postsSlice'
import { Link } from 'react-router-dom'
import { TimeAgo } from '@/components/TimeAgo'
import ReactionButtons from '@/features/posts/ReactionButtons'
import PostAuthor from '@/features/posts/PostAuthor'
import { useMemo } from 'react'
import classNames from 'classnames'
import { Spinner } from '@/components/Spinner'

const PostExcerpt = function ({ post }: { post: Post }) {
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
  const {
    data: posts = [],
    refetch,
    isFetching,
    isLoading,
  } = useGetPostsQuery()

  const sortedPosts = useMemo(() => {
    return [...posts].sort((p1, p2) => p2.date.localeCompare(p1.date))
  }, [posts])

  const postsClassName = classNames('posts-container', {
    disabled: isFetching,
  })

  if (isLoading) return <Spinner />

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      <button onClick={refetch}>Refetch posts</button>
      <div className={postsClassName}>
        {sortedPosts.map((post) => (
          <PostExcerpt key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
