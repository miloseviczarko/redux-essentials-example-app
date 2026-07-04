import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { createAppAsyncThunk } from '@/app/withTypes'
import { client } from '@/api/client'
import { RootState } from '@/app/store'

interface ServerNotification {
  id: string
  date: string
  message: string
  user: string
}

interface ClientNotifications extends ServerNotification {
  isRead: boolean
  isNew: boolean
}

const notificationsAdapter = createEntityAdapter<ClientNotifications>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

export const fetchNotifications = createAppAsyncThunk(
  'notifications/fetchNotifications',
  async (_, thunkApi) => {
    const existingNotifications = selectAllNotifications(thunkApi.getState())
    const [latestNotification] = existingNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get<ServerNotification[]>(
      `/fakeApi/notifications?since=${latestTimestamp}`,
    )
    return response.data
  },
)

const initialState = notificationsAdapter.getInitialState()
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAllAsRead: (state) => state.ids.forEach((id) => (state.entities[id].isRead = true)),
  },
  selectors: {
    selectUnreadNotificationsCount: (state) =>
      Object.values(state.entities).filter((n) => !n.isRead).length,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      Object.values(state.entities).forEach((n) => (n.isNew = !n.isRead))
      notificationsAdapter.upsertMany(
        state,
        action.payload.map((n) => ({ ...n, isNew: true, isRead: false })),
      )
    })
  },
})

export const { selectUnreadNotificationsCount } = notificationsSlice.selectors
export const { selectAll: selectAllNotifications } = notificationsAdapter.getSelectors(
  (state: RootState) => state.notifications,
)

export const { markAllAsRead } = notificationsSlice.actions
export default notificationsSlice.reducer

// function pseudoAllNotificationsSelector = (state: RootState) =>
// innerNotificationsSelector(state.notifications)
