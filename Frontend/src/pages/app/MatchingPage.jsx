import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { FaEnvelope, FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { applyToProject, getMatchedProjects } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'
import { useApplications } from '../../context/useApplications'

function normalizeUrl(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function IconLink({ href, label, children }) {
  if (!href) return null

  return (
    <a className="cb-icon-link" href={href} aria-label={label} title={label} rel="noreferrer" target={href.startsWith('mailto:') ? undefined : '_blank'}>
      {children}
    </a>
  )
}

export default function MatchingPage() {
  const { token } = useAuth()
  const { isProjectApplied, markProjectApplied } = useApplications()
  const [matches, setMatches] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [connectingProjectIds, setConnectingProjectIds] = useState([])

  useEffect(() => {
    async function loadMatches() {
      setLoading(true)
      setError('')
      try {
        const response = await getMatchedProjects(token)
        setMatches(response.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [token])

  const makerMatches = useMemo(() => {
    const byMaker = new Map()

    matches.forEach((maker) => {
      const makerUserId = maker.userId?._id || maker._id
      const existing = byMaker.get(makerUserId)

      if (!existing || (maker.matchScore || 0) > (existing.matchScore || 0)) {
        byMaker.set(makerUserId, maker)
      }
    })

    return Array.from(byMaker.values())
  }, [matches])

  const visibleMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return makerMatches

    return makerMatches.filter((maker) => {
      const profile = maker.ownerProfile || {}
      const searchableText = [
        maker.title,
        maker.userId?.name,
        maker.userId?.email,
        profile.Institution,
        profile.Bio,
        ...(profile.Role || []),
        ...(profile.Skills || []),
        ...(maker.matchedSkills || []),
      ].filter(Boolean).join(' ').toLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [makerMatches, query])

  async function handleConnect(projectId) {
    if (!projectId || isProjectApplied(projectId)) return

    setConnectingProjectIds((current) => [...new Set([...current, projectId])])
    try {
      await applyToProject(projectId, token)
      markProjectApplied(projectId)
      toast.success('Request sent. Messaging unlocks after the project owner accepts.')
    } catch (err) {
      const isAlreadyApplied = String(err?.message || '').toLowerCase().includes('already applied')
      if (isAlreadyApplied) {
        markProjectApplied(projectId)
        toast.info('Request already sent. Wait for the owner to accept.')
      } else {
        toast.error(err?.message || 'Unable to send request to this maker.')
      }
    } finally {
      setConnectingProjectIds((current) => current.filter((id) => id !== projectId))
    }
  }

  return (
    <section>
      <div className="cb-feed-head">
        <div>
          <h2 className="cb-title">Makers Directory</h2>
          <p className="cb-sub">{visibleMatches.length} makers matched to your skills</p>
        </div>
        <input
          className="cb-search"
          placeholder="Search by name, skill, university..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="cb-chip-row">
        <span className="cb-chip active">All</span>
        <span className="cb-chip">Developer</span>
        <span className="cb-chip">ML / Data</span>
        <span className="cb-chip">Design</span>
        <span className="cb-chip">Product</span>
      </div>

      {loading ? <p className="cb-sub">Loading makers...</p> : null}
      {error ? <p className="cb-sub" style={{ color: '#d64c58' }}>{error}</p> : null}

      <div className="cb-grid three">
        {!loading && visibleMatches.length === 0 ? (
          <article className="cb-card">No matches found yet. Complete your profile skills and check again.</article>
        ) : null}

        {visibleMatches.map((maker) => {
          const profile = maker.ownerProfile || {}
          const isRequested = isProjectApplied(maker._id)
          const isConnecting = connectingProjectIds.includes(maker._id)
          const githubHref = normalizeUrl(profile.Github)
          const linkedInHref = normalizeUrl(profile.LinkedIn)
          const roles = profile.Role?.length ? profile.Role.join(', ') : 'Maker'
          const skills = profile.Skills?.length ? profile.Skills : maker.matchedSkills || []

          return (
            <article key={maker._id} className="cb-card">
              <div className="cb-maker-top">
                <div className="cb-profile-user">
                  <div className="cb-avatar">{(maker.userId?.name || 'MK').split(' ').slice(0, 2).map((value) => value[0]).join('')}</div>
                  <div>
                    <h3>{maker.userId?.name || 'Maker'}</h3>
                    <p>{roles}</p>
                    <p>{profile.Institution || maker.userId?.email || 'University'}</p>
                  </div>
                </div>
                <span className="cb-green">{maker.matchPercentage || 0}%</span>
              </div>

              <p>{profile.Bio || `Matched through ${maker.title}.`}</p>

              <div className="cb-inline-links">
                <IconLink href={maker.userId?.email ? `mailto:${maker.userId.email}` : ''} label="Email maker">
                  <FaEnvelope />
                </IconLink>
                <IconLink href={githubHref} label="Maker GitHub">
                  <FaGithub />
                </IconLink>
                <IconLink href={linkedInHref} label="Maker LinkedIn">
                  <FaLinkedinIn />
                </IconLink>
              </div>

              <div className="cb-tags">
                {skills.slice(0, 5).map((tag) => <span key={`${maker._id}-${tag}`} className="cb-tag">{tag}</span>)}
              </div>

              <div className="cb-card-foot">
                <span>Matched via {maker.title}</span>
                <span className="cb-green">{isRequested ? 'Request sent' : 'Available'}</span>
              </div>

              <div className="cb-maker-actions single">
                <button className="cb-mini-btn primary" disabled={isRequested || isConnecting} onClick={() => handleConnect(maker._id)} type="button">
                  {isRequested ? 'Request Sent' : isConnecting ? 'Sending...' : 'Connect'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
