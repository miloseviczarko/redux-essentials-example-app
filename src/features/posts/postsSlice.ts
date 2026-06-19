import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { userLogOut } from '@/features/auth/authSlice'
import { client } from '@/api/client'
import { createAppAsyncThunk } from '@/app/withTypes'
import { RootState } from '@/store'

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
export const addNewPost = createAppAsyncThunk(
  'posts/addNewPost',
  async (initialPost: NewPost) => {
    const response = await client.post<Post>('/fakeApi/posts', initialPost)
    return response.data
  },
)

export const updatePost = createAppAsyncThunk(
  'posts/updatePost',
  async (updatedPost: Post) => {
    const response = await client.patch<Post>(
      `/fakeApi/posts/${updatedPost.id}`,
      updatedPost,
    )
    return response.data
  },
)

export const deletePost = createAppAsyncThunk(
  'posts/deletePost',
  async (postId: string) => {
    const response = await client.delete(`/fakeApi/posts/${postId}`)
    return response.data
  },
)

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

const initialReactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
}

interface PostsSlice {
  posts: Post[]
  status: 'idle' | 'pending' | 'resolved' | 'rejected'
  error?: string
}

const initialState: PostsSlice = {
  posts: [],
  status: 'idle',
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reactionAdded: (
      state,
      action: PayloadAction<{ postId: string; reaction: ReactionName }>,
    ) => {
      const { postId, reaction } = action.payload
      const post = state.posts.find((p) => p.id === postId)

      if (post) {
        post.reactions[reaction]++
      }
    },
  },
  selectors: {
    selectAllPosts: (postsState) => postsState.posts,
    selectPostsStatus: (postsState) => postsState.status,
    selectPostsError: (postsState) => postsState.error,
  },
  extraReducers: (builder) => {
    // Clear out the list of posts whenever the user logs out
    builder
      .addCase(userLogOut, (state) => {
        state.posts = []
      })
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = [...state.posts, ...action.payload]
        state.status = 'resolved'
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'rejected'
        state.error = action.error.message ?? 'Unknows error'
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.posts.push(action.payload)
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.meta.arg)
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const { payload: updated } = action
        state.posts = state.posts.map(p => p.id === updated.id ? updated : p)
      })
  },
})

export const { reactionAdded } = postsSlice.actions

export const { selectAllPosts, selectPostsStatus, selectPostsError } =
  postsSlice.selectors
export const selectPostById = (postId: string) => (state: RootState) => {
  return state.posts.posts.find((p) => p.id === postId)
}

export default postsSlice.reducer


// pseudo code - how slice selectors have to wrap selectors function so can be used with useSelector or
// useAppSelector which passed RootState and not slice state
// const innerSelectPostById = (postSlice: Post[], postId: string) => postSlice.find((p) => p.id === postId)
// const selectPostByIdPseudo = (postId: string) => {
//   return (state: RootState) => innerSelectPostById(state.posts, postId)
// }
