import { Link } from 'react-router-dom'
import { sportsRules } from '../data/rulebookData'
import './RulebookPage.css'

function RulebookPage() {
  return (
    <div className="rulebook-page">
      <div className="rulebook-header-banner">
        <h1>College Sports Rulebook</h1>
        <p>Official rules, regulations, and scoring procedures for college tournament sports.</p>
      </div>

      <div className="rulebook-grid">
        {sportsRules.map((entry) => (
          <Link key={entry.id} to={`/rulebook/${entry.id}`} className="rulebook-card">
            <div className="rulebook-card-top">
              <span className="rulebook-sport-tag">{entry.sport}</span>
              <span className="rule-count-pill">{entry.rules.length} Rules</span>
            </div>
            <div className="rulebook-card-body">
              <h3 className="rulebook-card-title">{entry.sport}</h3>
              <p className="rulebook-card-desc">College sports intramural regulations and guidelines.</p>
            </div>
            <div className="rulebook-card-footer">
              <span className="rulebook-card-hint">View Rules</span>
              <span className="rulebook-arrow">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RulebookPage
