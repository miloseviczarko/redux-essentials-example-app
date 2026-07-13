import apiSlice from '@/features/api/apiSlice'
import { createSlice, createEntityAdapter, EntityState, createSelector, createAction, isAnyOf, } from '@reduxjs/toolkit'
import type { RootState, AppThunk } from '@/app/store'
import { forceGenerateNotifications } from '@/api/server'

interface ServerNotification {
  id: string
  date: string
  message: string
  user: string
}

interface MetaNotifications {
  id: string
  isRead: boolean
  isNew: boolean
}

const newNotificationReceived = createAction<ServerNotification[]>(
  'notifications/newNotification',
)

const metadataAdapter = createEntityAdapter<MetaNotifications>()
const initialState: EntityState<MetaNotifications, string> =
  metadataAdapter.getInitialState()

export const { selectAll, selectEntities: selectMetadataEntities } =
  metadataAdapter.getSelectors((state: RootState) => state.metaNotifications)

const metaNotificationsSlice = createSlice({
  name: 'metaNotifications',
  initialState,
  reducers: {
    markAllAsRead: (state) => {
      Object.values(state.entities).forEach((meta) => (meta.isRead = true))
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        apiWithNotifications.endpoints.getNotifications.matchFulfilled,
        newNotificationReceived,
      ),
      (state, { payload: notifications }) => {
        const notificationsMetadata = notifications.map((meta) => ({
          id: meta.id,
          isNew: true,
          isRead: false,
        }))

        Object.values(state.entities).forEach(
          (meta) => (meta.isNew = !meta.isRead),
        )

        metadataAdapter.upsertMany(state, notificationsMetadata)
      },
    )
  },
})

export const selectUnreadNotificationsCount = createSelector(
  selectAll,
  (metas) => metas.reduce((acc, meta) => acc + (meta.isRead ? 0 : 1), 0),
)

export const { markAllAsRead } = metaNotificationsSlice.actions

const apiWithNotifications = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ServerNotification[], void>({
      query: () => '/notifications',
      async onCacheEntryAdded(_arg, lifecycleApi) {
        const ws = new WebSocket('ws://localhost')

        try {
          await lifecycleApi.cacheDataLoaded
          const listener = (event: MessageEvent<string>) => {
            const message: {
              type: 'notifications'
              payload: ServerNotification[]
            } = JSON.parse(event.data)

            switch (message.type) {
              case 'notifications':
                {
                  lifecycleApi.updateCachedData((draft) => {
                    draft.push(...message.payload)
                  })

                  lifecycleApi.dispatch(
                    newNotificationReceived(message.payload),
                  )
                }
                break
              default:
                break
            }
          }

          ws.addEventListener('message', listener)
        } catch {}

        await lifecycleApi.cacheEntryRemoved
        ws.close()
      },
    }),
  }),
})

export const fetchNotificationsWebsocket = (): AppThunk => (_, getState) => {
  const allNotifications = selectNotificationsData(getState())
  const [latestNotification] = allNotifications
  const latestTimestamp = latestNotification?.date ?? ''
  // Hardcode a call to the mock server to simulate a server push scenario over websockets
  forceGenerateNotifications(latestTimestamp)
}

const selectNotificationsResult =
  apiWithNotifications.endpoints.getNotifications.select()

const emptyNotificationsData = [] as ServerNotification[]
const selectNotificationsData = createSelector(
  (state: RootState) => selectNotificationsResult(state)?.data,
  (notificationsData) => notificationsData ?? emptyNotificationsData,
)

export const { useGetNotificationsQuery } = apiWithNotifications

export default metaNotificationsSlice.reducer
