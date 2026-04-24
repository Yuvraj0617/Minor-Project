import { useEffect, useState } from 'react'
import { getMatchedProjects } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'

export default function MatchingPage() {
  const { token } = useAuth()
  const [matches, setMatches] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
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

  return (
    <section>
      <div className="cb-feed-head">
        <div>
          <h2 className="cb-title">Makers Directory</h2>
          <p className="cb-sub">{matches.length} matched opportunities from backend</p>
        </div>
        <input className="cb-search" placeholder="🔍  Search by name, skill, university..." />
      </div>

      <div className="cb-chip-row">
        <span className="cb-chip active">All</span>
        <span className="cb-chip">💻 Developer</span>
        <span className="cb-chip">🤖 ML / Data</span>
        <span className="cb-chip">🎨 Design</span>
        <span className="cb-chip">📋 Product</span>
      </div>

      {loading ? <p className="cb-sub">Loading makers...</p> : null}
      {error ? <p className="cb-sub" style={{ color: '#d64c58' }}>{error}</p> : null}

      <div className="cb-grid three">
        {!loading && matches.length === 0 ? (
          <article className="cb-card">No matches found yet. Complete your profile skills and check again.</article>
        ) : null}

        {matches.map((maker) => (
          <article key={maker._id} className="cb-card">
            <div className="cb-maker-top">
              <div className="cb-profile-user">
                <div className="cb-avatar">{(maker.userId?.name || maker.title || 'MK').split(' ').slice(0, 2).map((v) => v[0]).join('')}</div>
                <div>
                  <h3>{maker.userId?.name || maker.title}</h3>
                  <p>{maker.userId?.email || 'University'}</p>
                </div>
              </div>
              <span className="cb-green">★ {maker.matchPercentage || 0}%</span>
            </div>

            <div className="cb-tags">
              {(maker.matchedSkills || []).slice(0, 5).map((tag) => <span key={`${maker._id}-${tag}`} className="cb-tag">{tag}</span>)}
            </div>

            <div className="cb-card-foot">
              <span>{maker.teamSize || 1} spots</span>
              <span className="cb-green">✓ Available</span>
            </div>

            <div className="cb-maker-actions">
              <button className="cb-mini-btn primary" type="button">+ Connect</button>
              <button className="cb-mini-btn" type="button">💬 Message</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
