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
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Matching</p>
      <h2 className="mt-3 text-3xl font-bold text-white">Skill-based recommendations</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">This section demonstrates team formation using skills, roles, and project requirements.</p>
      {loading ? <p className="mt-6 text-sm text-slate-300">Loading matches...</p> : null}
      {error ? <p className="mt-6 text-sm font-medium text-rose-300">{error}</p> : null}
      <div className="mt-6 grid gap-4">
        {matches.length === 0 && !loading ? <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">No matched projects found yet.</div> : null}
        {matches.map((project) => (
          <article key={project._id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{project.userId?.name || 'Unknown owner'}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Match</p>
                <p className="mt-1 text-2xl font-bold text-emerald-100">{project.matchPercentage}%</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Matched skills</p>
                <p className="mt-2 text-sm text-slate-200">{(project.matchedSkills || []).join(', ') || 'None'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Matched roles</p>
                <p className="mt-2 text-sm text-slate-200">{(project.matchedRoles || []).join(', ') || 'None'}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
