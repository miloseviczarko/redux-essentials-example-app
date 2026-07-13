import React from 'react'
import { Link } from 'react-router-dom'
import { UserIcon } from '@/components/UserIcon'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { selectCurrentUser } from '@/features/users/usersSlice'
import { logOut } from '@/features/auth/authSlice'
import { selectUnreadNotificationsCount, useGetNotificationsQuery, fetchNotificationsWebsocket, } from '@/features/notifications/notificationsSlice'

export const Navbar = () => {
  useGetNotificationsQuery()

  const user = useAppSelector(selectCurrentUser)
  const unreadNotificationsCount = useAppSelector(
    selectUnreadNotificationsCount,
  )
  const dispatch = useAppDispatch()
  const isLoggedIn = !!user

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
          <button onClick={() => dispatch(fetchNotificationsWebsocket())}>
            Refetch notifications
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
