import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { selectPostById, Post, deletePost } from '@/features/posts/postsSlice'
import PostAuthor from '@/features/posts/PostAuthor'
import { TimeAgo } from '@/components/TimeAgo'
import ReactionButtons from '@/features/posts/ReactionButtons'
import { selectCurrentUserId } from '@/features/auth/authSlice'

function PostButtons({ post }: { post: Post }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return (
    <>
      <button onClick={() => navigate(`/posts/${post.id}/edit`)}>Edit</button>
      <button
        onClick={async () => {
          await dispatch(deletePost(post.id))
          navigate(`/posts`)
        }}
      >
        Delete
      </button>
    </>
  )
}

export function PostPage() {
  const { postId } = useParams()
  const post = useAppSelector(selectPostById(postId!))
  const currentUserId = useAppSelector(selectCurrentUserId)

  if (!post) {
    return (
      <section>
        <h2>Post not found</h2>
      </section>
    )
  }

  return (
    <article>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <PostAuthor userId={post.user} />
      <TimeAgo timestamp={post.date} />
      <ReactionButtons post={post} />
      {currentUserId === post.user && <PostButtons post={post} />}
    </article>
  )
}
