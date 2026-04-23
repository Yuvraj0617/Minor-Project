import { useEffect, useState } from 'react'
import { getNotifications } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'

export default function NotificationsPage() {
  const { token } = useAuth()
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
  }, [token])

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Notifications</p>
      <h2 className="mt-3 text-3xl font-bold text-white">Workflow updates</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Notifications keep users informed about applications and collaboration status changes.</p>
      {loading ? <p className="mt-6 text-sm text-slate-300">Loading notifications...</p> : null}
      {error ? <p className="mt-6 text-sm font-medium text-rose-300">{error}</p> : null}
      <div className="mt-6 grid gap-4">
        {notifications.length === 0 && !loading ? <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">No notifications available yet.</div> : null}
        {notifications.map((notification) => (
          <article key={notification._id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{notification.type}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Reference ID</h3>
            <p className="mt-2 break-all text-sm text-slate-300">{notification.referenceId}</p>
            <p className="mt-3 text-xs text-slate-400">{notification.isRead ? 'Read' : 'Unread'}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
