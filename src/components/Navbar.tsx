import React from 'react'
import { Link } from 'react-router-dom'
import { UserIcon } from '@/components/UserIcon'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { selectCurrentUser } from '@/features/users/usersSlice'
import { userLogOut } from '@/features/auth/authSlice'

export const Navbar = () => {
  const user = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const isLoggedIn = !!user

  const navContent = () => {
    if (!isLoggedIn) return

    return (
      <div className="navContent">
        <div className="navLinks">
          <Link to={'/posts'}>Posts</Link>
        </div>
        <div className="userDetails">
          <UserIcon size={32} />
          {user.name}
          <button
            className="button small"
            onClick={() => dispatch(userLogOut())}
          >
            Log Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <nav>
      <section>
        <h1>Redux Essentials Example</h1>
        {navContent()}
      </section>
    </nav>
  )
}
