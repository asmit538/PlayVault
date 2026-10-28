import { useParams, Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import TeamLogo from '../components/common/TeamLogo'
import './MatchDetailPage.css'

export default function MatchDetailPage() {
  const { matchId } = useParams()
  const { matches, teams, venues, openModal } = useSports()

  const match = matches.find((m) => m.id === matchId)

  if (!match) {
    return (
      <div className="md-page">
        <div className="md-inner md-not-found">
          <h2>Fixture Not Found</h2>
          <p>No varsity match record found for identifier &ldquo;{matchId}&rdquo;.</p>
          <Link to="/matches" className="pv-btn pv-btn-primary">
            ← Return to Match Center
          </Link>
        </div>
      </div>
    )
  }

  const teamA = teams.find((t) => t.id === match.teamAId)
  const teamB = teams.find((t) => t.id === match.teamBId)
  const venue = venues.find((v) => v.id === match.venueId)

  const isCompleted = match.status === 'completed'
  const isLive = match.status === 'live'

  return (
    <div className="md-page">
      <div className="md-inner">
        {/* Navigation */}
        <div className="md-nav">
          <Link to="/matches" className="md-back-link">
            ← Back to Fixture Center
          </Link>
          <div className="md-nav-actions">
            {(!isCompleted || isLive) && (
              <button
                className="pv-btn pv-btn-gold"
                onClick={() => openModal('recordResult', { match })}
              >
                📊 {isLive ? 'Update Live Score' : 'Record Official Result'}
              </button>
            )}
            <Link to="/leaderboard" className="pv-btn pv-btn-ghost">
              League Standings →
            </Link>
          </div>
        </div>

        {/* Big Scoreboard Banner */}
        <div className="md-scoreboard-card">
          <div className="md-scoreboard-header">
            <div className="md-scoreboard-tag">
              {match.sport.toUpperCase()} • {match.tag || 'Official NCAA Conference Fixture'}
            </div>
            <div className="md-scoreboard-status">
              {isLive ? (
                <span className="badge badge-danger">● LIVE NOW ({match.period})</span>
              ) : isCompleted ? (
                <span className="badge badge-success">FINAL RESULT VERIFIED</span>
              ) : (
                <span className="badge badge-gold">UPCOMING FIXTURE</span>
              )}
            </div>
          </div>

          <div className="md-scoreboard-main">
            {/* Team A */}
            <div className="md-team-panel">
              <Link to={`/teams/${teamA?.id}`} style={{ textDecoration: 'none' }}>
                <TeamLogo team={teamA} size="xl" showGlow />
              </Link>
              <h2 className="md-team-name">{teamA?.name || 'Home Team'}</h2>
              <span className="md-team-record">{teamA?.record} ({teamA?.division})</span>
              <span className="md-team-seed">{teamA?.seed} SEED</span>
            </div>

            {/* Score Display */}
            <div className="md-score-center">
              {isCompleted || isLive ? (
                <div className="md-score-digits">
                  <span>{match.scoreA !== null ? match.scoreA : '-'}</span>
                  <span className="md-score-sep">:</span>
                  <span>{match.scoreB !== null ? match.scoreB : '-'}</span>
                </div>
              ) : (
                <div className="md-vs-box">
                  <span className="md-vs-text">VS</span>
                  <span className="md-vs-time">{match.time}</span>
                </div>
              )}

              {match.sportScoreSummary && (
                <div className="md-summary-text">{match.sportScoreSummary}</div>
              )}

              <div className="md-time-venue-bar">
                <span>📅 {match.date}</span>
                <span>• 🕐 {match.time}</span>
                <span>• 🏟️ {venue?.name}</span>
              </div>
            </div>

            {/* Team B */}
            <div className="md-team-panel md-team-panel--right">
              <Link to={`/teams/${teamB?.id}`} style={{ textDecoration: 'none' }}>
                <TeamLogo team={teamB} size="xl" showGlow />
              </Link>
              <h2 className="md-team-name">{teamB?.name || 'Away Team'}</h2>
              <span className="md-team-record">{teamB?.record} ({teamB?.division})</span>
              <span className="md-team-seed">{teamB?.seed} SEED</span>
            </div>
          </div>

          {/* Basketball Quarter Breakdown if available */}
          {match.scores?.teamAQuarters && (
            <div className="md-quarter-table-wrap">
              <table className="md-quarter-table">
                <thead>
                  <tr>
                    <th>Squad</th>
                    <th>Q1</th>
                    <th>Q2</th>
                    <th>Q3</th>
                    <th>Q4</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{teamA?.name}</strong></td>
                    {match.scores.teamAQuarters.map((q, i) => (
                      <td key={i}>{q}</td>
                    ))}
                    <td><strong>{match.scoreA}</strong></td>
                  </tr>
                  <tr>
                    <td><strong>{teamB?.name}</strong></td>
                    {match.scores.teamBQuarters.map((q, i) => (
                      <td key={i}>{q}</td>
                    ))}
                    <td><strong>{match.scoreB}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Split Grid: Match Timeline & Venue Information */}
        <div className="md-split-grid">
          {/* Match Events Timeline */}
          <div className="md-panel-card">
            <div className="md-panel-header">
              <h3>Match Events & Scoring Telemetry</h3>
              <span className="badge badge-info">OFFICIAL LOG</span>
            </div>

            <div className="md-events-list">
              {(!match.events || match.events.length === 0) ? (
                <div className="md-empty-events">
                  <p>No scoring incidents logged for this match.</p>
                  {(!isCompleted || isLive) && (
                    <button
                      className="pv-btn pv-btn-ghost"
                      onClick={() => openModal('recordResult', { match })}
                    >
                      Log Score Event
                    </button>
                  )}
                </div>
              ) : (
                match.events.map((ev, i) => (
                  <div key={i} className="md-event-item">
                    <span className="md-event-time">{ev.time}</span>
                    <span className="md-event-icon">
                      {ev.type === 'score' ? '⚽' : ev.type === 'foul' ? '⚠️' : '⏱'}
                    </span>
                    <div className="md-event-desc">
                      <span>{ev.description}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Venue & Operations Details */}
          <div className="md-panel-card">
            <div className="md-panel-header">
              <h3>Facility & Regulatory Accreditation</h3>
              <span className="badge badge-success">COMPLIANT</span>
            </div>

            <div className="md-venue-info-box">
              <div className="md-venue-top">
                <span className="md-venue-icon">🏟️</span>
                <div>
                  <h4>{venue?.name}</h4>
                  <p>{venue?.location}</p>
                </div>
              </div>

              <div className="md-venue-specs">
                <div>
                  <strong>Capacity:</strong> {venue?.capacity?.toLocaleString()} seats
                </div>
                <div>
                  <strong>Surface Spec:</strong> {venue?.facilities?.[0] || 'Standard Regulation'}
                </div>
                <div>
                  <strong>Referees:</strong> {match.referees?.join(', ') || 'NCAA Certified Timekeepers'}
                </div>
                <div>
                  <strong>Match Notes:</strong> {match.notes || 'Audited collegiate regulation competition.'}
                </div>
              </div>

              <div className="md-venue-footer">
                <Link to="/venues" className="pv-btn pv-btn-ghost" style={{ width: '100%', textAlign: 'center' }}>
                  View Venue Schedule & Availability →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
