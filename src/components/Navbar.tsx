import React from 'react'
import { Link } from 'react-router-dom'
import { UserIcon } from '@/components/UserIcon'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { selectCurrentUser } from '@/features/users/usersSlice'
import { logOut } from '@/features/auth/authSlice'
import {
  fetchNotifications,
  selectUnreadNotificationsCount,
} from '@/features/notifications/notificationsSlice'

export const Navbar = () => {
  const user = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const isLoggedIn = !!user
  const unreadNotificationsCount = useAppSelector(
    selectUnreadNotificationsCount,
  )

  let unreadNotificationsBadge: React.ReactNode | undefined

  if (unreadNotificationsCount > 0) {
    unreadNotificationsBadge = (
      <span className="badge">{unreadNotificationsCount}</span>
    )
  }

  const navContent = () => {
    if (!isLoggedIn) return

    return (
      <div className="navContent">
        <div className="navLinks">
          <Link to={'/posts'}>Posts</Link>
          <Link to={'/users'}>Users</Link>
          <Link to={'/notifications'}>
            Notifications {unreadNotificationsBadge}
          </Link>
          <button
            className="button small"
            onClick={async () => await dispatch(fetchNotifications())}
          >
            Refresh notifications
          </button>
        </div>
        <div className="userDetails">
          <div className="userControls">
            <UserIcon size={32} />
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </div>
          <button
            className="button small"
            onClick={async () => await dispatch(logOut())}
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
