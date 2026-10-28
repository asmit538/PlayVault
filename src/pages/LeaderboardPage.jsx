import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import TeamLogo from '../components/common/TeamLogo'
import './LeaderboardPage.css'

const sportTabs = [
  { label: 'All Sports Combined', id: 'all', icon: '🏆' },
  { label: 'Basketball', id: 'basketball', icon: '🏀' },
  { label: 'Soccer', id: 'soccer', icon: '⚽' },
  { label: 'Volleyball', id: 'volleyball', icon: '🏐' },
  { label: 'Tennis', id: 'tennis', icon: '🎾' },
  { label: 'Cricket', id: 'cricket', icon: '🏏' },
  { label: 'Badminton', id: 'badminton', icon: '🏸' },
  { label: 'Track & Field', id: 'track', icon: '🏃' },
]

export default function LeaderboardPage() {
  const { teams, sports } = useSports()
  const [activeSportId, setActiveSportId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dynamically calculate and sort standings
  const sortedTeams = useMemo(() => {
    const list = activeSportId === 'all' ? teams : teams.filter((t) => t.sport === activeSportId)

    const filtered = searchQuery.trim()
      ? list.filter((t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.coach?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.division?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : list

    return [...filtered].sort((a, b) => {
      const pctA = parseFloat(a.pct) || 0
      const pctB = parseFloat(b.pct) || 0
      if (pctB !== pctA) return pctB - pctA
      return (b.wins || 0) - (a.wins || 0)
    })
  }, [teams, activeSportId, searchQuery])

  // Podium top 3
  const podium = sortedTeams.slice(0, 3)

  // Export CSV handler
  const handleExportCSV = () => {
    const header = 'Rank,Team,Sport,Division,Wins,Losses,Draws,WinPct,Record\n'
    const rows = sortedTeams
      .map(
        (t, i) =>
          `${i + 1},"${t.name}",${t.sport},"${t.division}",${t.wins || 0},${t.losses || 0},${t.draws || 0},${t.pct},"${t.record}"`
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `playvault_standings_${activeSportId}.csv`
    a.click()
  }

  return (
    <div className="lb-page">
      <div className="lb-container">

        {/* ─── HEADER CARD ─── */}
        <div className="lb-header">
          <div className="lb-header-left">
            <div className="lb-header-badge-row">
              <span className="lb-header-badge">
                <span className="badge-dot-gold" />
                NCAA DIVISION I · ATLANTIC COAST CONFERENCE
              </span>
              <span className="lb-sync-badge">✓ REAL-TIME FIXTURE TELEMETRY</span>
            </div>
            <h1 className="lb-title">Official Conference Standings &amp; Analytics</h1>
            <p className="lb-subtitle">
              Live Division I championship table, win rates, tournament qualifications, and head-to-head records audited directly from official match results.
            </p>
          </div>
          <div className="lb-header-right">
            <button className="lb-export-btn" onClick={handleExportCSV}>
              <span>📊 Export Standings (CSV)</span>
            </button>
          </div>
        </div>

        {/* ─── SPORT SELECTOR TABS ─── */}
        <div className="lb-sport-tabs">
          {sportTabs.map((tab) => {
            const count = tab.id === 'all' ? teams.length : teams.filter((t) => t.sport === tab.id).length
            return (
              <button
                key={tab.id}
                className={`lb-sport-tab ${activeSportId === tab.id ? 'active' : ''}`}
                onClick={() => setActiveSportId(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.label}</span>
                <span className="tab-count">{count}</span>
              </button>
            )
          })}
        </div>

        {/* ─── CONTROLS & SEARCH BAR ─── */}
        <div className="lb-controls">
          <div className="lb-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search team name, coach, conference division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="lb-controls-info">
            <span>{sortedTeams.length} SQUADS AUDITED</span>
            <span className="sep">•</span>
            <span className="text-gold">TOP 4 QUALIFY FOR NCAA CHAMPIONSHIP</span>
          </div>
        </div>

        {/* ─── TOP 3 PODIUM HERO ─── */}
        {podium.length > 0 && (
          <div className="lb-podium-row">
            {podium.map((team, idx) => {
              const rank = idx + 1
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
              const rankBanner = rank === 1 ? 'linear-gradient(135deg, #c8972e, #dfb75d)' : rank === 2 ? 'linear-gradient(135deg, #7f8c8d, #95a5a6)' : 'linear-gradient(135deg, #d35400, #e67e22)'
              const badge = rank === 1 ? '1ST PLACE · DIVISION LEADER' : rank === 2 ? '2ND PLACE · RUNNER-UP' : '3RD PLACE · CONTENDER'

              return (
                <div
                  key={team.id}
                  className={`lb-podium-card lb-podium-card--${rank}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="lb-podium-banner" style={{ background: rankBanner }}>
                    <div className="lb-banner-left">
                      <span className="lb-medal">{medal}</span>
                      <span className="lb-rank-num">RANK #{rank}</span>
                    </div>
                    <span className="lb-badge-text">{badge}</span>
                  </div>

                  <div className="lb-podium-body">
                    <div className="lb-podium-team-header">
                      <TeamLogo team={team} size="lg" showGlow={rank === 1} />
                      <div className="lb-podium-identity">
                        <span className="lb-podium-sport-tag">{team.sport?.toUpperCase()}</span>
                        <h3 className="lb-podium-name">{team.name}</h3>
                        <span className="lb-podium-sub">{team.division} · Coach {team.coach}</span>
                      </div>
                    </div>

                    <div className="lb-podium-stats">
                      <div className="lb-stat-cell">
                        <span className="val">{team.record}</span>
                        <span className="lbl">Record (W-L)</span>
                      </div>
                      <div className="lb-stat-cell">
                        <span className="val font-gold">{team.pct}</span>
                        <span className="lbl">Win %</span>
                      </div>
                      <div className="lb-stat-cell">
                        <span className="val">{team.seed}</span>
                        <span className="lbl">Seed</span>
                      </div>
                    </div>

                    {/* Recent Form */}
                    <div className="lb-podium-form">
                      <span className="form-lbl">Recent Form:</span>
                      <div className="form-dots">
                        {(team.wl || [1, 1, 0, 1]).slice(-5).map((w, i) => (
                          <span key={i} className={`form-dot ${w === 1 ? 'w' : 'l'}`}>
                            {w === 1 ? 'W' : 'L'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lb-podium-actions">
                      <Link to={`/teams/${team.id}`} className="lb-podium-btn">
                        Explore Squad Roster &amp; Stats →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── STANDINGS TABLE CARD ─── */}
        <div className="lb-table-card">
          <div className="lb-table-header">
            <div>
              <h3 className="lb-table-title">Atlantic Coast Conference Standings</h3>
              <span className="lb-table-meta">Official ledger updated from verified referee scores</span>
            </div>
            <div className="lb-qual-indicator">
              <span className="qual-dot" />
              <span>Rows 1–4: NCAA Tournament Automatic Bids</span>
            </div>
          </div>

          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Collegiate Squad</th>
                  <th>Sport</th>
                  <th>Division</th>
                  <th style={{ textAlign: 'center' }}>Played</th>
                  <th style={{ textAlign: 'center' }}>Wins</th>
                  <th style={{ textAlign: 'center' }}>Losses</th>
                  <th style={{ textAlign: 'center' }}>Win Pct</th>
                  <th style={{ textAlign: 'center' }}>Recent Form</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, idx) => {
                  const rank = idx + 1
                  const isPlayoffEligible = rank <= 4
                  const totalPlayed = (team.wins || 0) + (team.losses || 0)

                  return (
                    <tr
                      key={team.id}
                      className={`${rank <= 3 ? 'lb-tr-podium' : ''} ${rank === 4 ? 'lb-tr-cutoff' : ''}`}
                    >
                      <td>
                        <span className={`lb-rank-badge rank-${rank <= 3 ? rank : 'regular'}`}>
                          #{rank}
                        </span>
                      </td>
                      <td>
                        <div className="lb-team-cell">
                          <TeamLogo team={team} size="sm" />
                          <div className="lb-team-text">
                            <Link to={`/teams/${team.id}`} className="lb-team-name-link">
                              {team.name}
                            </Link>
                            <span className="lb-team-coach-name">Coach {team.coach}</span>
                          </div>
                          {isPlayoffEligible && (
                            <span className="lb-bid-tag" title="NCAA Tournament Bid Threshold">
                              NCAA BID
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="lb-sport-chip">{team.sport?.toUpperCase()}</span>
                      </td>
                      <td className="lb-div-cell">{team.division}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {totalPlayed}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                        {team.wins || 0}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>
                        {team.losses || 0}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="lb-pct-cell">
                          <span className="lb-pct-num">{team.pct}</span>
                          <div className="lb-pct-microbar">
                            <div
                              className="lb-pct-fill"
                              style={{ width: `${Math.round((parseFloat(team.pct) || 0) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="lb-form-pills">
                          {(team.wl || [1, 1, 0, 1]).slice(-5).map((w, i) => (
                            <span key={i} className={`mini-dot ${w === 1 ? 'w' : 'l'}`}>
                              {w === 1 ? 'W' : 'L'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/teams/${team.id}`} className="lb-row-link">
                          View Roster →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
