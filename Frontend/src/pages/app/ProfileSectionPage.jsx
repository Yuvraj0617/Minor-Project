import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  acceptApplicant,
  getApplicants,
  getMyUserInfo,
  getProjects,
  rejectApplicant,
  updateUserInfo,
} from '../../services/authApi'
import { useAuth } from '../../context/useAuth'
import { useApplications } from '../../context/useApplications'

function splitCommaList(value) {
  if (!value.trim()) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function joinArray(values) {
  return Array.isArray(values) ? values.join(', ') : ''
}

function normalizeUrl(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function renderLink(value, fallback = 'N/A') {
  const href = normalizeUrl(value)
  if (!href) return fallback
  return (
    <a className="cb-link" href={href} rel="noreferrer" target="_blank">
      {value}
    </a>
  )
}

export default function ProfileSectionPage() {
  const { token, saveProfileInfo, user, logout } = useAuth()
  const { markApplicationDecision, syncVersion } = useApplications()
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [myProjectsCount, setMyProjectsCount] = useState(0)
  const [applications, setApplications] = useState([])
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [processingApplicationIds, setProcessingApplicationIds] = useState([])
  const [form, setForm] = useState({
    Institution: '',
    Bio: '',
    Role: '',
    Skills: '',
    Github: '',
    LinkedIn: '',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileResponse, projectsResponse] = await Promise.all([
          getMyUserInfo(token),
          getProjects({}, token),
        ])
        const profile = profileResponse.data || {}
        const allProjects = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse.data || []
        const ownedProjects = allProjects.filter((project) => project.userId?._id === user?._id)

        setForm({
          Institution: profile.Institution || '',
          Bio: profile.Bio || '',
          Role: joinArray(profile.Role),
          Skills: joinArray(profile.Skills),
          Github: profile.Github || '',
          LinkedIn: profile.LinkedIn || '',
        })

        setMyProjectsCount(ownedProjects.length)

        const applicantsResults = await Promise.allSettled(
          ownedProjects.map((project) => getApplicants(project._id, token)),
        )

        const flattenedApplications = applicantsResults.flatMap((result, index) => {
          if (result.status !== 'fulfilled') return []
          const response = result.value
          const applicants = Array.isArray(response) ? response : response.data || []
          return applicants.map((application) => ({
            ...application,
            projectTitle: ownedProjects[index]?.title || 'Project',
          }))
        })

        const uniqueConnections = new Set(
          flattenedApplications.map((application) => application.userId?._id).filter(Boolean),
        )

        setApplications(flattenedApplications)
        setConnectionsCount(uniqueConnections.size)
      } catch (err) {
        toast.error(err?.message || 'Unable to load profile data.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token, user?._id, syncVersion])

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const response = await updateUserInfo({
        Institution: form.Institution,
        Bio: form.Bio,
        Role: splitCommaList(form.Role),
        Skills: splitCommaList(form.Skills),
        Github: form.Github,
        LinkedIn: form.LinkedIn,
      }, token)
      saveProfileInfo(response.data)
      toast.success(response?.message || 'Profile updated successfully.')
    } catch (err) {
      toast.error(err?.message || 'Unable to update profile.')
    }
  }

  async function handleApplicationDecision(applicationId, action) {
    setProcessingApplicationIds((current) => [...new Set([...current, applicationId])])
    try {
      if (action === 'accept') {
        await acceptApplicant(applicationId, token)
      } else {
        await rejectApplicant(applicationId, token)
      }

      setApplications((current) => current.filter((application) => application._id !== applicationId))
      setConnectionsCount((current) => (action === 'accept' ? current + 1 : current))
      toast.success(`Application ${action}ed successfully.`)
      markApplicationDecision({ action, applicationId })
    } catch (err) {
      toast.error(err?.message || `Unable to ${action} application.`)
    } finally {
      setProcessingApplicationIds((current) => current.filter((id) => id !== applicationId))
    }
  }

  const profileRating = (4 + Math.min(0.9, connectionsCount / 20)).toFixed(1)

  return (
    <section>
      <article className="cb-card">
        <div className="cb-profile-head">
          <div className="cb-profile-user">
            <div className="cb-avatar">{(user?.name || 'Craft Bridge').split(' ').slice(0, 2).map((v) => v[0]).join('')}</div>
            <div>
              <h2 className="cb-title" style={{ fontSize: '2rem' }}>{user?.name || 'CraftBridge Maker'}</h2>
              <p className="cb-sub">{joinArray(form.Role) || 'Full-Stack Developer'}</p>
              <p className="cb-sub">{form.Institution || user?.email || 'University'}</p>
              <div className="cb-inline-links">
                {user?.email ? (
                  <a className="cb-link" href={`mailto:${user.email}`}>{user.email}</a>
                ) : null}
                {form.Github ? renderLink(form.Github) : null}
                {form.LinkedIn ? renderLink(form.LinkedIn) : null}
              </div>
              <span className="cb-tag" style={{ marginTop: '0.35rem', display: 'inline-flex' }}>✓ Verified</span>
            </div>
          </div>

          <div>
            <div className="cb-profile-metrics">
              <div><strong>{myProjectsCount}</strong><span>Projects</span></div>
              <div><strong>{connectionsCount}</strong><span>Connections</span></div>
              <div><strong>{profileRating}</strong><span>Rating</span></div>
            </div>
            <div className="cb-maker-actions" style={{ marginTop: '0.7rem' }}>
              <button className="cb-mini-btn" onClick={() => setEditMode((v) => !v)} type="button">📝 {editMode ? 'Close Edit' : 'Edit Profile'}</button>
              <button className="cb-mini-btn" onClick={logout} type="button">Sign Out</button>
            </div>
          </div>
        </div>
      </article>

      <div className="cb-tabs">
        <button className="cb-tab active" type="button">📥 Applications</button>
        <button className="cb-tab" type="button">🗂️ My Projects</button>
        <button className="cb-tab" type="button">👥 Connections</button>
      </div>

      <article className="cb-card" style={{ marginTop: '0.8rem' }}>
        <h3>Profile Details</h3>
        <div className="cb-grid two" style={{ marginTop: '0.6rem' }}>
          <div className="cb-application">
            <strong>Name</strong>
            <p>{user?.name || 'N/A'}</p>
          </div>
          <div className="cb-application">
            <strong>Email</strong>
            <p>{user?.email ? <a className="cb-link" href={`mailto:${user.email}`}>{user.email}</a> : 'N/A'}</p>
          </div>
          <div className="cb-application">
            <strong>Institution</strong>
            <p>{form.Institution || 'N/A'}</p>
          </div>
          <div className="cb-application">
            <strong>Roles</strong>
            <p>{joinArray(form.Role ? splitCommaList(form.Role) : []) || 'N/A'}</p>
          </div>
          <div className="cb-application">
            <strong>Skills</strong>
            <p>{joinArray(form.Skills ? splitCommaList(form.Skills) : []) || 'N/A'}</p>
          </div>
          <div className="cb-application">
            <strong>GitHub</strong>
            <p>{renderLink(form.Github)}</p>
          </div>
          <div className="cb-application">
            <strong>LinkedIn</strong>
            <p>{renderLink(form.LinkedIn)}</p>
          </div>
          <div className="cb-application">
            <strong>Bio</strong>
            <p>{form.Bio || 'N/A'}</p>
          </div>
        </div>
      </article>

      {loading ? <p className="cb-sub">Loading profile...</p> : null}

      {applications.length === 0 && !loading ? (
        <article className="cb-application">No incoming applications found from backend for your projects yet.</article>
      ) : applications.map((application) => (
        <article className="cb-application" key={application._id}>
          <div className="cb-card-kicker">
            <strong>{application.projectTitle}</strong>
            <span className="cb-tag">{application.status || 'pending'}</span>
          </div>
          <p className="cb-sub">
            {application.userId?.name || 'Applicant'}
            {' · '}
            {application.userId?.email || 'No email'}
          </p>
          <div className="cb-quote">
            Application received from backend workflow. Review and update status.
          </div>
          <div className="cb-maker-actions">
            <button
              className="cb-mini-btn primary"
              disabled={processingApplicationIds.includes(application._id)}
              onClick={() => handleApplicationDecision(application._id, 'accept')}
              type="button"
            >
              {processingApplicationIds.includes(application._id) ? 'Working...' : '✓ Accept'}
            </button>
            <button
              className="cb-mini-btn"
              disabled={processingApplicationIds.includes(application._id)}
              onClick={() => handleApplicationDecision(application._id, 'reject')}
              type="button"
            >
              Decline
            </button>
          </div>
        </article>
      ))}

      {editMode ? (
        <form className="cb-post-form" onSubmit={handleSubmit} style={{ marginTop: '0.9rem' }}>
          <h3>Edit Profile</h3>
          <div className="field-grid two" style={{ marginTop: '0.7rem' }}>
            <div className="field-group">
              <label className="cb-form-label" htmlFor="institution">Institution</label>
              <input id="institution" className="cb-form-input" placeholder="Institution" value={form.Institution} onChange={(e) => setForm((c) => ({ ...c, Institution: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="cb-form-label" htmlFor="github">Github URL</label>
              <input id="github" className="cb-form-input" placeholder="Github URL" value={form.Github} onChange={(e) => setForm((c) => ({ ...c, Github: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="cb-form-label" htmlFor="linkedin">LinkedIn URL</label>
              <input id="linkedin" className="cb-form-input" placeholder="LinkedIn URL" value={form.LinkedIn} onChange={(e) => setForm((c) => ({ ...c, LinkedIn: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="cb-form-label" htmlFor="roles">Roles</label>
              <input id="roles" className="cb-form-input" placeholder="frontend developer, ui designer" value={form.Role} onChange={(e) => setForm((c) => ({ ...c, Role: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="cb-form-label" htmlFor="skills">Skills</label>
              <input id="skills" className="cb-form-input" placeholder="react, node, mongodb" value={form.Skills} onChange={(e) => setForm((c) => ({ ...c, Skills: e.target.value }))} />
            </div>
          </div>
          <div className="field-group" style={{ marginTop: '0.7rem' }}>
            <label className="cb-form-label" htmlFor="bio">Bio</label>
            <textarea id="bio" className="cb-form-input cb-form-textarea" placeholder="Short bio" value={form.Bio} onChange={(e) => setForm((c) => ({ ...c, Bio: e.target.value }))} />
          </div>
          <div className="cb-maker-actions" style={{ marginTop: '0.7rem', maxWidth: '360px' }}>
            <button className="cb-mini-btn primary" type="submit">Save Profile</button>
            <button className="cb-mini-btn" onClick={() => setEditMode(false)} type="button">Cancel</button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
