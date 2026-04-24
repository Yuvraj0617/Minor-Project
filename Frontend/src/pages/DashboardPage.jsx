import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  acceptApplicant,
  applyToProject,
  createProject,
  getApplicants,
  getMatchedProjects,
  getMatchedUsersForProject,
  getMyUserInfo,
  getNotifications,
  getProjects,
  rejectApplicant,
  updateUserInfo,
} from '../services/authApi'
import { useAuth } from '../context/useAuth'

function toArrayInput(value) {
  return Array.isArray(value) ? value.join(', ') : ''
}

function splitCommaList(value) {
  if (!value.trim()) {
    return []
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function NotificationBadge({ count }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      {count} notifications
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { token, user, saveProfileInfo, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [matches, setMatches] = useState([])
  const [notifications, setNotifications] = useState([])
  const [applicantsByProject, setApplicantsByProject] = useState({})
  const [candidateMatchesByProject, setCandidateMatchesByProject] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [projectFilters, setProjectFilters] = useState({
    skill: '',
    technology: '',
    type: '',
  })
  const [profileForm, setProfileForm] = useState({
    Institution: '',
    Bio: '',
    Role: '',
    Skills: '',
    Github: '',
    LinkedIn: '',
  })
  const [projectForm, setProjectForm] = useState({
    title: '',
    type: '',
    description: '',
    requiredSkills: '',
    technologies: '',
    teamSize: 1,
    isurgent: false,
  })

  const myProjects = useMemo(
    () => projects.filter((project) => project.userId?._id === user?._id),
    [projects, user?._id],
  )

  async function refreshProjects(filters = projectFilters) {
    const response = await getProjects(filters, token)
    setProjects(Array.isArray(response) ? response : response.data || [])
  }

  async function refreshDashboard() {
    try {
      setLoading(true)
      setErrorMessage('')

      const [profileResponse, projectResponse, notificationResponse] = await Promise.all([
        getMyUserInfo(token),
        getProjects({}, token),
        getNotifications(token),
      ])

      const currentProfile = profileResponse.data || null
      const currentProjects = Array.isArray(projectResponse) ? projectResponse : projectResponse.data || []
      const currentNotifications = Array.isArray(notificationResponse)
        ? notificationResponse
        : notificationResponse.data || []

      setProfile(currentProfile)
      saveProfileInfo(currentProfile)
      setProjects(currentProjects)
      setNotifications(currentNotifications)

      if (currentProfile?.Skills?.length || currentProfile?.Role?.length) {
        const matchResponse = await getMatchedProjects(token)
        setMatches(matchResponse.data || [])
      } else {
        setMatches([])
      }

      setProfileForm({
        Institution: currentProfile?.Institution || '',
        Bio: currentProfile?.Bio || '',
        Role: toArrayInput(currentProfile?.Role),
        Skills: toArrayInput(currentProfile?.Skills),
        Github: currentProfile?.Github || '',
        LinkedIn: currentProfile?.LinkedIn || '',
      })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshDashboard()
  }, [])

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setStatusMessage('')
    setErrorMessage('')

    try {
      const payload = {
        Institution: profileForm.Institution,
        Bio: profileForm.Bio,
        Role: splitCommaList(profileForm.Role),
        Skills: splitCommaList(profileForm.Skills),
        Github: profileForm.Github,
        LinkedIn: profileForm.LinkedIn,
      }

      const response = await updateUserInfo(payload, token)
      setProfile(response.data)
      saveProfileInfo(response.data)
      setStatusMessage('Profile updated successfully.')

      const matchResponse = await getMatchedProjects(token)
      setMatches(matchResponse.data || [])
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleProjectSubmit(event) {
    event.preventDefault()
    setStatusMessage('')
    setErrorMessage('')

    try {
      const payload = {
        title: projectForm.title,
        type: splitCommaList(projectForm.type),
        description: projectForm.description,
        requiredSkills: splitCommaList(projectForm.requiredSkills),
        technologies: splitCommaList(projectForm.technologies),
        teamSize: Number(projectForm.teamSize) || 1,
        isurgent: projectForm.isurgent,
      }

      await createProject(payload, token)
      setProjectForm({
        title: '',
        type: '',
        description: '',
        requiredSkills: '',
        technologies: '',
        teamSize: 1,
        isurgent: false,
      })
      setStatusMessage('Project created successfully.')
      await refreshProjects({})
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleProjectApply(projectId) {
    setStatusMessage('')
    setErrorMessage('')

    try {
      await applyToProject(projectId, token)
      setStatusMessage('Application sent successfully.')
      const notificationResponse = await getNotifications(token)
      setNotifications(Array.isArray(notificationResponse) ? notificationResponse : notificationResponse.data || [])
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleFilterSubmit(event) {
    event.preventDefault()
    setStatusMessage('')
    setErrorMessage('')

    try {
      await refreshProjects(projectFilters)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleLoadApplicants(projectId) {
    setStatusMessage('')
    setErrorMessage('')

    try {
      const response = await getApplicants(projectId, token)
      setApplicantsByProject((current) => ({
        ...current,
        [projectId]: Array.isArray(response) ? response : response.data || [],
      }))
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleApplicantAction(projectId, applicationId, action) {
    setStatusMessage('')
    setErrorMessage('')

    try {
      if (action === 'accept') {
        await acceptApplicant(applicationId, token)
      } else {
        await rejectApplicant(applicationId, token)
      }

      setStatusMessage(`Application ${action}ed successfully.`)
      await handleLoadApplicants(projectId)
      const notificationResponse = await getNotifications(token)
      setNotifications(Array.isArray(notificationResponse) ? notificationResponse : notificationResponse.data || [])
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleLoadCandidateMatches(projectId) {
    setStatusMessage('')
    setErrorMessage('')

    try {
      const response = await getMatchedUsersForProject(projectId, token)
      setCandidateMatchesByProject((current) => ({
        ...current,
        [projectId]: response.data || [],
      }))
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  if (loading) {
    return (
      <main className="min-h-dvh bg-slate-950 px-4 py-8 text-slate-50 sm:py-10">
        <div className="mx-auto max-w-6xl animate-pulse rounded-[2rem] border border-white/10 bg-white/5 p-8">
          Loading your workspace...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_26%),linear-gradient(180deg,_#08111f_0%,_#0f172a_48%,_#111827_100%)] px-3 py-4 text-slate-100 sm:px-4 sm:py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 shadow-2xl backdrop-blur sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Collab Workspace</p>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">{user?.name || 'Builder'} Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                This frontend is connected to your backend workflow: profile setup, skill-based matching, project posting,
                applications, applicants, and notifications.
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <NotificationBadge count={notifications.length} />
              <button
                className="w-full rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 sm:w-auto"
                onClick={() => navigate('/user-profile')}
                type="button"
              >
                Profile View
              </button>
              <button
                className="w-full rounded-full bg-linear-to-r from-orange-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:w-auto"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>

          {statusMessage ? <p className="mt-4 text-sm font-medium text-emerald-300">{statusMessage}</p> : null}
          {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-300">{errorMessage}</p> : null}
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Your Profile</p>
                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Skills drive your project matches</h2>
              </div>
              <div className="self-start rounded-2xl bg-emerald-400/10 px-4 py-3 text-left sm:text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Current matchable skills</p>
                <p className="mt-1 text-2xl font-bold text-emerald-100">{profile?.Skills?.length || 0}</p>
              </div>
            </div>

            <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={handleProfileSubmit}>
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring"
                placeholder="Institution"
                value={profileForm.Institution}
                onChange={(event) => setProfileForm((current) => ({ ...current, Institution: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring"
                placeholder="Github link"
                value={profileForm.Github}
                onChange={(event) => setProfileForm((current) => ({ ...current, Github: event.target.value }))}
              />
              <textarea
                className="min-h-28 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring md:col-span-2"
                placeholder="Short bio"
                value={profileForm.Bio}
                onChange={(event) => setProfileForm((current) => ({ ...current, Bio: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring"
                placeholder="Roles: frontend developer, ui designer"
                value={profileForm.Role}
                onChange={(event) => setProfileForm((current) => ({ ...current, Role: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring"
                placeholder="LinkedIn link"
                value={profileForm.LinkedIn}
                onChange={(event) => setProfileForm((current) => ({ ...current, LinkedIn: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring md:col-span-2"
                placeholder="Skills: react, node, mongodb"
                value={profileForm.Skills}
                onChange={(event) => setProfileForm((current) => ({ ...current, Skills: event.target.value }))}
              />
              <button
                className="rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:-translate-y-0.5 md:col-span-2"
                type="submit"
              >
                Save profile and refresh matches
              </button>
            </form>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Notifications</p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Recent activity</h2>
            <div className="mt-5 grid gap-3">
              {notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{notification.type}</p>
                    <p className="mt-2 text-sm text-slate-200">Reference: {notification.referenceId}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Post Project</p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Create a project that can be matched</h2>

            <form className="mt-5 grid gap-3" onSubmit={handleProjectSubmit}>
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-orange-400/40 transition focus:ring"
                placeholder="Project title"
                value={projectForm.title}
                onChange={(event) => setProjectForm((current) => ({ ...current, title: event.target.value }))}
              />
              <textarea
                className="min-h-28 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-orange-400/40 transition focus:ring"
                placeholder="What are you building?"
                value={projectForm.description}
                onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-orange-400/40 transition focus:ring"
                placeholder="Project roles/types: frontend developer, backend developer"
                value={projectForm.type}
                onChange={(event) => setProjectForm((current) => ({ ...current, type: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-orange-400/40 transition focus:ring"
                placeholder="Required skills: react, node, figma"
                value={projectForm.requiredSkills}
                onChange={(event) => setProjectForm((current) => ({ ...current, requiredSkills: event.target.value }))}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-orange-400/40 transition focus:ring"
                placeholder="Technologies: react, express, mongodb"
                value={projectForm.technologies}
                onChange={(event) => setProjectForm((current) => ({ ...current, technologies: event.target.value }))}
              />
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-orange-400/40 transition focus:ring"
                  min="1"
                  placeholder="Team size"
                  type="number"
                  value={projectForm.teamSize}
                  onChange={(event) => setProjectForm((current) => ({ ...current, teamSize: event.target.value }))}
                />
                <label className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-medium text-slate-200">
                  <input
                    checked={projectForm.isurgent}
                    onChange={(event) => setProjectForm((current) => ({ ...current, isurgent: event.target.checked }))}
                    type="checkbox"
                  />
                  Urgent
                </label>
              </div>
              <button
                className="rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-900/30 transition hover:-translate-y-0.5"
                type="submit"
              >
                Publish project
              </button>
            </form>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Project Feed</p>
                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Browse and filter projects</h2>
              </div>

              <form className="grid w-full gap-3 md:grid-cols-3 xl:max-w-3xl" onSubmit={handleFilterSubmit}>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring"
                  placeholder="Filter by skill"
                  value={projectFilters.skill}
                  onChange={(event) => setProjectFilters((current) => ({ ...current, skill: event.target.value }))}
                />
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring"
                  placeholder="Technology"
                  value={projectFilters.technology}
                  onChange={(event) => setProjectFilters((current) => ({ ...current, technology: event.target.value }))}
                />
                <div className="flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none ring-cyan-400/40 transition focus:ring"
                    placeholder="Type"
                    value={projectFilters.type}
                    onChange={(event) => setProjectFilters((current) => ({ ...current, type: event.target.value }))}
                  />
                  <button
                    className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                    type="submit"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-5 grid gap-4">
              {projects.map((project) => {
                const isMine = project.userId?._id === user?._id

                return (
                  <div key={project._id} className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          By {project.userId?.name || 'Unknown'} {project.isurgent ? '• urgent' : ''}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{project.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{project.description}</p>
                      </div>

                      <div className="self-start rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-200">
                        Team size: {project.teamSize}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(project.requiredSkills || []).map((skill) => (
                        <span key={`${project._id}-${skill}`} className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-100">
                          {skill}
                        </span>
                      ))}
                      {(project.technologies || []).map((skill) => (
                        <span key={`${project._id}-${skill}-tech`} className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                          {skill}
                        </span>
                      ))}
                      {(project.type || []).map((type) => (
                        <span key={`${project._id}-${type}-type`} className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!isMine ? (
                        <button
                          className="rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                          onClick={() => handleProjectApply(project._id)}
                          type="button"
                        >
                          Apply to join
                        </button>
                      ) : null}

                      {isMine ? (
                        <>
                          <button
                            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
                            onClick={() => handleLoadApplicants(project._id)}
                            type="button"
                          >
                            View applicants
                          </button>
                          <button
                            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
                            onClick={() => handleLoadCandidateMatches(project._id)}
                            type="button"
                          >
                            View matched users
                          </button>
                        </>
                      ) : null}
                    </div>

                    {applicantsByProject[project._id]?.length ? (
                      <div className="mt-4 grid gap-3">
                        {applicantsByProject[project._id].map((application) => (
                          <div key={application._id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                            <p className="text-sm font-semibold text-white">{application.userId?.name || 'Applicant'}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{application.status}</p>
                            <div className="mt-3 flex gap-2">
                              <button
                                className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white"
                                onClick={() => handleApplicantAction(project._id, application._id, 'accept')}
                                type="button"
                              >
                                Accept
                              </button>
                              <button
                                className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white"
                                onClick={() => handleApplicantAction(project._id, application._id, 'reject')}
                                type="button"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {candidateMatchesByProject[project._id]?.length ? (
                      <div className="mt-4 grid gap-3">
                        {candidateMatchesByProject[project._id].map((candidate) => (
                          <div key={candidate.user._id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">{candidate.user.name}</p>
                                <p className="text-xs text-slate-300">{candidate.user.email}</p>
                              </div>
                              <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                                {candidate.matchPercentage}% match
                              </div>
                            </div>
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                              Matched skills: {(candidate.matchedSkills || []).join(', ') || 'none'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Matched Projects</p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Projects ranked for your skill profile</h2>
            <div className="mt-5 grid gap-4">
              {matches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                  Add your skills and roles to see project matches.
                </div>
              ) : (
                matches.map((project) => (
                  <div key={project._id} className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{project.userId?.name || 'Unknown owner'}</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{project.title}</h3>
                      </div>
                      <div className="self-start rounded-2xl bg-emerald-500/15 px-4 py-3 text-left sm:text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Match</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-100">{project.matchPercentage}%</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                      Matched skills: {(project.matchedSkills || []).join(', ') || 'none'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">My Projects</p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Projects you own</h2>
            <div className="mt-5 grid gap-4">
              {myProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                  You have not posted a project yet.
                </div>
              ) : (
                myProjects.map((project) => (
                  <div key={project._id} className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Owned project</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{project.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                      Required skills: {(project.requiredSkills || []).join(', ') || 'none'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
