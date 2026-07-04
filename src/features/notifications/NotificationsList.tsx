import { useAppSelector, useAppDispatch } from '@/hooks'
import { selectAllNotifications, markAllAsRead, } from '@/features/notifications/notificationsSlice'
import { TimeAgo } from '@/components/TimeAgo'
import PostAuthor from '@/features/posts/PostAuthor'
import { useLayoutEffect } from 'react'
import classnames from 'classnames'

export default function NotificationsList() {
  const allNotifications = useAppSelector(selectAllNotifications)
  const dispatch = useAppDispatch()

  useLayoutEffect(() => {
    dispatch(markAllAsRead())
  })

  const renderNotifications = allNotifications.map((notification) => {
    const notificationClassname = classnames('notification', {
      new: notification.isNew,
    })

    return (
      <div className={notificationClassname}>
        <div>
          <b>
            <PostAuthor userId={notification.user} showPrefix={false} />
          </b>{' '}
          {notification.message}
        </div>
        <TimeAgo timestamp={notification.date} />
      </div>
    )
  })

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderNotifications}
    </section>
  )
}
