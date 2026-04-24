import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/app/profile', label: 'Complete Profile' },
  { to: '/app/post-project', label: 'Post Project' },
  { to: '/app/projects', label: 'Browse Projects' },
  { to: '/app/matching', label: 'See Matches' },
]

export default function OverviewPage() {
  return (
    <section className="cb-hero">
      <span className="cb-pill">● Now live across 80+ Indian colleges</span>
      <h1 className="cb-hero-title">
        Where Student <span className="cb-accent">Builders</span> Find Their Team
      </h1>
      <p className="cb-hero-copy">
        CraftBridge connects students across universities to collaborate on real projects, from final-year products to startup ideas.
        Find your next co-builder right here.
      </p>

      <div className="cb-hero-actions">
        <Link className="cb-btn-primary" to="/app/projects">Browse Projects →</Link>
        <Link className="cb-btn-secondary" to="/app/profile">Join Free</Link>
      </div>

      <div className="cb-stats">
        {[
          ['1,200+', 'Students'],
          ['340+', 'Projects'],
          ['80+', 'Colleges'],
          ['92%', 'Match Rate'],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="cb-chip-row mt-4">
        {quickLinks.map((item) => (
          <Link key={item.to} className="cb-chip" to={item.to}>{item.label}</Link>
        ))}
      </div>
    </section>
  )
}
