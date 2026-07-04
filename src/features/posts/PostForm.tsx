import React, { useState } from 'react'
import { useAppSelector } from '@/hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { selectCurrentUserId } from '@/features/auth/authSlice'
import { useGetPostQuery, useAddNewPostMutation, useUpdatePostMutation, } from '@/features/api/apiSlice'

interface AddPostFormFields extends HTMLFormControlsCollection {
  postId: HTMLInputElement
  postTitle: HTMLInputElement
  postContent: HTMLTextAreaElement
  postAuthor: HTMLSelectElement
}

interface AddPostFormElements extends HTMLFormElement {
  elements: AddPostFormFields
}

export function PostForm() {
  const navigate = useNavigate()
  const { postId } = useParams()
  const { data: post } = useGetPostQuery(postId!, {
    skip: !postId,
  })

  const [addNewPost, { isLoading: isAddLoading }] = useAddNewPostMutation()
  const [updatePost, { isLoading: isUpdateLoading }] = useUpdatePostMutation()

  const userId = useAppSelector(selectCurrentUserId)
  const [_, setAddRequestStatus] = useState<'idle' | 'pending'>('idle')

  const handleSubmit = async (e: React.FormEvent<AddPostFormElements>) => {
    e.preventDefault()
    const form = e.currentTarget

    const {
      postTitle: { value: title },
      postContent: { value: content },
    } = form.elements

    try {
      setAddRequestStatus('pending')
      const result = post
        ? await updatePost({ ...post, title, content }).unwrap()
        : await addNewPost({ title, content, user: userId! }).unwrap()
      form.reset()
      post && navigate(`/posts/${result.id}/`)
    } catch (e) {
      console.error(e)
    } finally {
      setAddRequestStatus('idle')
    }
  }

  return (
    <section>
      <h2>{post ? 'Update' : 'Create'} post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Title</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          defaultValue={post?.title ?? ''}
          required
        />
        <label htmlFor="postContent">Content</label>
        <textarea id="postContent" name="postContent" defaultValue={post?.content ?? ''} required />
        <button type="submit">{`${post ? 'Update' : 'Create'}`} post</button>
      </form>
    </section>
  )
}
