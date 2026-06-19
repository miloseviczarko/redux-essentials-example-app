import { Post, ReactionName, reactionAdded } from '@/features/posts/postsSlice'
import { useAppDispatch } from '@/hooks'

interface Props {
  post: Post
}

const reactionEmoji: Record<ReactionName, string> = {
  thumbsUp: '👍',
  tada: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
}

export default function ReactionButtons({ post }: Props) {
  const dispatch = useAppDispatch()

  const reactionButtons = Object.entries(reactionEmoji).map(([reaction, emoji]) => {
    const reactionName = reaction as ReactionName

    return (
      <button
        key={reaction}
        type="button"
        className="muted-button reaction-button"
        onClick={() => dispatch(reactionAdded({ postId: post.id, reaction: reactionName }))}
      >
        {emoji} {post.reactions[reactionName]}
      </button>
    )
  })

  return <div>{reactionButtons}</div>
}
