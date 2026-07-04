import { useAppSelector } from '@/hooks'
import { selectUserById } from '@/features/users/usersSlice'

interface Props {
  userId: string
  showPrefix?: boolean
}

export default function PostAuthor({
 userId, showPrefix = true 
}: Props) {
  const author = useAppSelector((state) => selectUserById(state, userId))

  return (
    <span>
      {showPrefix && 'by'} {author?.name ?? 'Unknown author'}
    </span>
  )
}
