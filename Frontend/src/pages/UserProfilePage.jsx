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
    <main className="app-page">
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <section className="shell-panel">
          <p className="kicker">Public Creator Profile</p>
          <h1 className="page-title mt-2">{currentUser?.name || 'User'}</h1>
          <p className="page-subtitle">{currentUser?.email || 'N/A'}</p>

          {loading ? <p className="helper-ok mt-4">Loading profile info...</p> : null}
          {fetchError ? <p className="helper-error mt-4">{fetchError}</p> : null}

          <div className="section-grid two mt-5 staggered">
            <article className="shell-panel">
              <p className="kicker">Institution</p>
              <p className="mt-2 text-sm text-slate-100">{profileInfo?.Institution || 'N/A'}</p>
            </article>
            <article className="shell-panel">
              <p className="kicker">Bio</p>
              <p className="mt-2 text-sm text-slate-100">{profileInfo?.Bio || 'N/A'}</p>
            </article>
            <article className="shell-panel">
              <p className="kicker">Role</p>
              <p className="mt-2 text-sm text-slate-100">{renderList(profileInfo?.Role)}</p>
            </article>
            <article className="shell-panel">
              <p className="kicker">Skills</p>
              <p className="mt-2 text-sm text-slate-100">{renderList(profileInfo?.Skills)}</p>
            </article>
            <article className="shell-panel">
              <p className="kicker">Github</p>
              <p className="mt-2 break-all text-sm text-slate-100">{profileInfo?.Github || 'N/A'}</p>
            </article>
            <article className="shell-panel">
              <p className="kicker">LinkedIn</p>
              <p className="mt-2 break-all text-sm text-slate-100">{profileInfo?.LinkedIn || 'N/A'}</p>
            </article>
          </div>

          <div className="section-grid two mt-5">
            <button className="btn-primary" onClick={() => navigate('/app')} type="button">
              Open Dashboard
            </button>
            <button
              className="btn-danger"
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
