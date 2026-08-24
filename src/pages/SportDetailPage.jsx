import { Link, useParams } from 'react-router-dom'
import { sportsRules } from '../data/rulebookData'
import './SportDetailPage.css'

function SportDetailPage() {
  const { sportId } = useParams()

  const sportEntry = sportsRules.find((entry) => entry.id === sportId)

  if (!sportEntry) {
    return (
      <div className="sport-detail-page">
        <h1>Sport Not Found</h1>
        <p>No rulebook entry found for "{sportId}".</p>
        <Link to="/rulebook" className="back-btn">← Back to Rulebook</Link>
      </div>
    )
  }

  return (
    <div className="sport-detail-page">
      <Link to="/rulebook" className="back-link">
        ← Back to All Sports
      </Link>

      <div className="sport-detail-header">
        <h1>{sportEntry.sport} Rules</h1>
        <p>Official rules and guidelines for {sportEntry.sport}.</p>
      </div>

      <div className="rules-card">
        <h3>Rules List</h3>
        <ol className="rules-list">
          {sportEntry.rules.map((rule, index) => (
            <li key={index} className="rule-item">
              {rule}
            </li>
          ))}
        </ol>
      </div>

      <Link to="/rulebook" className="back-btn">
        ← Back to Rulebook
      </Link>
    </div>
  )
}

export default SportDetailPage
