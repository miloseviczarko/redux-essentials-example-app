import { useAppSelector } from '@/hooks'
import { selectUserById } from '@/features/users/usersSlice'

interface Props {
  userId: string
}

export default function PostAuthor({ userId }: Props) {
  const author = useAppSelector(selectUserById(userId))

  return <span>by {author?.name ?? 'Unknown author'}</span>
}
