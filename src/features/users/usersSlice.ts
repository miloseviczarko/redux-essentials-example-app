import { createEntityAdapter, EntityState } from '@reduxjs/toolkit'
import { selectCurrentUserId } from '@/features/auth/authSlice'
import { RootState } from '@/app/store'
import apiSlice from '@/features/api/apiSlice'

export interface User {
  id: string
  name: string
}

const usersAdapter = createEntityAdapter<User>()
const initialState = usersAdapter.getInitialState()

const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<EntityState<User, string>, void>({
      query: () => '/users',
      transformResponse: (response: User[]) => {
        return usersAdapter.setAll(initialState, response)
      },
    }),
  }),
})

const selectUsersResult = apiSliceWithUsers.endpoints.getUsers.select()

export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors(
    (state: RootState) => selectUsersResult(state).data ?? initialState,
  )

export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)
  return selectUserById(state, currentUserId!)
}

export default apiSliceWithUsers
