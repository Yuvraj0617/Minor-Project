import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyUserInfo } from '../services/authApi'
import { useAuth } from '../context/useAuth'

function renderList(values) {
  if (!values || values.length === 0) {
    return 'N/A'
  }

  return values.join(', ')
}

export default function UserProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const { token, user, userInfo, saveProfileInfo, logout } = useAuth()
  const [profileInfo, setProfileInfo] = useState(() => userInfo)

  const currentUser = useMemo(() => user, [user])

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser?._id) {
        setLoading(false)
        setFetchError('User is missing. Please login again.')
        return
      }

      try {
        const response = await getMyUserInfo(token)
        if (response.data) {
          setProfileInfo(response.data)
          saveProfileInfo(response.data)
        }
      } catch {
        setFetchError('Using saved local profile info because backend profile fetch failed.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [currentUser?._id, saveProfileInfo, token])

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-6xl items-center justify-center rounded-3xl bg-linear-to-br from-sky-100 via-emerald-100 to-lime-100 p-4 md:p-8">
        <section className="w-full max-w-3xl rounded-2xl border border-white/80 bg-white/85 p-7 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">User Profile</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">{currentUser?.name || 'User'}</h1>
          <p className="mt-1 text-sm text-slate-600">Signed in as {currentUser?.email || 'N/A'}</p>

          {loading ? <p className="mt-4 text-sm font-semibold text-sky-700">Loading profile info...</p> : null}
          {fetchError ? <p className="mt-2 text-sm text-rose-600">{fetchError}</p> : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Institution</span>
              <p className="mt-1 text-sm font-semibold text-slate-800">{profileInfo?.Institution || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Bio</span>
              <p className="mt-1 text-sm font-semibold text-slate-800">{profileInfo?.Bio || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Role</span>
              <p className="mt-1 text-sm font-semibold text-slate-800">{renderList(profileInfo?.Role)}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Skills</span>
              <p className="mt-1 text-sm font-semibold text-slate-800">{renderList(profileInfo?.Skills)}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Github</span>
              <p className="mt-1 break-all text-sm font-semibold text-slate-800">{profileInfo?.Github || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">LinkedIn</span>
              <p className="mt-1 break-all text-sm font-semibold text-slate-800">{profileInfo?.LinkedIn || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              className="rounded-xl bg-linear-to-r from-emerald-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              onClick={() => navigate('/app')}
              type="button"
            >
              Open Dashboard
            </button>
            <button
              className="rounded-xl bg-linear-to-r from-slate-600 to-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
