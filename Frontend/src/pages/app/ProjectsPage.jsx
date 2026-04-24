import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import {
  acceptApplicant,
  applyToProject,
  deleteProject,
  getApplicants,
  getMatchedUsersForProject,
  getProjects,
  rejectApplicant,
  updateProject,
} from '../../services/authApi'
import { useAuth } from '../../context/useAuth'
import { useApplications } from '../../context/useApplications'

function splitCommaList(value) {
  if (!String(value || '').trim()) return []
  return String(value).split(',').map((item) => item.trim()).filter(Boolean)
}

function joinCommaList(values) {
  return Array.isArray(values) ? values.join(', ') : ''
}

export default function ProjectsPage() {
  const { token, user } = useAuth()
  const {
    isProjectApplied,
    markProjectApplied,
    markApplicationDecision,
  } = useApplications()
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({ skill: '', technology: '', type: '' })
  const [applicantsByProject, setApplicantsByProject] = useState({})
  const [matchesByProject, setMatchesByProject] = useState({})
  const [busyProjectIds, setBusyProjectIds] = useState([])
  const [processingApplicationIds, setProcessingApplicationIds] = useState([])
  const [deletingProjectIds, setDeletingProjectIds] = useState([])
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [savingProjectId, setSavingProjectId] = useState(null)
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
        toast.error(err?.message || 'Unable to load projects.')
      }
    }

    initialLoad()
  }, [token])

  async function handleFilterSubmit(event) {
    event.preventDefault()
    try {
      await loadProjects(filters)
    } catch (err) {
      toast.error(err?.message || 'Unable to apply filters.')
    }
  }

  async function handleApply(projectId) {
    setBusyProjectIds((current) => [...new Set([...current, projectId])])
    try {
      const response = await applyToProject(projectId, token)
      markProjectApplied(projectId)
      toast.success(response?.message || 'Application sent successfully.')
    } catch (err) {
      const isAlreadyApplied = String(err.message || '').toLowerCase().includes('already applied')
      if (isAlreadyApplied) {
        markProjectApplied(projectId)
        toast.info('You already applied to this project.')
      } else {
        toast.error(err?.message || 'Unable to apply right now.')
      }
    } finally {
      setBusyProjectIds((current) => current.filter((id) => id !== projectId))
    }
  }

  async function handleLoadApplicants(projectId) {
    try {
      const response = await getApplicants(projectId, token)
      setApplicantsByProject((current) => ({
        ...current,
        [projectId]: Array.isArray(response) ? response : response.data || [],
      }))
    } catch (err) {
      toast.error(err?.message || 'Unable to load applicants.')
    }
  }

  async function handleDecision(projectId, applicationId, action) {
    setProcessingApplicationIds((current) => [...new Set([...current, applicationId])])
    try {
      if (action === 'accept') await acceptApplicant(applicationId, token)
      else await rejectApplicant(applicationId, token)
      toast.success(`Application ${action}ed successfully.`)
      await handleLoadApplicants(projectId)
      markApplicationDecision({ action, projectId, applicationId })
    } catch (err) {
      toast.error(err?.message || `Unable to ${action} application.`)
    } finally {
      setProcessingApplicationIds((current) => current.filter((id) => id !== applicationId))
    }
  }

  async function handleLoadMatches(projectId) {
    try {
      const response = await getMatchedUsersForProject(projectId, token)
      setMatchesByProject((current) => ({
        ...current,
        [projectId]: response.data || [],
      }))
    } catch (err) {
      toast.error(err?.message || 'Unable to load matches.')
    }
  }

  function handleStartEdit(project) {
    setEditingProjectId(project._id)
    setProjectForm({
      title: project.title || '',
      type: joinCommaList(project.type),
      description: project.description || '',
      requiredSkills: joinCommaList(project.requiredSkills),
      technologies: joinCommaList(project.technologies),
      teamSize: project.teamSize || 1,
      isurgent: Boolean(project.isurgent),
    })
  }

  function handleCancelEdit() {
    setEditingProjectId(null)
    setSavingProjectId(null)
  }

  async function handleUpdateProject(projectId) {
    setSavingProjectId(projectId)
    try {
      const response = await updateProject(projectId, {
        title: projectForm.title,
        type: splitCommaList(projectForm.type),
        description: projectForm.description,
        requiredSkills: splitCommaList(projectForm.requiredSkills),
        technologies: splitCommaList(projectForm.technologies),
        teamSize: Number(projectForm.teamSize) || 1,
        isurgent: projectForm.isurgent,
      }, token)
      toast.success(response?.message || 'Project updated successfully.')
      await loadProjects(filters)
      setEditingProjectId(null)
    } catch (err) {
      toast.error(err?.message || 'Unable to update project.')
    } finally {
      setSavingProjectId(null)
    }
  }

  async function handleDeleteProject(projectId) {
    const shouldDelete = window.confirm('Delete this project? This action cannot be undone.')
    if (!shouldDelete) return

    setDeletingProjectIds((current) => [...new Set([...current, projectId])])
    try {
      const response = await deleteProject(projectId, token)
      toast.success(response?.message || 'Project deleted successfully.')
      setProjects((current) => current.filter((project) => project._id !== projectId))
      setApplicantsByProject((current) => {
        const next = { ...current }
        delete next[projectId]
        return next
      })
      setMatchesByProject((current) => {
        const next = { ...current }
        delete next[projectId]
        return next
      })
      if (editingProjectId === projectId) {
        setEditingProjectId(null)
      }
    } catch (err) {
      toast.error(err?.message || 'Unable to delete project.')
    } finally {
      setDeletingProjectIds((current) => current.filter((id) => id !== projectId))
    }
  }

  return (
    <section>
      <div className="cb-feed-head">
        <div>
          <h2 className="cb-title">Project Feed</h2>
          <p className="cb-sub">{projects.length} projects open for collaboration</p>
        </div>
        <form className="cb-grid" onSubmit={handleFilterSubmit}>
          <input className="cb-search" placeholder="🔍  Search by title, skill, or university..." value={filters.skill} onChange={(e) => setFilters((c) => ({ ...c, skill: e.target.value }))} />
        </form>
      </div>

      <div className="cb-chip-row">
        <button className="cb-chip active" onClick={handleFilterSubmit} type="button">All Projects</button>
        <button className="cb-chip" onClick={() => setFilters((c) => ({ ...c, type: 'Final Year' }))} type="button">Final Year</button>
        <button className="cb-chip" onClick={() => setFilters((c) => ({ ...c, type: 'Hackathon' }))} type="button">Hackathon</button>
        <button className="cb-chip" onClick={() => setFilters((c) => ({ ...c, type: 'Research' }))} type="button">Research</button>
        <button className="cb-chip" onClick={() => setFilters((c) => ({ ...c, type: 'Startup' }))} type="button">Startup</button>
      </div>
      <div className="cb-grid three">
        {projects.length === 0 ? <div className="cb-card">No projects found for selected filters.</div> : projects.map((project) => {
          const isMine = project.userId?._id === user?._id
          return (
            <article key={project._id} className="cb-card">
              <div className="cb-card-kicker">
                <span>{(project.type || [])[0] || 'Project'}</span>
                <span style={{ color: project.isurgent ? '#ef4f31' : '#808080' }}>{project.isurgent ? '● Urgent' : 'Open'}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <div className="cb-tags">
                {(project.requiredSkills || []).slice(0, 5).map((skill) => <span key={`${project._id}-${skill}`} className="cb-tag">{skill}</span>)}
                {(project.technologies || []).slice(0, 4).map((item) => <span key={`${project._id}-${item}`} className="cb-tag">{item}</span>)}
              </div>

              <div className="cb-card-foot">
                <span>{project.userId?.name || 'Campus Builder'}</span>
                <span className="cb-green">● {project.teamSize || 1} spots left</span>
              </div>

              {isMine ? (
                <div className="cb-maker-actions" style={{ marginTop: '0.5rem' }}>
                  <button className="cb-mini-btn" onClick={() => handleStartEdit(project)} type="button">Edit</button>
                  <button
                    className="cb-mini-btn"
                    disabled={deletingProjectIds.includes(project._id)}
                    onClick={() => handleDeleteProject(project._id)}
                    type="button"
                  >
                    {deletingProjectIds.includes(project._id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ) : null}

              {editingProjectId === project._id ? (
                <div className="cb-post-form" style={{ marginTop: '0.7rem', padding: '0.9rem' }}>
                  <div className="field-grid two">
                    <div className="field-group">
                      <label className="cb-form-label" htmlFor={`title-${project._id}`}>Title</label>
                      <input id={`title-${project._id}`} className="cb-form-input" value={projectForm.title} onChange={(e) => setProjectForm((c) => ({ ...c, title: e.target.value }))} />
                    </div>
                    <div className="field-group">
                      <label className="cb-form-label" htmlFor={`type-${project._id}`}>Type</label>
                      <input id={`type-${project._id}`} className="cb-form-input" value={projectForm.type} onChange={(e) => setProjectForm((c) => ({ ...c, type: e.target.value }))} />
                    </div>
                  </div>
                  <div className="field-group" style={{ marginTop: '0.6rem' }}>
                    <label className="cb-form-label" htmlFor={`desc-${project._id}`}>Description</label>
                    <textarea id={`desc-${project._id}`} className="cb-form-input cb-form-textarea" value={projectForm.description} onChange={(e) => setProjectForm((c) => ({ ...c, description: e.target.value }))} />
                  </div>
                  <div className="field-grid two" style={{ marginTop: '0.6rem' }}>
                    <div className="field-group">
                      <label className="cb-form-label" htmlFor={`skills-${project._id}`}>Required skills</label>
                      <input id={`skills-${project._id}`} className="cb-form-input" value={projectForm.requiredSkills} onChange={(e) => setProjectForm((c) => ({ ...c, requiredSkills: e.target.value }))} />
                    </div>
                    <div className="field-group">
                      <label className="cb-form-label" htmlFor={`tech-${project._id}`}>Technologies</label>
                      <input id={`tech-${project._id}`} className="cb-form-input" value={projectForm.technologies} onChange={(e) => setProjectForm((c) => ({ ...c, technologies: e.target.value }))} />
                    </div>
                  </div>
                  <div className="field-grid two" style={{ marginTop: '0.6rem' }}>
                    <div className="field-group">
                      <label className="cb-form-label" htmlFor={`size-${project._id}`}>Team size</label>
                      <input id={`size-${project._id}`} className="cb-form-input" min="1" type="number" value={projectForm.teamSize} onChange={(e) => setProjectForm((c) => ({ ...c, teamSize: e.target.value }))} />
                    </div>
                    <label className="cb-form-check" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '1.6rem' }}>
                      <input checked={projectForm.isurgent} onChange={(e) => setProjectForm((c) => ({ ...c, isurgent: e.target.checked }))} type="checkbox" />
                      Mark as urgent
                    </label>
                  </div>
                  <div className="cb-maker-actions" style={{ marginTop: '0.65rem' }}>
                    <button className="cb-mini-btn primary" disabled={savingProjectId === project._id} onClick={() => handleUpdateProject(project._id)} type="button">
                      {savingProjectId === project._id ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="cb-mini-btn" onClick={handleCancelEdit} type="button">Cancel</button>
                  </div>
                </div>
              ) : null}

              {isProjectApplied(project._id) ? (
                <div className="cb-chip-row" style={{ marginTop: '0.6rem' }}>
                  <span className="cb-chip active">Applied</span>
                </div>
              ) : null}

              {!isMine ? (
                <div className="cb-maker-actions">
                  <button
                    className="cb-mini-btn primary"
                    disabled={busyProjectIds.includes(project._id) || isProjectApplied(project._id)}
                    onClick={() => handleApply(project._id)}
                    type="button"
                  >
                    {isProjectApplied(project._id) ? '✓ Applied' : busyProjectIds.includes(project._id) ? 'Applying...' : '+ Apply'}
                  </button>
                  <button className="cb-mini-btn" type="button">Message</button>
                </div>
              ) : (
                <div className="cb-maker-actions">
                  <button className="cb-mini-btn" onClick={() => handleLoadApplicants(project._id)} type="button">Applicants</button>
                  <button className="cb-mini-btn" onClick={() => handleLoadMatches(project._id)} type="button">Matches</button>
                </div>
              )}

              {applicantsByProject[project._id]?.length ? (
                <div className="cb-grid" style={{ marginTop: '0.55rem' }}>
                  {applicantsByProject[project._id].slice(0, 2).map((application) => (
                    <div key={application._id} className="cb-application">
                      <strong>{application.userId?.name || 'Applicant'}</strong>
                      <p className="cb-sub" style={{ marginTop: '0.2rem' }}>{application.status}</p>
                      <div className="cb-maker-actions" style={{ marginTop: '0.45rem' }}>
                        <button
                          className="cb-mini-btn primary"
                          disabled={processingApplicationIds.includes(application._id)}
                          onClick={() => handleDecision(project._id, application._id, 'accept')}
                          type="button"
                        >
                          {processingApplicationIds.includes(application._id) ? 'Working...' : '✓ Accept'}
                        </button>
                        <button
                          className="cb-mini-btn"
                          disabled={processingApplicationIds.includes(application._id)}
                          onClick={() => handleDecision(project._id, application._id, 'reject')}
                          type="button"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {matchesByProject[project._id]?.length ? (
                <div className="cb-grid" style={{ marginTop: '0.55rem' }}>
                  {matchesByProject[project._id].slice(0, 2).map((candidate) => (
                    <div key={candidate.user._id} className="cb-application">
                      <strong>{candidate.user.name}</strong>
                      <p className="cb-sub" style={{ marginTop: '0.2rem' }}>{candidate.user.email}</p>
                      <span className="cb-green">● {candidate.matchPercentage}% match</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      {myProjects.length ? (
        <div className="cb-chip-row" style={{ marginTop: '1rem' }}>
          <span className="cb-chip active">My Projects: {myProjects.length}</span>
        </div>
      ) : null}
    </section>
  )
}
