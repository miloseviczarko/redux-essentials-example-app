import { useAppSelector, useAppDispatch } from '@/hooks'
import { selectAllUsers } from '@/features/users/usersSlice'
import React from 'react'
import { userLoggedIn } from '@/features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

interface LoginPageFormFields extends HTMLFormControlsCollection {
  userId: HTMLSelectElement
}

interface LoginPageFormElements extends HTMLFormElement {
  elements: LoginPageFormFields
}

export function LoginPage() {
  const users = useAppSelector(selectAllUsers)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<LoginPageFormElements>) => {
    const { value: userId } = e.currentTarget.elements.userId

    dispatch(userLoggedIn(userId))
    navigate('/posts')
  }

  return (
    <section>
      <h2>Welcome to Tweeter!</h2>
      <h3>Please log in:</h3>
      <form onSubmit={handleSubmit}>
        <select id="userId" name="userId">
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button>Log in</button>
      </form>
    </section>
  )
}
