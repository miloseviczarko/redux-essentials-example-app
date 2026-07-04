import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '@/api/client'

interface AuthState {
  userId: string | null
}

const initialState: AuthState = {
  userId: null,
}

export const login = createAsyncThunk('auth/login', async (userId: string) => {
  await client.post<{ success: string }>('/fakeApi/login', { username: userId })
  return userId
})

export const logOut = createAsyncThunk('auth/logout', async () => {
  await client.post('/fakeApi/logout', {})
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  selectors: {
    selectCurrentUserId: (state) => state.userId,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.userId = action.payload
      })
      .addCase(logOut.fulfilled, (state) => {
        state.userId = null
      })
  },
})

export const { selectCurrentUserId } = authSlice.selectors

export default authSlice.reducer
