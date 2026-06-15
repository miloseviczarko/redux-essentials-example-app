import React from 'react'
import { useAppDispatch } from '@/hooks'
import { postAdded } from '@/features/posts/postsSlice'
import { nanoid } from '@reduxjs/toolkit'

interface AddPostFormFields extends HTMLFormControlsCollection {
  postTitle: HTMLInputElement
  postContent: HTMLTextAreaElement
}

interface AddPostFormElements extends HTMLFormElement {
  elements: AddPostFormFields
}

export function AddPostForm() {
  const dispatch = useAppDispatch()
  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    e.preventDefault()

    const {
      postTitle: { value: title },
      postContent: { value: content },
    } = e.currentTarget.elements

    dispatch(postAdded({ id: nanoid(), title, content }))
  }
  return (
    <section>
      <h2>Add new post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Title</label>
        <input type="text" id="postTitle" name="postTitle" defaultValue="" required />
        <label htmlFor="postContent">Content</label>
        <textarea id="postContent" name="postContent" defaultValue="" required />
        <button type="submit">Add post</button>
      </form>
    </section>
  )
}
