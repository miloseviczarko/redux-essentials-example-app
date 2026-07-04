import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Post, NewPost } from '@/features/posts/postsSlice'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
    }),
    addNewPost: builder.mutation<Post, NewPost>({
      query: (initialPost) => ({
        url: '/posts',
        method: 'POST',
        body: initialPost,
      }),
      invalidatesTags: ['Post'],
    }),
    updatePost: builder.mutation<Post, Post>({
      query: (updatedPost) => ({
        url: '/posts',
        method: 'PATCH',
        body: updatedPost,
      }),
      invalidatesTags: ['Post'],
    }),
  }),
})

export const { useGetPostsQuery, useGetPostQuery, useAddNewPostMutation, useUpdatePostMutation } =
  apiSlice

export default apiSlice
