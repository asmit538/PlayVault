import { useParams, Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import './PlayerDetailPage.css'

export default function PlayerDetailPage() {
  const { playerId } = useParams()
  const { players, teams, attendance } = useSports()

  const player = players.find((p) => p.id === playerId)

  if (!player) {
    return (
      <div className="pld-page">
        <div className="pld-inner pld-not-found">
          <h2>Student-Athlete Not Found</h2>
          <p>No athlete record found for identifier &ldquo;{playerId}&rdquo;.</p>
          <Link to="/players" className="pv-btn pv-btn-primary">
            ← Return to Athlete Directory
          </Link>
        </div>
      </div>
    )
  }

  const team = teams.find((t) => t.id === player.teamId)

  // Find attendance sessions where this player is recorded
  const playerSessions = attendance.filter((session) =>
    session.records.some((r) => r.playerId === player.id)
  )

  return (
    <div className="pld-page">
      <div className="pld-inner">
        {/* Navigation Breadcrumb */}
        <div className="pld-nav">
          <Link to="/players" className="pld-back-link">
            ← Back to Athlete Directory
          </Link>
          <span className="badge badge-success">NCAA ACADEMIC CLEARANCE: PASS</span>
        </div>

        {/* Profile Card Header */}
        <div className="pld-header-card">
          <div className="pld-header-left">
            <div
              className="pld-avatar"
              style={{ background: player.avatarColor || '#1a3c2a' }}
            >
              {player.avatar}
            </div>

            <div>
              <div className="pld-badge-row">
                <span className="pld-jersey-tag">#{player.jerseyNumber}</span>
                <span className="pld-sport-tag">{player.sport.toUpperCase()}</span>
                <span className="pld-status-tag">{player.status}</span>
              </div>
              <h1 className="pld-name">{player.name}</h1>
              <p className="pld-meta">
                {player.position} • {player.year || 'Senior'} • {player.email}
              </p>
            </div>
          </div>

          <div className="pld-header-right">
            {team ? (
              <div className="pld-team-box">
                <span className="pld-team-lbl">CURRENT SQUAD</span>
                <Link to={`/teams/${team.id}`} className="pld-team-name">
                  {team.name} →
                </Link>
                <span className="pld-team-coach">Coach: {team.coach}</span>
              </div>
            ) : (
              <span className="pld-free-agent">Free Agent Roster</span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="pld-stats-row">
          <div className="pld-stat-card">
            <span className="pld-stat-label">Attendance Rate</span>
            <div className="pld-stat-num" style={{ color: player.attendanceRate >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {player.attendanceRate}%
            </div>
            <span className="pld-stat-sub">Varsity Practice & Film Sessions</span>
          </div>

          <div className="pld-stat-card">
            <span className="pld-stat-label">Matches Competed</span>
            <div className="pld-stat-num">{player.matchesPlayed || 0}</div>
            <span className="pld-stat-sub">Official Conference Fixtures</span>
          </div>

          <div className="pld-stat-card">
            <span className="pld-stat-label">Academic Division</span>
            <div className="pld-stat-num" style={{ fontSize: '1.4rem', color: 'var(--color-gold)' }}>
              Div I Varsity
            </div>
            <span className="pld-stat-sub">Class: {player.year || 'Senior'}</span>
          </div>

          <div className="pld-stat-card">
            <span className="pld-stat-label">Disciplinary Record</span>
            <div className="pld-stat-num" style={{ fontSize: '1.4rem', color: 'var(--color-success)' }}>
              0 Infractions
            </div>
            <span className="pld-stat-sub">NCAA Compliance Audited</span>
          </div>
        </div>

        {/* Sport Specific Metrics */}
        {(player.ppg || player.goals || player.kills || player.firstServePct || player.runs || player.smashSpeed || player.personalBest) && (
          <div className="pld-section-card">
            <h2>Individual Athletic Metrics</h2>
            <div className="pld-metrics-grid">
              {player.ppg && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.ppg}</span>
                  <span className="pld-metric-lbl">Points Per Game</span>
                </div>
              )}
              {player.rpg && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.rpg}</span>
                  <span className="pld-metric-lbl">Rebounds Per Game</span>
                </div>
              )}
              {player.apg && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.apg}</span>
                  <span className="pld-metric-lbl">Assists Per Game</span>
                </div>
              )}
              {player.goals !== undefined && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.goals}</span>
                  <span className="pld-metric-lbl">Season Goals</span>
                </div>
              )}
              {player.cleanSheets !== undefined && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.cleanSheets}</span>
                  <span className="pld-metric-lbl">Clean Sheets</span>
                </div>
              )}
              {player.kills && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.kills}</span>
                  <span className="pld-metric-lbl">Attack Kills</span>
                </div>
              )}
              {player.runs && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.runs}</span>
                  <span className="pld-metric-lbl">Runs Scored</span>
                </div>
              )}
              {player.wickets && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.wickets}</span>
                  <span className="pld-metric-lbl">Wickets Taken</span>
                </div>
              )}
              {player.smashSpeed && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.smashSpeed}</span>
                  <span className="pld-metric-lbl">Recorded Smash Speed</span>
                </div>
              )}
              {player.personalBest && (
                <div className="pld-metric-item">
                  <span className="pld-metric-val">{player.personalBest}</span>
                  <span className="pld-metric-lbl">Sprint PR</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Timeline */}
        <div className="pld-section-card">
          <h2>Participation & Training Logs</h2>
          <div className="pld-timeline">
            {playerSessions.length === 0 ? (
              <p className="pld-empty-history">
                No individual training session sheets recorded yet for {player.name}.
              </p>
            ) : (
              playerSessions.map((session) => {
                const rec = session.records.find((r) => r.playerId === player.id)
                const isPresent = rec?.status === 'present'

                return (
                  <div key={session.id} className="pld-timeline-item">
                    <span className={`pld-timeline-dot ${isPresent ? 'present' : 'absent'}`} />
                    <div className="pld-timeline-content">
                      <div className="pld-timeline-top">
                        <strong>{session.sessionType}</strong>
                        <span className="pld-timeline-date">{session.date}</span>
                      </div>
                      <p className="pld-timeline-notes">{rec?.notes || 'Logged attendance record'}</p>
                    </div>
                    <span className={`badge ${isPresent ? 'badge-success' : 'badge-danger'}`}>
                      {rec?.status?.toUpperCase()}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
