import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="nf-page">
      <div className="nf-card">
        <div className="nf-badge">NCAA REFEREE TIMEOUT · 404 ERROR</div>
        <div className="nf-graphic">⏱️ whistle blown</div>
        <h1 className="nf-title">Out of Bounds!</h1>
        <p className="nf-subtitle">
          The tactical playbook or roster page you requested is not on the active tournament schedule.
        </p>
        <div className="nf-links">
          <Link to="/" className="pv-btn pv-btn-primary">
            ← Return to Dashboard
          </Link>
          <Link to="/teams" className="pv-btn pv-btn-ghost">
            Teams Directory
          </Link>
          <Link to="/matches" className="pv-btn pv-btn-ghost">
            Match Center
          </Link>
          <Link to="/rulebook" className="pv-btn pv-btn-ghost">
            Sports Rulebook
          </Link>
        </div>
      </div>
    </div>
  )
}
