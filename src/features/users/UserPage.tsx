import { useAppSelector } from '@/hooks'
import { selectUserById } from '@/features/users/usersSlice'
import { useParams } from 'react-router-dom'

export default function UserPage() {
  const { userId } = useParams()
  const user = useAppSelector(selectUserById(userId!))

  if (!user) {
    return (
      <section>
        <h2>User not found</h2>
      </section>
    )
  }

  return (
    <section>
      <h3>{user!.name}</h3>
    </section>
  )
}
