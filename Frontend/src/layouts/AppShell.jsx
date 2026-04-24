import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navItems = [
  { to: '/app/overview', label: 'Home', icon: '🏠' },
  { to: '/app/projects', label: 'Project Feed', icon: '🔎' },
  { to: '/app/post-project', label: 'Post a Project', icon: '✏️' },
  { to: '/app/matching', label: 'Makers', icon: '👥' },
  { to: '/app/notifications', label: 'Workroom', icon: '⚡' },
  { to: '/app/profile', label: 'My Profile', icon: '🎓' },
]

const headingByPath = {
  overview: 'Home',
  projects: 'Project Feed',
  'post-project': 'Post a Project',
  matching: 'Makers Directory',
  notifications: 'Workroom',
  profile: 'My Profile',
  chat: 'Chat',
}

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const activeKey = location.pathname.replace('/app/', '') || 'overview'
  const title = headingByPath[activeKey] || 'CraftBridge'
  const initials = (user?.name || 'CraftBridge User')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <main className="cb-shell">
      <aside className="cb-sidebar">
        <div className="cb-brand">
          <span className="cb-brand-bolt">⚡</span>
          <div>
            <h1>CraftBridge</h1>
            <p>Student Project Network</p>
          </div>
        </div>

        <p className="cb-nav-kicker">Navigate</p>
        <nav className="cb-nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `cb-nav-item ${isActive ? 'active' : ''}`}
              to={item.to}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="cb-sidebar-bottom">
          <div className="cb-user-mini">
            <div className="cb-user-dot">{initials || 'CB'}</div>
            <div>
              <p>{user?.name || 'CraftBridge User'}</p>
              <span>{user?.email || 'Signed in'}</span>
            </div>
          </div>
          <button className="cb-auth-btn" onClick={() => navigate('/user-profile')} type="button">
            Sign In / Sign Up →
          </button>
          <button
            className="cb-ghost-btn"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            type="button"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <section className="cb-main">
        <header className="cb-topbar">
          <h2>{title}</h2>
          <button className="cb-sign-btn" onClick={() => navigate('/user-profile')} type="button">
            Sign In
          </button>
        </header>
        <div className="cb-content">
          <Outlet />
          {activeKey === 'notifications' ? (
            <button className="cb-chat-fab" onClick={() => navigate('/app/chat')} type="button">
              Open Chat
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}
