import { useAppSelector } from '@/hooks'
import { selectAllUsers } from '@/features/users/usersSlice'
import { Link } from 'react-router-dom'

export function UsersList() {
  const users = useAppSelector(selectAllUsers)

  return (
    <section>
      <h3>Users list</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <Link to={`/users/${u.id}`}>{u.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
