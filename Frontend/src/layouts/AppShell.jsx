import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navItems = [
  { to: '/app/overview', label: 'Home', icon: 'H' },
  { to: '/app/projects', label: 'Project Feed', icon: 'F' },
  { to: '/app/post-project', label: 'Post a Project', icon: '+' },
  { to: '/app/matching', label: 'Makers', icon: 'M' },
  { to: '/app/notifications', label: 'Workroom', icon: 'W' },
  { to: '/app/profile', label: 'My Profile', icon: 'P' },
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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <main className="cb-shell">
      <aside className="cb-sidebar">
        <div className="cb-brand">
          <span className="cb-brand-bolt">CB</span>
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
              <span className="cb-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="cb-sidebar-bottom">
          <button className="cb-user-mini cb-user-button" onClick={() => navigate('/app/profile')} type="button">
            <span className="cb-user-dot">{initials || 'CB'}</span>
            <span>
              <strong>{user?.name || 'CraftBridge User'}</strong>
              <small>{user?.email || 'Signed in'}</small>
            </span>
          </button>
          <button className="cb-auth-btn" onClick={() => navigate('/app/profile')} type="button">
            View Profile
          </button>
          <button className="cb-ghost-btn" onClick={handleLogout} type="button">
            Sign Out
          </button>
        </div>
      </aside>

      <section className="cb-main">
        <header className="cb-topbar">
          <h2>{title}</h2>
          <button className="cb-sign-btn" onClick={() => navigate('/app/profile')} type="button">
            {initials || 'Profile'}
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
