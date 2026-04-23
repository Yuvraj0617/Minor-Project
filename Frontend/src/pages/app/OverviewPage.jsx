import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/app/profile', label: 'Complete Profile' },
  { to: '/app/post-project', label: 'Post Project' },
  { to: '/app/projects', label: 'Browse Projects' },
  { to: '/app/matching', label: 'See Matches' },
]

export default function OverviewPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Overview</p>
        <h2 className="mt-3 text-3xl font-bold text-white">Frontend aligned with your synopsis</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          This workspace is organized section-wise so your project presentation feels clean and intentional. Each section maps to a
          core synopsis feature: profile, project posting, matching, notifications, and collaboration.
        </p>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {[
            ['Portfolio-first profile', 'Users showcase institution, roles, skills, and links to support transparent collaboration.'],
            ['Skill-based team formation', 'Project recommendations are ranked using profile skills, technologies, and role alignment.'],
            ['Structured workflow', 'The platform follows profile -> discover -> apply -> accept/reject -> collaborate.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">MVP Flow</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Simple working journey</h3>
          <div className="mt-5 grid gap-3">
            {[
              'Create a profile with institution, role, and skills.',
              'Post a project with required skills and technologies.',
              'Browse projects or check matched opportunities.',
              'Apply to a project and wait for acceptance or rejection.',
              'Use notifications and chat setup to continue collaboration.',
            ].map((step) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                {step}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Quick Access</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Jump to a section</h3>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                className="rounded-2xl bg-linear-to-r from-white/8 to-white/4 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/12"
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
