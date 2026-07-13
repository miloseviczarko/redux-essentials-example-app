import { AppStartListening } from '@/app/listenerMiddleware'
import apiSlice from '../api/apiSlice'
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'

interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export type ReactionName = keyof Reactions

export interface Post {
  id: string
  title: string
  content: string
  user: string
  date: string
  reactions: Reactions
}

export type NewPost = Pick<Post, 'title' | 'content' | 'user'>

export const addPostsListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    matcher: apiSliceWithPosts.endpoints.addNewPost.matchFulfilled,
    effect: async (_action, listenerApi) => {
      const { toast } = await import('react-tiny-toast')

      const toastId = toast.show('New post added!', {
        variant: 'success',
        position: 'bottom-right',
        pause: true,
      })

      await listenerApi.delay(5000)
      toast.remove(toastId)
    },
  })
}

const apiSliceWithPosts = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: (result = []) => [
        'Post',
        { type: 'Post', id: 'LIST' },
        ...result.map(({ id }) => ({ type: 'Post', id }) as const),
      ],
    }),
    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (_result, _error, arg) => [{ type: 'Post', id: arg }],
    }),
    addNewPost: builder.mutation<Post, NewPost>({
      query: (initialPost) => ({
        url: '/posts',
        method: 'POST',
        body: initialPost,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    updatePost: builder.mutation<Post, Post>({
      query: (updatedPost) => ({
        url: `/posts/${updatedPost.id}`,
        method: 'PATCH',
        body: updatedPost,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Post', id: arg.id }],
    }),
    deletePost: builder.mutation<void, string>({
      query: (postId: string) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Post', id: arg }],
    }),
    addReaction: builder.mutation<
      Post,
      { postId: string; reaction: ReactionName }
    >({
      query: ({ postId, reaction }) => ({
        url: `/posts/${postId}/reactions`,
        method: 'POST',
        body: { reaction },
      }),
      async onQueryStarted({ postId, reaction }, lifeCycleApi) {
        const getPostsPatchResult = lifeCycleApi.dispatch(
          apiSliceWithPosts.util.updateQueryData(
            'getPosts',
            undefined,
            (draft) => {
              const existing = draft.find((post) => post.id === postId)
              if (existing) existing.reactions[reaction]++
            },
          ),
        )

        const getPostPatchResult = lifeCycleApi.dispatch(
          apiSliceWithPosts.util.updateQueryData('getPost', postId, (draft) => {
            if (draft) draft.reactions[reaction]++
          }),
        )

        try {
          await lifeCycleApi.queryFulfilled
        } catch {
          getPostPatchResult.undo()
          getPostsPatchResult.undo()
        }
      },
    }),
  }),
})

/*
function MyMutation<Return, Arg>(params: {
  query: (args: Arg) => {
    url: string
    method: 'GET' | 'POST'
    body: Record<string, any>
  }
  onQueryStarted: (args: Arg) => Return
})
 */

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddReactionMutation,
} = apiSliceWithPosts

const selectPostsResult = apiSliceWithPosts.endpoints.getPosts.select()
const selectAllPosts = (state: RootState) => selectPostsResult(state).data ?? []

export const selectUserPosts = createSelector(
  [selectAllPosts, (_, userId: string) => userId],
  (posts, userId) => posts.filter((p) => p.user === userId),
)

export default apiSliceWithPosts

// pseudo code - how slice selectors have to wrap selectors function so can be used with useSelector or
// useAppSelector which passed RootState and not slice state
/*
  const innerSelectPostById = (postSlice: Post[], postId: string) => postSlice.find((p) => p.id === postId)
  const selectPostByIdPseudo = (postId: string) => {
    return (state: RootState) => innerSelectPostById(state.posts, postId)
  }
*
 */

// pseudo code - how async thunk pass arguments to callback

/*
  export const fetchNotifications = createAppAsyncThunk(
    'notifications/fetchNotifications',
    async (_unused, thunkApi) => {
      const state = thunkApi.getState()
      console.log(state)
    },
  )
  dispatch(fetchNotifications())
*/

/*
function createAppAsyncThunkPseudo(
  name: string,
  callback: (
    arg: any,
    thunkApi: { dispatch: AppDispatch; getState: AppStore['getState'] },
  ) => Promise<any>,
) {
  const types = {
    pending: `${name}/pending`,
    fulfilled: `${name}/fulfilled`,
    rejected: `${name}/rejected`,
  }

  return function asyncThunkAction(arg: Parameters<typeof callback>[0]) {
    return async function (
      dispatch: AppDispatch,
      getState: AppStore['getState'],
    ) {
      dispatch({ type: types.pending })
      try {
        const result = await callback(arg, { dispatch, getState })
        return dispatch({ type: types.fulfilled, payload: result.data })
      } catch (err) {
        return dispatch({ type: types.rejected, payload: err })
      }
    }
  }
}
*/

/*
function createAsyncThunk<Return, Arg>(
  typePrefix: string,
  payloadCreator: (arg: Arg, thunkApi: ThunkAPI) => Promise<Return>,
): AsyncThunk<Return, Arg>
// Where:
interface ThunkAPI {
  dispatch: Dispatch
  getState: () => RootState
  extra?: unknown
  requestId?: string
  signal?: AbortSignal
}
interface AsyncThunk<Return, Arg> {
  pending: (arg: Arg) => PendingAction<Arg>
  fulfilled: (payload: Return) => FulfilledAction<Return>
  rejected: (error: unknown, arg: Arg) => RejectedAction<Arg>
  typePrefix: string

  (arg: Arg): Promise<Return> // the thunk itself
}
// Full implementation:
function createAsyncThunk<Return, Arg>(
  typePrefix: string,
  payloadCreator: (arg: Arg, thunkApi: ThunkAPI) => Promise<Return>,
): AsyncThunk<Return, Arg> {
  const pendingType = `${typePrefix}/pending`
  const fulfilledType = `${typePrefix}/fulfilled`
  const rejectedType = `${typePrefix}/rejected`
  const pending = (arg: Arg): PendingAction<Arg> => ({
    type: pendingType,
    payload: undefined,
    meta: { arg },
  })
  pending.type = pendingType // Attach type to function
  const fulfilled = (payload: Return): FulfilledAction<Return> => ({
    type: fulfilledType,
    payload,
    meta: {},
  })
  fulfilled.type = fulfilledType // Attach type to function
  const rejected = (error: unknown, arg: Arg): RejectedAction<Arg> => ({
    type: rejectedType,
    payload: undefined,
    error: error instanceof Error ? error.message : String(error),
    meta: { arg },
  })
  rejected.type = rejectedType // Attach type to function
  const thunk = (arg: Arg): ThunkAction<Return> => {
    return async (dispatch, getState, extra) => {
      dispatch(pending(arg))
      try {
        const result = await payloadCreator(arg, { dispatch, getState, extra })
        dispatch(fulfilled(result))
        return result
      } catch (error) {
        dispatch(rejected(error, arg))
        throw error
      }
    }
  }
  thunk.pending = pending
  thunk.fulfilled = fulfilled
  thunk.rejected = rejected
  thunk.typePrefix = typePrefix
  return thunk
}
*/