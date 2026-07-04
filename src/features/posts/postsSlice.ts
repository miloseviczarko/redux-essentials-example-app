import {
  createSlice,
  PayloadAction,
  createSelector,
  EntityState,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { logOut } from '@/features/auth/authSlice'
import { client } from '@/api/client'
import { createAppAsyncThunk } from '@/app/withTypes'
import { RootState } from '@/app/store'
import { AppStartListening } from '@/app/listenerMiddleware'

export const addPostsListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: addNewPost.fulfilled,
    effect: async (action, listenerApi) => {
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

export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')
    return response.data
  },
  {
    condition: (_, thunkApi) => {
      const status = thunkApi.getState().posts.status
      // when idle run thunk
      return status === 'idle'
    },
  },
)

type NewPost = Pick<Post, 'title' | 'content' | 'user'>
export const addNewPost = createAppAsyncThunk('posts/addNewPost', async (initialPost: NewPost) => {
  const response = await client.post<Post>('/fakeApi/posts', initialPost)
  return response.data
})

export const updatePost = createAppAsyncThunk('posts/updatePost', async (updatedPost: Post) => {
  await client.patch<Post>(`/fakeApi/posts/${updatedPost.id}`, updatedPost)

  return {
    changes: updatedPost,
    id: updatedPost.id,
  }
})

export const deletePost = createAppAsyncThunk('posts/deletePost', async (postId: string) => {
  await client.delete(`/fakeApi/posts/${postId}`)
  return postId
})

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

interface PostsState extends EntityState<Post, string> {
  status: 'idle' | 'pending' | 'resolved' | 'rejected'
  error?: string
}

const postsAdapter = createEntityAdapter<Post>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState: PostsState = postsAdapter.getInitialState({
  status: 'idle',
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reactionAdded: (state, action: PayloadAction<{ postId: string; reaction: ReactionName }>) => {
      const { postId, reaction } = action.payload
      const post = state.entities[postId]

      if (post) {
        post.reactions[reaction]++
      }
    },
  },
  selectors: {
    selectPostsStatus: (postsState) => postsState.status,
    selectPostsError: (postsState) => postsState.error,
  },
  extraReducers: (builder) => {
    // Clear out the list of posts whenever the user logs out
    builder
      .addCase(logOut.fulfilled, () => initialState)
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'resolved'
        postsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'rejected'
        state.error = action.error.message ?? 'Unknows error'
      })
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
      .addCase(deletePost.fulfilled, postsAdapter.removeOne)
      .addCase(updatePost.fulfilled, postsAdapter.updateOne)
  },
})

export const { reactionAdded } = postsSlice.actions

export const { selectPostsStatus, selectPostsError } = postsSlice.selectors

export const {
  selectAll: selectAllPosts,
  selectIds: selectAllPostsIds,
  selectById: selectPostById,
} = postsAdapter.getSelectors((state: RootState) => state.posts)

export const selectUserPosts = (userId: string) => {
  const selector = createSelector([selectAllPosts, (_, userId) => userId], (posts, userId) =>
    posts.filter((p) => p.user === userId),
  )

  return (state: RootState) => selector(state, userId)
}

export default postsSlice.reducer

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