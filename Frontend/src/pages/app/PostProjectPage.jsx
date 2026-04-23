import { useState } from 'react'
import { createProject } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'

function splitCommaList(value) {
  if (!value.trim()) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export default function PostProjectPage() {
  const { token } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    type: '',
    description: '',
    requiredSkills: '',
    technologies: '',
    teamSize: 1,
    isurgent: false,
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await createProject({
        title: form.title,
        type: splitCommaList(form.type),
        description: form.description,
        requiredSkills: splitCommaList(form.requiredSkills),
        technologies: splitCommaList(form.technologies),
        teamSize: Number(form.teamSize) || 1,
        isurgent: form.isurgent,
      }, token)
      setMessage('Project posted successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Post Project</p>
      <h2 className="mt-3 text-3xl font-bold text-white">Publish a recruitment-ready project</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Create a project with clear skills, roles, and technologies so matching works well.</p>
      {message ? <p className="mt-6 text-sm font-medium text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-6 text-sm font-medium text-rose-300">{error}</p> : null}
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-amber-400/40 focus:ring" placeholder="Project title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
        <textarea className="min-h-32 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-amber-400/40 focus:ring" placeholder="Describe the project idea" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-amber-400/40 focus:ring" placeholder="Roles needed" value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))} />
          <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-amber-400/40 focus:ring" placeholder="Required skills" value={form.requiredSkills} onChange={(e) => setForm((c) => ({ ...c, requiredSkills: e.target.value }))} />
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
          <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-amber-400/40 focus:ring" placeholder="Technologies" value={form.technologies} onChange={(e) => setForm((c) => ({ ...c, technologies: e.target.value }))} />
          <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-amber-400/40 focus:ring" min="1" placeholder="Team size" type="number" value={form.teamSize} onChange={(e) => setForm((c) => ({ ...c, teamSize: e.target.value }))} />
          <label className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
            <input checked={form.isurgent} onChange={(e) => setForm((c) => ({ ...c, isurgent: e.target.checked }))} type="checkbox" />
            Urgent
          </label>
        </div>
        <button className="rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg" type="submit">Post project</button>
      </form>
    </section>
  )
}
