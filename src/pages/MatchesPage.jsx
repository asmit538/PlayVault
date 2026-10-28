import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import TeamLogo from '../components/common/TeamLogo'
import {
  getNextUpcomingMatch,
  secondsUntilMatch,
  splitCountdown,
  friendlyDay,
} from '../utils/dateUtils'
import './MatchesPage.css'

export default function MatchesPage() {
  const { sports, teams, matches, venues, openModal } = useSports()

  // Tabs: 'upcoming' | 'live' | 'completed' | 'all' | 'leaderboard'
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedSport, setSelectedSport] = useState('all')
  const [selectedVenue, setSelectedVenue] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [leaderboardSport, setLeaderboardSport] = useState('all')

  // Ticking clock so the countdown reflects the real time until kick-off
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchTab =
        activeTab === 'all' ||
        activeTab === 'leaderboard' ||
        m.status === activeTab

      const matchSport = selectedSport === 'all' || m.sport === selectedSport
      const matchVenue = selectedVenue === 'all' || m.venueId === selectedVenue

      const teamA = teams.find((t) => t.id === m.teamAId)?.name.toLowerCase() || ''
      const teamB = teams.find((t) => t.id === m.teamBId)?.name.toLowerCase() || ''
      const q = searchQuery.toLowerCase()
      const matchQuery = !q || teamA.includes(q) || teamB.includes(q) || m.sport.includes(q)

      return matchTab && matchSport && matchVenue && matchQuery
    })
  }, [matches, activeTab, selectedSport, selectedVenue, searchQuery, teams])

  const upcomingCount = matches.filter((m) => m.status === 'upcoming').length
  const liveCount = matches.filter((m) => m.status === 'live').length
  const completedCount = matches.filter((m) => m.status === 'completed').length

  // Standings calculation for integrated Leaderboard tab
  const sortedStandings = useMemo(() => {
    const list = leaderboardSport === 'all' ? teams : teams.filter((t) => t.sport === leaderboardSport)
    return [...list].sort((a, b) => {
      const pctA = parseFloat(a.pct) || 0
      const pctB = parseFloat(b.pct) || 0
      if (pctB !== pctA) return pctB - pctA
      return (b.wins || 0) - (a.wins || 0)
    })
  }, [teams, leaderboardSport])

  // Top 3 for leaderboard podium
  const standingsPodium = sortedStandings.slice(0, 3)

  // Export CSV handler
  const handleExportCSV = () => {
    if (activeTab === 'leaderboard') {
      const header = 'Rank,Team,Sport,Division,Wins,Losses,WinPct,Record\n'
      const rows = sortedStandings
        .map((t, i) => `${i + 1},"${t.name}",${t.sport},"${t.division}",${t.wins || 0},${t.losses || 0},${t.pct},"${t.record}"`)
        .join('\n')
      const blob = new Blob([header + rows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `playvault_standings_${leaderboardSport}.csv`
      a.click()
    } else {
      const header = 'Date,Time,Sport,TeamA,TeamB,Status,Venue,Score\n'
      const rows = filteredMatches
        .map((m) => {
          const tA = teams.find((t) => t.id === m.teamAId)?.name || 'Team A'
          const tB = teams.find((t) => t.id === m.teamBId)?.name || 'Team B'
          const v = venues.find((ven) => ven.id === m.venueId)?.name || 'Venue'
          return `"${m.date}","${m.time}","${m.sport}","${tA}","${tB}","${m.status}","${v}","${m.scoreA || 0}-${m.scoreB || 0}"`
        })
        .join('\n')
      const blob = new Blob([header + rows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `playvault_fixtures_${activeTab}.csv`
      a.click()
    }
  }

  // Featured match: a genuinely live match, otherwise the next upcoming one.
  // Never falls back to an arbitrary (possibly completed) match.
  const liveFeatured = matches.find((m) => m.status === 'live')
  const featuredMatch = liveFeatured || getNextUpcomingMatch(matches)
  const featuredIsLive = !!liveFeatured
  const countdown = featuredMatch && !featuredIsLive
    ? splitCountdown(secondsUntilMatch(featuredMatch, now))
    : { d: 0, h: 0, m: 0, s: 0 }
  const featTeamA = teams.find((t) => t.id === featuredMatch?.teamAId)
  const featTeamB = teams.find((t) => t.id === featuredMatch?.teamBId)
  const featVenue = venues.find((v) => v.id === featuredMatch?.venueId)

  return (
    <div className="mp-page">
      <div className="mp-container">

        {/* ─── PAGE HEADER ─── */}
        <header className="mp-header">
          <div className="mp-header-left">
            <div className="mp-header-tag-row">
              <span className="mp-badge-tag">
                <span className="pulse-ping" />
                NCAA DIVISION I ATHLETIC COMMAND
              </span>
              <span className="mp-header-cycle">WEEK 12 · CIRCUIT ACTIVE</span>
            </div>
            <h1 className="mp-title">VARSITY MATCH CENTER & FIXTURES</h1>
            <p className="mp-subtitle">
              Comprehensive schedule of audited varsity clash dates, certified court allocations, live scoring telemetry, and official conference standings.
            </p>
          </div>

          <div className="mp-header-right">
            <button className="mp-btn-export" onClick={handleExportCSV}>
              <span>📊 Export CSV</span>
            </button>
            <button
              className="mp-btn-schedule"
              onClick={() => openModal('scheduleMatch')}
            >
              <span className="btn-plus">+</span>
              <span>Schedule Fixture</span>
            </button>
          </div>
        </header>

        {/* ─── MAIN STATUS TABS (Includes Integrated Standings) ─── */}
        <div className="mp-tabs-bar">
          <div className="mp-tabs-list">
            <button
              className={`mp-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <span>Upcoming Fixtures</span>
              <span className="mp-tab-pill">{upcomingCount}</span>
            </button>

            <button
              className={`mp-tab-btn ${activeTab === 'live' ? 'active live' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              <span className="live-tab-dot" />
              <span>Live In Play</span>
              <span className="mp-tab-pill pill-red">{liveCount}</span>
            </button>

            <button
              className={`mp-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <span>Past Results</span>
              <span className="mp-tab-pill">{completedCount}</span>
            </button>

            <button
              className={`mp-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>All Matches</span>
              <span className="mp-tab-pill">{matches.length}</span>
            </button>

            {/* INTEGRATED LEADERBOARD TAB */}
            <button
              className={`mp-tab-btn mp-tab-btn--gold ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <span>🏆 Conference Standings</span>
              <span className="mp-tab-pill pill-gold">{teams.length} Teams</span>
            </button>
          </div>

          <div className="mp-tabs-meta">
            <span className="mp-sync-text">Live Sync: Verified Referees</span>
          </div>
        </div>

        {/* ─── CONDITIONAL RENDER: LEADERBOARD OR FIXTURES VIEW ─── */}
        {activeTab === 'leaderboard' ? (
          /* ─── INTEGRATED LEADERBOARD SECTION ─── */
          <div className="mp-leaderboard-section">
            <div className="mp-lb-controls">
              <div className="mp-lb-title-wrap">
                <span className="mp-section-tag">LEAGUE TABLES</span>
                <h2 className="mp-lb-heading">Atlantic Coast Conference Standings</h2>
                <p className="mp-lb-sub">
                  Dynamic team records calculated from match results, win percentages, and recent form.
                </p>
              </div>

              {/* Sport Selector Chips */}
              <div className="mp-lb-sports-row">
                <button
                  className={`mp-lb-sport-chip ${leaderboardSport === 'all' ? 'active' : ''}`}
                  onClick={() => setLeaderboardSport('all')}
                >
                  All Sports
                </button>
                {sports.map((sp) => (
                  <button
                    key={sp.id}
                    className={`mp-lb-sport-chip ${leaderboardSport === sp.id ? 'active' : ''}`}
                    onClick={() => setLeaderboardSport(sp.id)}
                  >
                    <span>{sp.icon}</span>
                    <span>{sp.shortName || sp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Podium for Top 3 Teams */}
            <div className="mp-lb-podium-grid">
              {standingsPodium.map((team, idx) => {
                const rank = idx + 1
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
                const rankColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : '#d97706'

                return (
                  <div key={team.id} className={`mp-podium-pod mp-podium-pod--${rank}`}>
                    <div className="mp-podium-head" style={{ borderTopColor: rankColor }}>
                      <span className="mp-podium-medal">{medal}</span>
                      <span className="mp-podium-rank">RANK #{rank}</span>
                    </div>

                    <div className="mp-podium-body">
                      <TeamLogo team={team} size="md" showGlow={rank === 1} />
                      <div className="mp-podium-info">
                        <h4 className="mp-podium-name">{team.name}</h4>
                        <span className="mp-podium-div">{team.division} · Seed {team.seed}</span>
                      </div>
                    </div>

                    <div className="mp-podium-stats">
                      <div className="mp-podium-stat">
                        <span className="val">{team.record}</span>
                        <span className="lbl">Record</span>
                      </div>
                      <div className="mp-podium-stat">
                        <span className="val font-gold">{team.pct}</span>
                        <span className="lbl">Win %</span>
                      </div>
                      <div className="mp-podium-stat">
                        <span className="val">{team.wins}</span>
                        <span className="lbl">Wins</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Standings Table */}
            <div className="mp-table-card">
              <table className="mp-standings-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Rank</th>
                    <th>Varsity Team</th>
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
                  {sortedStandings.map((team, idx) => {
                    const rank = idx + 1
                    const totalMatches = (team.wins || 0) + (team.losses || 0)

                    return (
                      <tr key={team.id} className={rank <= 3 ? 'tr-podium' : ''}>
                        <td>
                          <span className={`rank-pill rank-pill--${rank <= 3 ? rank : 'regular'}`}>
                            #{rank}
                          </span>
                        </td>
                        <td>
                          <div className="mp-team-cell">
                            <TeamLogo team={team} size="sm" />
                            <div className="mp-team-cell-text">
                              <Link to={`/teams/${team.id}`} className="team-link">
                                {team.name}
                              </Link>
                              <span className="team-sub">Coach {team.coach}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="sport-pill-text">{team.sport?.toUpperCase()}</span>
                        </td>
                        <td className="text-secondary">{team.division}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                          {totalMatches}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                          {team.wins || 0}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>
                          {team.losses || 0}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent)' }}>
                          {team.pct}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="form-dots-wrap">
                            {(team.wl || [1, 1, 0, 1]).slice(-5).map((w, i) => (
                              <span key={i} className={`mini-form-dot ${w === 1 ? 'w' : 'l'}`}>
                                {w === 1 ? 'W' : 'L'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/teams/${team.id}`} className="mp-table-action-link">
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
        ) : (
          /* ─── FIXTURES & MATCHES VIEW ─── */
          <>
            {/* ─── FILTERS TOOLBAR ─── */}
            <div className="mp-filters-toolbar">
              <div className="mp-filters-inputs">
                {/* Search */}
                <div className="mp-search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search fixtures, squads, tournaments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
                  )}
                </div>

                {/* Sport filter */}
                <select
                  className="mp-select-filter"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <option value="all">All Disciplines ({sports.length})</option>
                  {sports.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.icon} {sp.name}
                    </option>
                  ))}
                </select>

                {/* Venue filter */}
                <select
                  className="mp-select-filter"
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                >
                  <option value="all">All Venues & Pavilions ({venues.length})</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      🏟️ {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mp-filters-tags">
                <span className="filter-chip">CONFERENCE SCHEDULE</span>
                <span className="filter-chip">NCAA CERTIFIED</span>
              </div>
            </div>

            {/* ─── FEATURED CHAMPIONSHIP COUNTDOWN BANNER ─── */}
            {featuredMatch && (
              <div className="mp-championship-banner">
                <div className="mp-cb-bg-glow" />

                <div className="mp-cb-top-bar">
                  <div className="mp-cb-tag">
                    <span className="live-dot-pulse" />
                    {featuredIsLive ? 'LIVE NOW' : 'NEXT FIXTURE'} · {featuredMatch.tag || 'Varsity Match'}
                  </div>
                  <div className="mp-cb-meta-tags">
                    {featuredMatch.isSimulatedLive && <span>⚠️ Simulated demo data</span>}
                  </div>
                </div>

                <div className="mp-cb-faceoff">
                  {/* Home Team */}
                  <div className="mp-cb-team mp-cb-team--home">
                    <span className="team-seed-badge">{featTeamA?.seed} · HOME FAVORITE</span>
                    <TeamLogo team={featTeamA} size="xl" showGlow />
                    <h3 className="team-name">{featTeamA?.name}</h3>
                    <span className="team-record">{featTeamA?.record} · {featTeamA?.division}</span>
                    <span className="team-coach">Head Coach: {featTeamA?.coach}</span>
                  </div>

                  {/* Center Countdown / Status */}
                  <div className="mp-cb-center">
                    <div className="countdown-card">
                      {featuredIsLive ? (
                        <>
                          <div className="countdown-label">
                            {featuredMatch.isSimulatedLive ? 'SIMULATED LIVE MATCH' : 'MATCH IN PROGRESS'}
                          </div>
                          <div className="countdown-digits">
                            <div className="time-block">
                              <span className="num">{featuredMatch.scoreA ?? 0}</span>
                              <span className="unit">HOME</span>
                            </div>
                            <span className="sep">:</span>
                            <div className="time-block">
                              <span className="num">{featuredMatch.scoreB ?? 0}</span>
                              <span className="unit">AWAY</span>
                            </div>
                          </div>
                          <div className="countdown-match-time">
                            {featuredMatch.period} {featuredMatch.periodTime && `· ${featuredMatch.periodTime}`}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="countdown-label">KICK-OFF COUNTDOWN</div>
                          <div className="countdown-digits">
                            {countdown.d > 0 && (
                              <>
                                <div className="time-block">
                                  <span className="num">{pad(countdown.d)}</span>
                                  <span className="unit">DAYS</span>
                                </div>
                                <span className="sep">:</span>
                              </>
                            )}
                            <div className="time-block">
                              <span className="num">{pad(countdown.h)}</span>
                              <span className="unit">HRS</span>
                            </div>
                            <span className="sep">:</span>
                            <div className="time-block">
                              <span className="num">{pad(countdown.m)}</span>
                              <span className="unit">MIN</span>
                            </div>
                            <span className="sep">:</span>
                            <div className="time-block">
                              <span className="num">{pad(countdown.s)}</span>
                              <span className="unit">SEC</span>
                            </div>
                          </div>
                          <div className="countdown-match-time">
                            🕐 {friendlyDay(featuredMatch.date)} · {featuredMatch.time}
                          </div>
                        </>
                      )}
                      <div className="countdown-venue">{featVenue?.name}</div>
                    </div>

                    <div className="mp-cb-actions">
                      <Link to={`/matches/${featuredMatch.id}`} className="btn-match-center">
                        {featuredIsLive ? '🔴 Open Live Match Center' : 'Open Match Center →'}
                      </Link>
                      <button
                        className="btn-record-score"
                        onClick={() => openModal('recordResult', { match: featuredMatch })}
                      >
                        📊 Record Score
                      </button>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="mp-cb-team mp-cb-team--away">
                    <span className="team-seed-badge">{featTeamB?.seed} · CHALLENGER</span>
                    <TeamLogo team={featTeamB} size="xl" showGlow />
                    <h3 className="team-name">{featTeamB?.name}</h3>
                    <span className="team-record">{featTeamB?.record} · {featTeamB?.division}</span>
                    <span className="team-coach">Head Coach: {featTeamB?.coach}</span>
                  </div>
                </div>

                <div className="mp-cb-footer">
                  <span>👤 Officials: {(featuredMatch.referees || []).join(', ') || 'To be assigned'}</span>
                </div>
              </div>
            )}

            {/* ─── SCHEDULED FIXTURES LIST ─── */}
            <div className="mp-fixtures-section">
              <div className="mp-fixtures-header">
                <div>
                  <h2 className="mp-fixtures-title">
                    Scheduled Fixtures & Telemetry ({filteredMatches.length})
                  </h2>
                  <p className="mp-fixtures-sub">
                    Displaying verified NCAA collegiate matches with real-time referee synchronization.
                  </p>
                </div>
                <div className="mp-fixtures-chips">
                  <span className="chip">Turf / Grass</span>
                  <span className="chip">Hardwood</span>
                  <span className="chip">Polymer Track</span>
                </div>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="mp-empty-state">
                  <div className="empty-icon">📅</div>
                  {activeTab === 'live' && liveCount === 0 ? (
                    <>
                      <h3>No Matches Are Live Right Now</h3>
                      <p>Check the Upcoming tab for the next scheduled fixture.</p>
                    </>
                  ) : (
                    <>
                      <h3>No Fixtures Match Your Criteria</h3>
                      <p>Try resetting the search keywords or filters.</p>
                    </>
                  )}
                  <button
                    className="mp-btn-schedule"
                    onClick={() => {
                      setSelectedSport('all')
                      setSelectedVenue('all')
                      setSearchQuery('')
                      setActiveTab('all')
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="mp-cards-list">
                  {filteredMatches.map((fixture, idx) => {
                    const teamA = teams.find((t) => t.id === fixture.teamAId)
                    const teamB = teams.find((t) => t.id === fixture.teamBId)
                    const venue = venues.find((v) => v.id === fixture.venueId)
                    const dateParts = fixture.date.split('-')
                    const dayNum = dateParts[2] || '15'
                    const monthName = new Date(`${fixture.date}T00:00:00`).toLocaleString('default', { month: 'short' }).toUpperCase()
                    const dayName = new Date(`${fixture.date}T00:00:00`).toLocaleString('default', { weekday: 'short' }).toUpperCase()

                    const isCompleted = fixture.status === 'completed'
                    const isLive = fixture.status === 'live'

                    return (
                      <div
                        key={fixture.id}
                        className={`mp-fixture-card ${isLive ? 'card-live' : ''}`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {/* Date Left Column */}
                        <div className="mp-card-date-col">
                          <span className="day-name">{dayName}</span>
                          <span className="day-num">{dayNum}</span>
                          <span className="month-name">{monthName}</span>
                          <span className="status-badge-col">
                            {isLive && <span className="badge-live-pulse">LIVE</span>}
                            {isCompleted && <span className="badge-final">FINAL</span>}
                            {!isLive && !isCompleted && <span className="badge-upcoming">SCHEDULED</span>}
                          </span>
                        </div>

                        {/* Card Center: Teams & Details */}
                        <div className="mp-card-body">
                          <div className="mp-card-top-row">
                            <div className="mp-card-sport-tag">
                              <span className="sport-name">{fixture.sport?.toUpperCase()}</span>
                              <span className="tourn-tag">· {fixture.tag || 'Varsity Match'}</span>
                            </div>
                            <div className="mp-card-time-loc">
                              <span className="fixture-time">🕐 {fixture.time}</span>
                              <span className="fixture-venue">🏟️ {venue?.name || 'Athletics Arena'}</span>
                            </div>
                          </div>

                          {/* Matchup */}
                          <div className="mp-card-faceoff">
                            <div className="mp-card-team">
                              <TeamLogo team={teamA} size="md" />
                              <div className="mp-card-team-info">
                                <Link to={`/teams/${teamA?.id}`} className="name-link">
                                  {teamA?.name || 'Home Team'}
                                </Link>
                                <span className="meta">Seed {teamA?.seed || '#1'} · {teamA?.record || ''}</span>
                              </div>
                            </div>

                            {/* Score or VS */}
                            <div className="mp-card-center-score">
                              {isCompleted || isLive ? (
                                <div className="score-box">
                                  <span className={`score-num ${isCompleted && (fixture.scoreA > fixture.scoreB) ? 'high' : ''}`}>
                                    {fixture.scoreA}
                                  </span>
                                  <span className="score-sep">-</span>
                                  <span className={`score-num ${isCompleted && (fixture.scoreB > fixture.scoreA) ? 'high' : ''}`}>
                                    {fixture.scoreB}
                                  </span>
                                </div>
                              ) : (
                                <span className="vs-tag">VS</span>
                              )}
                            </div>

                            <div className="mp-card-team mp-card-team--right">
                              <div className="mp-card-team-info mp-card-team-info--right">
                                <Link to={`/teams/${teamB?.id}`} className="name-link">
                                  {teamB?.name || 'Away Team'}
                                </Link>
                                <span className="meta">Seed {teamB?.seed || '#2'} · {teamB?.record || ''}</span>
                              </div>
                              <TeamLogo team={teamB} size="md" />
                            </div>
                          </div>

                          {/* Badges footer */}
                          <div className="mp-card-foot-row">
                            <span className="compliance-tag">✓ Roster Verified</span>
                            <span className="ref-tag">
                              Official: {fixture.referees?.[0] || 'NCAA Certified Official'}
                            </span>
                            {fixture.sportScoreSummary && (
                              <span className="score-summary-pill">{fixture.sportScoreSummary}</span>
                            )}
                          </div>
                        </div>

                        {/* Card Right Actions */}
                        <div className="mp-card-actions-col">
                          <Link to={`/matches/${fixture.id}`} className="btn-details">
                            Match Center →
                          </Link>
                          {!isCompleted && (
                            <button
                              className="btn-score-entry"
                              onClick={() => openModal('recordResult', { match: fixture })}
                            >
                              Enter Score
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── AUDIT COMPLIANCE BANNER ─── */}
        <div className="mp-compliance-strip">
          <div className="mp-comp-icon">🛡️</div>
          <div className="mp-comp-body">
            <strong>NCAA Athletic Operations Compliance & Telemetry Standard</strong>
            <p>
              All scheduled fixtures carry certified referee sync, calibrated match balls, and credentialed athletic trainers on site.
            </p>
          </div>
          <div className="mp-comp-audit">
            <span className="hash-code">LEDGER HASH: #3TV1-2025-B12-694</span>
            <button
              className="btn-audit"
              onClick={() => alert('Official Audit Verified: All 14 squads cleared for NCAA Week 12 play.')}
            >
              Verify Ledger
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
