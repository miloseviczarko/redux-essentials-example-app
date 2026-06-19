import { createSlice } from '@reduxjs/toolkit'
import { selectCurrentUserId } from '@/features/auth/authSlice'
import { client } from '@/api/client'
import { createAppAsyncThunk } from '@/app/withTypes'
import { RootState } from '@/store'

interface User {
  id: string
  name: string
}

export const fetchUsers = createAppAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get<User[]>('/fakeApi/users')
  return response.data
})

const initialState: User[] = []

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  selectors: {
    selectAllUsers: (usersState) => usersState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, (_, action) => action.payload)
  },
})

export const { selectAllUsers } = usersSlice.selectors
export const selectUserById = (userId: string) => (state: RootState) =>
  state.users.find((u) => u.id === userId)
export const selectCurrentUser = (state: RootState) => {
  const currentUserId = selectCurrentUserId(state)
  return selectUserById(currentUserId!)(state)
}

export default usersSlice.reducer
