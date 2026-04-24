import { useState } from 'react'
import { toast } from 'react-toastify'
import { createProject } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'

function splitCommaList(value) {
  if (!value.trim()) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export default function PostProjectPage() {
  const { token } = useAuth()
  const initialForm = {
    title: '',
    type: '',
    description: '',
    requiredSkills: '',
    technologies: '',
    teamSize: 1,
    isurgent: false,
  }
  const [form, setForm] = useState(initialForm)

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const response = await createProject({
        title: form.title,
        type: splitCommaList(form.type),
        description: form.description,
        requiredSkills: splitCommaList(form.requiredSkills),
        technologies: splitCommaList(form.technologies),
        teamSize: Number(form.teamSize) || 1,
        isurgent: form.isurgent,
      }, token)
      const backendMessage = response?.message || 'Project posted successfully.'
      toast.success(backendMessage)
      setForm(initialForm)
    } catch (err) {
      toast.error(err?.message || 'Unable to post project. Please try again.')
    }
  }

  return (
    <section>
      <div className="cb-feed-head">
        <div>
          <h2 className="cb-title">Post a Project</h2>
          <p className="cb-sub">Publish a collaboration-ready project for the CraftBridge community</p>
        </div>
      </div>

      <form className="cb-post-form" onSubmit={handleSubmit}>
        <div className="cb-post-header">
          <div>
            <p className="cb-post-kicker">Project Details</p>
            <h3>Make your project easy to read</h3>
          </div>
          <p className="cb-post-note">Fields below are shown with stronger contrast so nothing gets lost in the layout.</p>
        </div>

        <div className="field-grid two" style={{ marginTop: '0.7rem' }}>
          <div className="field-group">
            <label className="cb-form-label" htmlFor="title">Project title</label>
            <input id="title" className="cb-form-input" placeholder="SmartCampus AI Navigator" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="cb-form-label" htmlFor="type">Project type</label>
            <input id="type" className="cb-form-input" placeholder="Final Year, Hackathon" value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))} />
          </div>
        </div>

        <div className="field-group" style={{ marginTop: '0.7rem' }}>
          <label className="cb-form-label" htmlFor="description">Description</label>
          <textarea id="description" className="cb-form-input cb-form-textarea" placeholder="Explain problem, scope, and expected contribution." value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
        </div>

        <div className="field-grid two" style={{ marginTop: '0.7rem' }}>
          <div className="field-group">
            <label className="cb-form-label" htmlFor="skills">Required skills</label>
            <input id="skills" className="cb-form-input" placeholder="React Native, Python, BLE" value={form.requiredSkills} onChange={(e) => setForm((c) => ({ ...c, requiredSkills: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="cb-form-label" htmlFor="tech">Technologies</label>
            <input id="tech" className="cb-form-input" placeholder="TensorFlow, Node.js" value={form.technologies} onChange={(e) => setForm((c) => ({ ...c, technologies: e.target.value }))} />
          </div>
        </div>

        <div className="field-grid two" style={{ marginTop: '0.7rem' }}>
          <div className="field-group">
            <label className="cb-form-label" htmlFor="size">Team size</label>
            <input id="size" className="cb-form-input" min="1" placeholder="3" type="number" value={form.teamSize} onChange={(e) => setForm((c) => ({ ...c, teamSize: e.target.value }))} />
          </div>
          <label className="cb-form-check" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '1.55rem' }}>
            <input checked={form.isurgent} onChange={(e) => setForm((c) => ({ ...c, isurgent: e.target.checked }))} type="checkbox" />
            Mark as urgent hiring
          </label>
        </div>

        <div className="cb-maker-actions" style={{ marginTop: '0.9rem', maxWidth: '420px' }}>
          <button className="cb-mini-btn primary" type="submit">+ Post Project</button>
          <button className="cb-mini-btn" type="button">Save Draft</button>
        </div>
      </form>
    </section>
  )
}
