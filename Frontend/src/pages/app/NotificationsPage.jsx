import { useEffect, useState } from 'react'
import { getNotifications } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'
import { useApplications } from '../../context/useApplications'

export default function NotificationsPage() {
  const { token } = useAuth()
  const { syncVersion } = useApplications()
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await getNotifications(token)
        setNotifications(Array.isArray(response) ? response : response.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [token, syncVersion])

  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const readCount = notifications.filter((notification) => notification.isRead).length

  return (
    <section>
      <div className="cb-feed-head">
        <div>
          <h2 className="cb-title">Workroom</h2>
          <p className="cb-sub">Track applications, updates, and team activity</p>
        </div>
      </div>

      {loading ? <p className="cb-sub">Loading workroom activity...</p> : null}
      {error ? <p className="cb-sub" style={{ color: '#d64c58' }}>{error}</p> : null}

      <div className="cb-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        <article className="cb-card">
          <h3>Recent Application Updates</h3>
          <p className="cb-sub">Latest response flow from project owners and teammates.</p>
          {notifications.length === 0 ? (
            <div className="cb-application">No updates yet. Start by applying to projects from Project Feed.</div>
          ) : notifications.map((notification) => (
            <div key={notification._id} className="cb-application">
              <div className="cb-card-kicker">
                <span>{notification.type}</span>
                <span style={{ color: notification.isRead ? '#737373' : '#ef4f31' }}>{notification.isRead ? 'Read' : 'Unread'}</span>
              </div>
              <p style={{ marginTop: '0.35rem' }}>Ref: {notification.referenceId}</p>
            </div>
          ))}
        </article>

        <article className="cb-card">
          <h3>Quick Actions</h3>
          <div className="cb-maker-actions" style={{ marginTop: '0.8rem', gridTemplateColumns: '1fr' }}>
            <button className="cb-mini-btn primary" type="button">Create Team Room</button>
            <button className="cb-mini-btn" type="button">Open Chat Workspace</button>
            <button className="cb-mini-btn" type="button">Share Project Update</button>
          </div>

          <h3 style={{ marginTop: '1rem' }}>Status Snapshot</h3>
          <div className="cb-tags" style={{ marginTop: '0.55rem' }}>
            <span className="cb-tag">Pending Reviews: {unreadCount}</span>
            <span className="cb-tag">Accepted/Read: {readCount}</span>
            <span className="cb-tag">Messages: {notifications.length}</span>
          </div>
        </article>
      </div>
    </section>
  )
}
