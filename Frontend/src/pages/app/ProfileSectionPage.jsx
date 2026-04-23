import { useEffect, useState } from 'react'
import { getMyUserInfo, updateUserInfo } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'

function splitCommaList(value) {
  if (!value.trim()) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function joinArray(values) {
  return Array.isArray(values) ? values.join(', ') : ''
}

export default function ProfileSectionPage() {
  const { token, saveProfileInfo } = useAuth()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
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
        const response = await getMyUserInfo(token)
        const profile = response.data || {}
        setForm({
          Institution: profile.Institution || '',
          Bio: profile.Bio || '',
          Role: joinArray(profile.Role),
          Skills: joinArray(profile.Skills),
          Github: profile.Github || '',
          LinkedIn: profile.LinkedIn || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

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
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Profile</p>
      <h2 className="mt-3 text-3xl font-bold text-white">Portfolio-first identity</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
        This section supports your synopsis goal of verified and transparent profiles with skills and roles.
      </p>
      {loading ? <p className="mt-6 text-sm text-slate-300">Loading profile...</p> : null}
      {message ? <p className="mt-6 text-sm font-medium text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-6 text-sm font-medium text-rose-300">{error}</p> : null}

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring" placeholder="Institution" value={form.Institution} onChange={(e) => setForm((c) => ({ ...c, Institution: e.target.value }))} />
        <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring" placeholder="Github URL" value={form.Github} onChange={(e) => setForm((c) => ({ ...c, Github: e.target.value }))} />
        <textarea className="min-h-32 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring md:col-span-2" placeholder="Short bio" value={form.Bio} onChange={(e) => setForm((c) => ({ ...c, Bio: e.target.value }))} />
        <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring" placeholder="Roles: frontend developer, ui designer" value={form.Role} onChange={(e) => setForm((c) => ({ ...c, Role: e.target.value }))} />
        <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring" placeholder="LinkedIn URL" value={form.LinkedIn} onChange={(e) => setForm((c) => ({ ...c, LinkedIn: e.target.value }))} />
        <input className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring md:col-span-2" placeholder="Skills: react, node, mongodb" value={form.Skills} onChange={(e) => setForm((c) => ({ ...c, Skills: e.target.value }))} />
        <button className="rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg md:col-span-2" type="submit">Save profile</button>
      </form>
    </section>
  )
}
