import { useEffect, useMemo, useState } from 'react'
import {
  acceptApplicant,
  applyToProject,
  getApplicants,
  getMatchedUsersForProject,
  getProjects,
  rejectApplicant,
} from '../../services/authApi'
import { useAuth } from '../../context/useAuth'

export default function ProjectsPage() {
  const { token, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({ skill: '', technology: '', type: '' })
  const [applicantsByProject, setApplicantsByProject] = useState({})
  const [matchesByProject, setMatchesByProject] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const myProjects = useMemo(
    () => projects.filter((project) => project.userId?._id === user?._id),
    [projects, user?._id],
  )

  async function loadProjects(currentFilters = filters) {
    const response = await getProjects(currentFilters, token)
    setProjects(Array.isArray(response) ? response : response.data || [])
  }

  useEffect(() => {
    async function initialLoad() {
      try {
        const response = await getProjects({}, token)
        setProjects(Array.isArray(response) ? response : response.data || [])
      } catch (err) {
        setError(err.message)
      }
    }

    initialLoad()
  }, [])

  async function handleFilterSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await loadProjects(filters)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleApply(projectId) {
    setMessage('')
    setError('')
    try {
      await applyToProject(projectId, token)
      setMessage('Application sent successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleLoadApplicants(projectId) {
    setMessage('')
    setError('')
    try {
      const response = await getApplicants(projectId, token)
      setApplicantsByProject((current) => ({
        ...current,
        [projectId]: Array.isArray(response) ? response : response.data || [],
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDecision(projectId, applicationId, action) {
    setMessage('')
    setError('')
    try {
      if (action === 'accept') await acceptApplicant(applicationId, token)
      else await rejectApplicant(applicationId, token)
      setMessage(`Application ${action}ed successfully.`)
      await handleLoadApplicants(projectId)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleLoadMatches(projectId) {
    setMessage('')
    setError('')
    try {
      const response = await getMatchedUsersForProject(projectId, token)
      setMatchesByProject((current) => ({
        ...current,
        [projectId]: response.data || [],
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Projects</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Project discovery and recruitment</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Browse projects, apply to suitable opportunities, and manage applicants for your own work.</p>
          </div>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={handleFilterSubmit}>
            <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring" placeholder="Skill" value={filters.skill} onChange={(e) => setFilters((c) => ({ ...c, skill: e.target.value }))} />
            <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring" placeholder="Technology" value={filters.technology} onChange={(e) => setFilters((c) => ({ ...c, technology: e.target.value }))} />
            <div className="flex gap-2">
              <input className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring" placeholder="Type" value={filters.type} onChange={(e) => setFilters((c) => ({ ...c, type: e.target.value }))} />
              <button className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white" type="submit">Filter</button>
            </div>
          </form>
        </div>
        {message ? <p className="mt-5 text-sm font-medium text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-5 text-sm font-medium text-rose-300">{error}</p> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Browse</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">All visible projects</h3>
          <div className="mt-5 grid gap-4">
            {projects.map((project) => {
              const isMine = project.userId?._id === user?._id
              return (
                <div key={project._id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">By {project.userId?.name || 'Unknown'} {project.isurgent ? '- urgent' : ''}</p>
                  <h4 className="mt-2 text-xl font-semibold text-white">{project.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(project.requiredSkills || []).map((skill) => <span key={`${project._id}-${skill}`} className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-100">{skill}</span>)}
                    {(project.technologies || []).map((item) => <span key={`${project._id}-${item}-tech`} className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100">{item}</span>)}
                  </div>
                  {!isMine ? <button className="mt-4 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => handleApply(project._id)} type="button">Apply to join</button> : null}
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Owned Projects</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Manage your recruitment</h3>
          <div className="mt-5 grid gap-4">
            {myProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">You have not posted a project yet.</div>
            ) : myProjects.map((project) => (
              <div key={project._id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
                <h4 className="text-xl font-semibold text-white">{project.title}</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white" onClick={() => handleLoadApplicants(project._id)} type="button">Applicants</button>
                  <button className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white" onClick={() => handleLoadMatches(project._id)} type="button">Matched users</button>
                </div>

                {applicantsByProject[project._id]?.length ? (
                  <div className="mt-4 grid gap-3">
                    {applicantsByProject[project._id].map((application) => (
                      <div key={application._id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                        <p className="text-sm font-semibold text-white">{application.userId?.name || 'Applicant'}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{application.status}</p>
                        <div className="mt-3 flex gap-2">
                          <button className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => handleDecision(project._id, application._id, 'accept')} type="button">Accept</button>
                          <button className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => handleDecision(project._id, application._id, 'reject')} type="button">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {matchesByProject[project._id]?.length ? (
                  <div className="mt-4 grid gap-3">
                    {matchesByProject[project._id].map((candidate) => (
                      <div key={candidate.user._id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{candidate.user.name}</p>
                            <p className="text-xs text-slate-300">{candidate.user.email}</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">{candidate.matchPercentage}% match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
