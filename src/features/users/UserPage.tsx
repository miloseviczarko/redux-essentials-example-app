import { useAppSelector } from '@/hooks'
import { selectUserById } from '@/features/users/usersSlice'
import { useParams, Link } from 'react-router-dom'
import { useGetPostsQuery, Post } from '../posts/postsSlice'
import { createSelector } from '@reduxjs/toolkit'
import { TypedUseQueryStateResult } from '@reduxjs/toolkit/query/react'

type GetPostsSelectFromResultArg = TypedUseQueryStateResult<Post[], any, any>

const selectPostForUser = createSelector(
  (res: GetPostsSelectFromResultArg) => res.data || [],
  (_res: GetPostsSelectFromResultArg, userId: string) => userId,
  (res, userId) => res.filter((post) => post.user === userId),
)

export default function UserPage() {
  const { userId } = useParams()
  const user = useAppSelector((state) => selectUserById(state, userId!))
  const { postsForUser } = useGetPostsQuery(undefined, {
    selectFromResult: (result) => ({
      postsForUser: selectPostForUser(result, userId!),
    }),
  })

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
        {postsForUser?.map((p) => (
          <li key={p.id}>
            <Link to={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
