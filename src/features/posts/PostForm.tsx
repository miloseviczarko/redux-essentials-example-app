import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { selectPostById, addNewPost, updatePost, } from '@/features/posts/postsSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { selectCurrentUserId } from '@/features/auth/authSlice'

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
  const { postId } = useParams()
  const navigate = useNavigate()
  const post = useAppSelector(selectPostById(postId ?? ''))
  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectCurrentUserId)
  const [_, setAddRequestStatus] = useState<'idle' | 'pending'>('idle')

  const handleSubmit = async (e: React.FormEvent<AddPostFormElements>) => {
    e.preventDefault()
    const form = e.currentTarget

    const {
      postTitle: { value: title },
      postContent: { value: content },
    } = form.elements

    const action = post
      ? () => updatePost({ ...post, title, content })
      : () => addNewPost({ title, content, user: userId! })

    try {
      setAddRequestStatus('pending')
      const result = await dispatch(action()).unwrap()
      form.reset()
      navigate(`/posts/${result.id}/`)
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
        <textarea
          id="postContent"
          name="postContent"
          defaultValue={post?.content ?? ''}
          required
        />
        <button type="submit">{`${post ? 'Update' : 'Create'}`} post</button>
      </form>
    </section>
  )
}
