import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navItems = [
  { to: '/app/overview', label: 'Overview' },
  { to: '/app/projects', label: 'Projects' },
  { to: '/app/post-project', label: 'Post Project' },
  { to: '/app/matching', label: 'Matching' },
  { to: '/app/notifications', label: 'Notifications' },
  { to: '/app/chat', label: 'Chat' },
  { to: '/app/profile', label: 'Profile' },
]

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_24%),linear-gradient(180deg,_#07101d_0%,_#0f172a_52%,_#101826_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5 md:px-8 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-2xl backdrop-blur lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-80">
          <div className="rounded-[1.6rem] bg-linear-to-br from-orange-500/20 via-sky-500/10 to-emerald-500/15 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Project Synopsis</p>
            <h1 className="mt-3 text-2xl font-bold text-white">Collaboration Platform</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Section-wise navigation for profile, matching, projects, recruitment, notifications, and chat.
            </p>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
            <p className="mt-2 text-lg font-semibold text-white">{user?.name || 'User'}</p>
            <p className="text-sm text-slate-300">{user?.email || 'No email found'}</p>
          </div>

          <nav className="mt-5 grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-linear-to-r from-orange-500 to-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                      : 'border border-white/8 bg-white/6 text-slate-200 hover:bg-white/12'
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 flex gap-2">
            <button
              className="flex-1 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              onClick={() => navigate('/user-profile')}
              type="button"
            >
              Classic Profile
            </button>
            <button
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              type="button"
            >
              Logout
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Current section: {location.pathname.replace('/app/', '') || 'overview'}
          </p>
        </aside>

        <section className="min-w-0 flex-1 py-1">
          <Outlet />
        </section>
      </div>
    </main>
  )
}
