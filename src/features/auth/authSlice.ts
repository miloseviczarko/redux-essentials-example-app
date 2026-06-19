import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
}

const initialState: AuthState = {
  userId: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: (state, action: PayloadAction<string>) => {
      state.userId = action.payload
    },
    userLogOut: (state) => {
      state.userId = null
    },
  },
  selectors: {
    selectCurrentUserId: (state) => state.userId,
  },
})

export const { userLoggedIn, userLogOut } = authSlice.actions

export const { selectCurrentUserId } = authSlice.selectors

export default authSlice.reducer
