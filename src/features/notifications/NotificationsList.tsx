import { useGetNotificationsQuery, markAllAsRead, selectMetadataEntities, } from '@/features/notifications/notificationsSlice'
import { TimeAgo } from '@/components/TimeAgo'
import PostAuthor from '@/features/posts/PostAuthor'
import classnames from 'classnames'
import { useAppSelector, useAppDispatch } from '@/hooks'
import { useLayoutEffect } from 'react'

export default function NotificationsList() {
  const { data: notifications = [] } = useGetNotificationsQuery()
  const metaNotificationsEntities = useAppSelector(selectMetadataEntities)
  const dispatch = useAppDispatch()

  useLayoutEffect(() => {
    dispatch(markAllAsRead())
  })

  const renderNotifications = notifications.map((notification) => {
    const meta = metaNotificationsEntities[notification.id]

    const notificationClassname = classnames('notification', {
      new: meta.isNew,
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
