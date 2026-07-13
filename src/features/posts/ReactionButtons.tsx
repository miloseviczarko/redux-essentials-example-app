import { Post, ReactionName, useAddReactionMutation, } from '@/features/posts/postsSlice'

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
  const [addReaction] = useAddReactionMutation()
  const reactionButtons = Object.entries(reactionEmoji).map(
    ([reaction, emoji]) => {
      const reactionName = reaction as ReactionName

      return (
        <button
          key={reaction}
          type="button"
          className="muted-button reaction-button"
          onClick={() =>
            addReaction({ postId: post.id, reaction: reactionName })
          }
        >
          {emoji} {post.reactions[reactionName]}
        </button>
      )
    },
  )

  return <div>{reactionButtons}</div>
}
