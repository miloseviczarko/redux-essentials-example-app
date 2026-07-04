import { createSlice, EntityState, createEntityAdapter } from '@reduxjs/toolkit'
import { selectCurrentUserId } from '@/features/auth/authSlice'
import { client } from '@/api/client'
import { createAppAsyncThunk } from '@/app/withTypes'
import { RootState } from '@/app/store'

interface User {
  id: string
  name: string
}

const usersAdapter = createEntityAdapter<User>()

export const fetchUsers = createAppAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get<User[]>('/fakeApi/users')
  return response.data
})

const initialState: EntityState<User, string> = usersAdapter.getInitialState()

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll)
  },
})

export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state: RootState) => state.users,
)

export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)
  return selectUserById(state, currentUserId!)
}

export default usersSlice.reducer
