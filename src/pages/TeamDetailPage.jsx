import { useParams, Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import TeamLogo from '../components/common/TeamLogo'
import './TeamDetailPage.css'

export default function TeamDetailPage() {
  const { teamId } = useParams()
  const { teams, players, matches, equipment, openModal } = useSports()

  const team = teams.find((t) => t.id === teamId)

  if (!team) {
    return (
      <div className="td-page">
        <div className="td-inner td-not-found">
          <h2>Collegiate Squad Not Found</h2>
          <p>No team record exists matching identifier &ldquo;{teamId}&rdquo;.</p>
          <Link to="/teams" className="pv-btn pv-btn-primary">
            ← Return to Teams Directory
          </Link>
        </div>
      </div>
    )
  }

  // Associated team players
  const roster = players.filter((p) => p.teamId === team.id)

  // Team matches
  const teamMatches = matches.filter(
    (m) => m.teamAId === team.id || m.teamBId === team.id
  )
  const upcomingMatches = teamMatches.filter((m) => m.status === 'upcoming')
  const completedMatches = teamMatches.filter((m) => m.status === 'completed')

  // Equipment checked out to this team
  const assignedEquipment = equipment.filter((e) =>
    (e.assignments || []).some((a) => a.teamId === team.id)
  )

  return (
    <div className="td-page">
      <div className="td-inner">
        {/* Back Link */}
        <div className="td-nav-bar">
          <Link to="/teams" className="td-back-link">
            ← Back to All Collegiate Teams
          </Link>
          <div className="td-nav-actions">
            <button
              className="pv-btn pv-btn-ghost"
              onClick={() => openModal('joinTeam', { teamId: team.id, sport: team.sport })}
            >
              📝 Walk-on Application
            </button>
            <button
              className="pv-btn pv-btn-primary"
              onClick={() => openModal('addPlayer', { teamId: team.id, sport: team.sport })}
            >
              + Add Athlete
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="td-hero-banner">
          <div className="td-hero-content">
            <div className="td-hero-left">
              <TeamLogo team={team} size="xl" showGlow />

              <div>
                <div className="td-hero-badge-row">
                  <span className="td-seed-tag">{team.seed} SEED</span>
                  <span className="td-sport-tag">{team.sport.toUpperCase()}</span>
                  <span className="td-div-tag">{team.division}</span>
                </div>
                <h1 className="td-hero-name">{team.name}</h1>
                <p className="td-hero-desc">{team.description}</p>
              </div>
            </div>

            <div className="td-hero-record-box">
              <span className="td-hero-record-lbl">SEASON RECORD</span>
              <div className="td-hero-record-num">{team.record}</div>
              <span className="td-hero-record-pct">{team.pct} WIN PCT</span>
              <div className="td-hero-form-bars">
                {(team.wl || [1, 1, 0, 1]).slice(-6).map((w, i) => (
                  <span key={i} className={`td-hero-form-bar ${w === 1 ? 'w' : w === 0 ? 'l' : 'd'}`}>
                    {w === 1 ? 'W' : w === 0 ? 'L' : 'D'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="td-hero-meta-strip">
            <div>
              <strong>Head Coach:</strong> <span>{team.coach}</span>
            </div>
            <div>
              <strong>Team Captain:</strong> <span>{team.captain}</span>
            </div>
            <div>
              <strong>Active Athletes:</strong> <span>{roster.length} registered</span>
            </div>
            <div>
              <strong>Next Event:</strong> <span>{team.matchTime}</span>
            </div>
          </div>
        </div>

        {/* Section: Squad Roster Table */}
        <div className="td-section-card">
          <div className="td-section-header">
            <div>
              <h2>Varsity Squad Roster</h2>
              <p>Active student-athletes with academic eligibility clearance.</p>
            </div>
            <button
              className="pv-btn pv-btn-primary"
              onClick={() => openModal('addPlayer', { teamId: team.id, sport: team.sport })}
            >
              + Register Athlete
            </button>
          </div>

          {roster.length === 0 ? (
            <div className="td-empty-roster">
              <p>No athletes currently rostered on this team.</p>
              <button
                className="pv-btn pv-btn-ghost"
                onClick={() => openModal('addPlayer', { teamId: team.id, sport: team.sport })}
              >
                Add First Athlete
              </button>
            </div>
          ) : (
            <div className="td-table-wrap">
              <table className="td-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Athlete Name</th>
                    <th>Position / Role</th>
                    <th>Academic Class</th>
                    <th>Attendance %</th>
                    <th>Matches Played</th>
                    <th>Eligibility</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((p) => (
                    <tr key={p.id}>
                      <td><span className="mono">#{p.jerseyNumber}</span></td>
                      <td>
                        <Link to={`/players/${p.id}`} className="td-player-link">
                          <span className="td-player-avatar" style={{ background: p.avatarColor || '#1a3c2a' }}>
                            {p.avatar}
                          </span>
                          <strong>{p.name}</strong>
                        </Link>
                      </td>
                      <td>{p.position}</td>
                      <td>{p.year || 'Sophomore'}</td>
                      <td>
                        <span className="td-rate-pill" style={{ color: p.attendanceRate >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {p.attendanceRate}%
                        </span>
                      </td>
                      <td><span className="mono">{p.matchesPlayed || 0}</span></td>
                      <td><span className="badge badge-success">CLEARED</span></td>
                      <td>
                        <Link to={`/players/${p.id}`} className="td-btn-view-profile">
                          Profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Grid: Upcoming Fixtures & Match History */}
        <div className="td-split-grid">
          {/* Upcoming Matches */}
          <div className="td-card-panel">
            <div className="td-panel-header">
              <h3>Upcoming Fixtures</h3>
              <button
                className="td-btn-schedule"
                onClick={() => openModal('scheduleMatch', { sport: team.sport, teamAId: team.id })}
              >
                + Schedule
              </button>
            </div>

            <div className="td-matches-list">
              {upcomingMatches.length === 0 ? (
                <div className="td-empty-msg">No upcoming matches scheduled for {team.name}.</div>
              ) : (
                upcomingMatches.map((m) => (
                  <div key={m.id} className="td-match-item">
                    <div className="td-match-date">
                      <span>{m.date}</span>
                      <small>{m.time}</small>
                    </div>
                    <div className="td-match-details">
                      <strong>{m.tag || 'Varsity Match'}</strong>
                      <span>Official Court Reservation</span>
                    </div>
                    <Link to={`/matches/${m.id}`} className="td-match-link">
                      Fixture Center →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Match History */}
          <div className="td-card-panel">
            <div className="td-panel-header">
              <h3>Match History & Results</h3>
              <span className="td-history-count">{completedMatches.length} Recorded</span>
            </div>

            <div className="td-matches-list">
              {completedMatches.length === 0 ? (
                <div className="td-empty-msg">No completed match results recorded yet.</div>
              ) : (
                completedMatches.map((m) => {
                  const won = m.winnerId === team.id
                  const isDraw = !m.winnerId

                  return (
                    <div key={m.id} className="td-match-item">
                      <span className={`td-result-flag ${won ? 'win' : isDraw ? 'draw' : 'loss'}`}>
                        {won ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'}
                      </span>
                      <div className="td-match-details">
                        <strong>{m.sportScoreSummary || `${m.scoreA} - ${m.scoreB}`}</strong>
                        <span>{m.date} • {m.tag || 'Official Match'}</span>
                      </div>
                      <Link to={`/matches/${m.id}`} className="td-match-link">
                        Scoreboard →
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Assigned Equipment */}
        {assignedEquipment.length > 0 && (
          <div className="td-section-card">
            <div className="td-section-header">
              <div>
                <h2>Allocated Gear & Training Assets</h2>
                <p>Equipment currently issued to {team.name} from athletics inventory.</p>
              </div>
              <Link to="/equipment" className="pv-btn pv-btn-ghost">
                Warehouse Inventory →
              </Link>
            </div>
            <div className="td-eq-grid">
              {assignedEquipment.map((item) => (
                <div key={item.id} className="td-eq-card">
                  <span className="td-eq-icon">🔧</span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>Storage: {item.storageLocation}</span>
                  </div>
                  <span className="badge badge-gold">IN USE</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
