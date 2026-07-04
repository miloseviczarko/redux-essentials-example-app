import { useAppSelector } from '@/hooks'
import { selectUserById } from '@/features/users/usersSlice'
import { useParams, Link } from 'react-router-dom'
import { selectUserPosts } from '../posts/postsSlice'

export default function UserPage() {
  const { userId } = useParams()
  const user = useAppSelector((state) => selectUserById(state, userId!))
  const posts = useAppSelector(selectUserPosts(userId!))

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
      <h3>Posts</h3>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <Link to={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
