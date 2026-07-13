import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import metaNotificationsSliceReducer from '@/features/notifications/notificationsSlice'
import { listenerMiddleware } from '@/app/listenerMiddleware'
import apiSlice from '@/features/api/apiSlice'

// Define types here first (no imports from slices that would cause circular dependency)
export const store = configureStore({
  reducer: {
    auth: authReducer,
    metaNotifications: metaNotificationsSliceReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk = ThunkAction<void, RootState, unknown, Action>
