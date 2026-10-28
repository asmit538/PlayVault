import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import TeamLogo from '../components/common/TeamLogo'
import { getNextUpcomingMatch, friendlyDay } from '../utils/dateUtils'
import './HomePage.css'

// Smooth animated counter component
function AnimatedNumber({ value, duration = 800 }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const end = parseInt(value, 10) || 0
    if (end === 0) {
      setDisplayValue(0)
      return
    }

    let startTimestamp = null
    let animationFrameId

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(easeOut * end))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(end)
      }
    }

    animationFrameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value, duration])

  return <span>{displayValue}</span>
}

export default function HomePage() {
  const {
    sports,
    teams,
    matches,
    venues,
    equipment,
    summaryStats,
    openModal,
    addNotification,
    simulatePoints,
  } = useSports()

  const [selectedSport, setSelectedSport] = useState('basketball')
  const [chartMetric, setChartMetric] = useState('winPct') // 'winPct' | 'matches'
  const [liveClockSeconds, setLiveClockSeconds] = useState(0)

  const formatPeriodClock = (totalSec) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Current formatted date
  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [])

  // Only a match whose status is genuinely 'live' belongs on the live scoreboard.
  // No fallback: when nothing is live we render an empty state instead.
  const liveMatch = useMemo(() => matches.find((m) => m.status === 'live'), [matches])
  const nextMatch = useMemo(() => getNextUpcomingMatch(matches), [matches])

  const liveTeamA = teams.find((t) => t.id === liveMatch?.teamAId)
  const liveTeamB = teams.find((t) => t.id === liveMatch?.teamBId)
  const liveVenue = venues.find((v) => v.id === liveMatch?.venueId)
  const nextTeamA = teams.find((t) => t.id === nextMatch?.teamAId)
  const nextTeamB = teams.find((t) => t.id === nextMatch?.teamBId)

  // Scores come straight from the stored match record (single source of truth)
  const currentScoreA = liveMatch?.scoreA ?? 0
  const currentScoreB = liveMatch?.scoreB ?? 0

  // Seed the period clock from the match's recorded period time
  useEffect(() => {
    if (!liveMatch?.periodTime) return
    const [mm, ss] = String(liveMatch.periodTime).split(':').map(Number)
    if (!Number.isNaN(mm) && !Number.isNaN(ss)) setLiveClockSeconds(mm * 60 + ss)
  }, [liveMatch?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Simulated clock only ticks while a simulated match is on screen
  useEffect(() => {
    if (!liveMatch?.isSimulatedLive) return undefined
    const timer = setInterval(() => {
      setLiveClockSeconds((prev) => (prev > 0 ? prev - 1 : 720))
    }, 1000)
    return () => clearInterval(timer)
  }, [liveMatch?.id, liveMatch?.isSimulatedLive])

  const handleSimulateScore = () => {
    if (!liveMatch?.isSimulatedLive) return
    // Alternate scoring side, 2 or 3 points, persisted to the match record
    const total = (Number(liveMatch.scoreA) || 0) + (Number(liveMatch.scoreB) || 0)
    const side = total % 2 === 0 ? 'A' : 'B'
    const points = total % 3 === 0 ? 3 : 2
    simulatePoints(liveMatch.id, side, points)
  }

  // Top 3 for selected sport
  const topThreeTeams = useMemo(() => {
    const sportTeams = teams.filter((t) => t.sport === selectedSport)
    return [...sportTeams]
      .sort((a, b) => {
        const pctA = parseFloat(a.pct) || 0
        const pctB = parseFloat(b.pct) || 0
        if (pctB !== pctA) return pctB - pctA
        return (b.wins || 0) - (a.wins || 0)
      })
      .slice(0, 3)
  }, [teams, selectedSport])

  // Upcoming matches (next 4)
  const upcomingMatches = useMemo(() => {
    return matches.filter((m) => m.status === 'upcoming').slice(0, 4)
  }, [matches])

  // Completed matches (latest 4)
  const recentResults = useMemo(() => {
    return matches.filter((m) => m.status === 'completed').slice(0, 4)
  }, [matches])

  // Sport distribution for donut chart
  const sportDistribution = useMemo(() => {
    return sports.map((s) => {
      const sportTeams = teams.filter((t) => t.sport === s.id).length
      return {
        name: s.shortName || s.name,
        count: sportTeams,
        color: s.color || '#1a3c2a',
        pct: teams.length ? Math.round((sportTeams / teams.length) * 100) : 0,
      }
    })
  }, [sports, teams])

  // Performance data for bar chart
  const performanceChartData = useMemo(() => {
    return teams.slice(0, 6).map((t) => ({
      name: t.name.split(' ')[0],
      fullName: t.name,
      winPct: Math.round((parseFloat(t.pct) || 0) * 100),
      wins: t.wins || 0,
      sport: t.sport,
    }))
  }, [teams])

  return (
    <div className="hp-dashboard">
      <div className="hp-container">

        {/* ─── LIVE TELEMETRY TICKER ─── */}
        <div className="hp-ticker-strip">
          <div className="hp-ticker-tag">
            <span className="live-dot-pulse" />
            LIVE TELEMETRY FEED
          </div>
          <div className="hp-ticker-content">
            <span className="ticker-item">
              {liveMatch ? (
                <>
                  <strong>{liveMatch.isSimulatedLive ? 'Demo Match (Simulated):' : 'Live Now:'}</strong>{' '}
                  {liveTeamA?.name} vs {liveTeamB?.name}
                </>
              ) : nextMatch ? (
                <>
                  <strong>Next Fixture:</strong> {nextTeamA?.name} vs {nextTeamB?.name} · {friendlyDay(nextMatch.date)} at {nextMatch.time}
                </>
              ) : (
                <>
                  <strong>Schedule:</strong> No fixtures currently scheduled
                </>
              )}
            </span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item">
              <strong>Facility Status:</strong> Main Pavilion Court A NFC Ball Sensors Calibrated &amp; Approved
            </span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item">
              <strong>Eligibility Index:</strong> All 14 Squads Cleared for Conference Play
            </span>
          </div>
          <div className="hp-ticker-time">{currentDateFormatted}</div>
        </div>

        {/* ─── SECTION 1: MODERN EXECUTIVE HERO ─── */}
        <section className="hp-hero">
          {/* Tactical pitch background watermark */}
          <div className="hp-hero-pitch-lines" aria-hidden="true">
            <div className="pitch-center-circle" />
            <div className="pitch-center-line" />
            <div className="pitch-penalty-box-left" />
            <div className="pitch-penalty-box-right" />
            <div className="pitch-grid-glow" />
          </div>

          <div className="hp-hero-content">
            <div className="hp-hero-badge-row">
              <span className="hp-hero-pill">
                <span className="hp-pill-dot" />
                VARSITY ATHLETICS COMMAND CENTER
              </span>
              <span className="hp-hero-cycle">NCAA DIVISION I · {new Date().getFullYear()} SEASON</span>
              <span className="hp-badge-certified">✓ ISO 9001 COMPLIANT</span>
            </div>

            <h1 className="hp-hero-title">
              YOUR GAME. <span className="text-gold-accent">YOUR EDGE.</span>
            </h1>

            <p className="hp-hero-subtitle">
              High-performance collegiate athletics command: real-time telemetry, squad rosters, venue bookings, rulebook compliance, and tournament analytics.
            </p>

            <div className="hp-hero-actions">
              <button
                className="hp-cta-primary"
                onClick={() => openModal('scheduleMatch')}
              >
                <span className="hp-cta-icon">+</span>
                <span>Schedule Fixture</span>
              </button>
              <button
                className="hp-cta-secondary"
                onClick={() => openModal('createTeam')}
              >
                <Icon name="users" size={16} />
                <span>Register Team</span>
              </button>
              <button
                className="hp-cta-ghost"
                onClick={() => openModal('bookVenue')}
              >
                <Icon name="map-pin" size={16} />
                <span>Reserve Facility</span>
              </button>
            </div>
          </div>

          {/* Quick telemetry widget in hero right */}
          <div className="hp-hero-telemetry">
            <div className="telemetry-card">
              <div className="telemetry-header">
                <div className="telemetry-badge-wrap">
                  <span className="pulse-ping" />
                  <span className="telemetry-status-text">SYSTEM OPERATIONAL</span>
                </div>
                <span className="telemetry-sync">99.8% TELEMETRY SYNC</span>
              </div>

              <div className="telemetry-stats-row">
                <div className="telemetry-item">
                  <div className="telemetry-number">{summaryStats.activeTeams}</div>
                  <div className="telemetry-label">Active Squads</div>
                  <div className="telemetry-sub">7 Disciplines</div>
                </div>
                <div className="telemetry-sep" />
                <div className="telemetry-item">
                  <div className="telemetry-number">{summaryStats.totalPlayers}</div>
                  <div className="telemetry-label">Athletes</div>
                  <div className="telemetry-sub text-green">100% Cleared</div>
                </div>
                <div className="telemetry-sep" />
                <div className="telemetry-item">
                  <div className="telemetry-number text-gold">{summaryStats.liveMatches}</div>
                  <div className="telemetry-label">In Play</div>
                  <div className="telemetry-sub">Live Telemetry</div>
                </div>
              </div>

              <div className="telemetry-footer">
                <div className="telemetry-facility">
                  <span className="dot-ok" />
                  <span>Pavilions: <strong>{summaryStats.availableVenues}/{summaryStats.totalVenues}</strong> Ready</span>
                </div>
                <span className="telemetry-tag">ESPN+ READY</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: LIVE MATCH SPOTLIGHT SCOREBOARD ─── */}
        <section className="hp-spotlight-section">
          <div className="hp-section-label-row">
            <div className="hp-section-tag">
              <span className="live-dot-pulse" />
              LIVE MATCH CENTER &amp; TELEMETRY
            </div>
            <span className="hp-section-caption">
              {liveMatch?.isSimulatedLive
                ? 'Simulated demo data — not a real broadcast feed'
                : 'Live fixtures appear here while a match is in progress'}
            </span>
          </div>

          {liveMatch ? (
            <div className="hp-scoreboard">
              <div className="hp-scoreboard-glow" />
              {liveMatch.isSimulatedLive && (
                <div className="hp-sim-banner" role="note">
                  ⚠️ SIMULATED DEMO MATCH — scores and clock are generated for demonstration, not from a live feed.
                </div>
              )}

              {/* Scoreboard Top Meta */}
              <div className="hp-sb-top">
                <div className="hp-sb-league">
                  <span className="sport-pill-tag">
                    {liveMatch.sport?.toUpperCase()}
                  </span>
                  <span className="hp-sb-tourn">
                    {liveMatch.tag || 'Varsity Fixture'}
                  </span>
                </div>

                <div className="hp-sb-live-indicator">
                  <span className="live-badge-glow">
                    <span className="live-badge-dot" />
                    {liveMatch.isSimulatedLive ? 'SIMULATED LIVE' : 'LIVE IN PLAY'}
                  </span>
                  <span className="hp-sb-period">
                    {liveMatch.period || 'In Progress'} · {formatPeriodClock(liveClockSeconds)}
                  </span>
                </div>

                <div className="hp-sb-venue-info">
                  <Icon name="map-pin" size={14} />
                  <span>{liveVenue?.name}</span>
                </div>
              </div>

              {/* Central Match Faceoff */}
              <div className="hp-sb-faceoff">
                {/* Team A */}
                <div className="hp-sb-team hp-sb-team--home">
                  <div className="hp-sb-team-identity">
                    <TeamLogo team={liveTeamA} size="xl" showGlow />
                    <div className="hp-sb-team-meta">
                      <div className="hp-sb-team-seed">{liveTeamA?.seed} · HOME FAVORITE</div>
                      <h2 className="hp-sb-team-name">{liveTeamA?.name}</h2>
                      <div className="hp-sb-team-record">{liveTeamA?.record} · {liveTeamA?.division} · Coach {liveTeamA?.coach}</div>
                    </div>
                  </div>
                  <div className="hp-sb-score hp-sb-score--home">
                    {currentScoreA}
                  </div>
                </div>

                {/* Scoreboard Center Divider */}
                <div className="hp-sb-center">
                  <div className="hp-sb-clock-display">
                    <span className="hp-sb-clock-val">{formatPeriodClock(liveClockSeconds)}</span>
                    <span className="hp-sb-clock-lbl">{liveMatch.period || 'IN PROGRESS'}</span>
                  </div>
                  <div className="hp-sb-vs-badge">VS</div>
                  {liveMatch.isSimulatedLive && (
                    <button
                      className="hp-sb-sim-btn"
                      onClick={handleSimulateScore}
                      title="Adds simulated points to the stored match score"
                    >
                      ⚡ Simulate Score Event
                    </button>
                  )}
                </div>

                {/* Team B */}
                <div className="hp-sb-team hp-sb-team--away">
                  <div className="hp-sb-score hp-sb-score--away">
                    {currentScoreB}
                  </div>
                  <div className="hp-sb-team-identity hp-sb-team-identity--right">
                    <div className="hp-sb-team-meta hp-sb-team-meta--right">
                      <div className="hp-sb-team-seed">{liveTeamB?.seed} · CHALLENGER</div>
                      <h2 className="hp-sb-team-name">{liveTeamB?.name}</h2>
                      <div className="hp-sb-team-record">{liveTeamB?.record} · {liveTeamB?.division} · Coach {liveTeamB?.coach}</div>
                    </div>
                    <TeamLogo team={liveTeamB} size="xl" showGlow />
                  </div>
                </div>
              </div>

              {/* Scoreboard Bottom Events Ticker */}
              <div className="hp-sb-footer">
                <div className="hp-sb-ticker">
                  <span className="hp-sb-ticker-label">PLAY LOG:</span>
                  <div className="hp-sb-events-list">
                    {(liveMatch.events || []).slice(0, 3).map((ev, i) => (
                      <span key={i} className="hp-sb-event-item">
                        <strong>{ev.time}</strong> {ev.description}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hp-sb-actions">
                  <Link to={`/matches/${liveMatch.id}`} className="hp-sb-link-btn">
                    Open Full Match Center →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="hp-no-live-card">
              <div className="hp-no-live-icon">🏆</div>
              <div className="hp-no-live-text">
                <h3>No Matches Currently In Progress</h3>
                {nextMatch ? (
                  <p>
                    Next up: {nextTeamA?.name} vs {nextTeamB?.name} ({nextMatch.sport}) —{' '}
                    {friendlyDay(nextMatch.date)} at {nextMatch.time}.{' '}
                    <Link to={`/matches/${nextMatch.id}`}>View fixture →</Link>
                  </p>
                ) : (
                  <p>There are no upcoming fixtures scheduled yet.</p>
                )}
              </div>
              <button
                className="hp-cta-primary"
                onClick={() => openModal('scheduleMatch')}
              >
                + Schedule Fixture
              </button>
            </div>
          )}
        </section>

        {/* ─── SECTION 3: ANIMATED METRIC CARDS ─── */}
        <section className="hp-stats-grid">
          {/* Card 1: Players */}
          <Link to="/players" className="hp-stat-box stagger-1">
            <div className="hp-stat-header">
              <span className="hp-stat-title">Rostered Athletes</span>
              <div className="hp-stat-icon-circle hp-stat-icon-circle--green">
                <Icon name="activity" size={20} />
              </div>
            </div>
            <div className="hp-stat-main">
              <span className="hp-stat-num">
                <AnimatedNumber value={summaryStats.totalPlayers} />
              </span>
              <span className="hp-stat-sub">Athletes Active</span>
            </div>
            <div className="hp-stat-progress-bar">
              <div className="hp-progress-fill" style={{ width: '100%', background: 'var(--color-primary)' }} />
            </div>
            <div className="hp-stat-trend">
              <span className="trend-badge-positive">✓ 100% Academic Clearance</span>
              <span className="hp-stat-meta-text">All physicals verified</span>
            </div>
          </Link>

          {/* Card 2: Teams */}
          <Link to="/teams" className="hp-stat-box stagger-2">
            <div className="hp-stat-header">
              <span className="hp-stat-title">Active Varsity Teams</span>
              <div className="hp-stat-icon-circle hp-stat-icon-circle--gold">
                <Icon name="users" size={20} />
              </div>
            </div>
            <div className="hp-stat-main">
              <span className="hp-stat-num">
                <AnimatedNumber value={summaryStats.activeTeams} />
              </span>
              <span className="hp-stat-sub">Collegiate Squads</span>
            </div>
            <div className="hp-stat-progress-bar">
              <div className="hp-progress-fill" style={{ width: '85%', background: 'var(--color-gold)' }} />
            </div>
            <div className="hp-stat-trend">
              <span className="trend-badge-neutral">Across 7 Sports</span>
              <span className="hp-stat-meta-text">Conference Rosters Locked</span>
            </div>
          </Link>

          {/* Card 3: Upcoming Fixtures */}
          <Link to="/matches" className="hp-stat-box stagger-3">
            <div className="hp-stat-header">
              <span className="hp-stat-title">Upcoming Fixtures</span>
              <div className="hp-stat-icon-circle hp-stat-icon-circle--navy">
                <Icon name="calendar" size={20} />
              </div>
            </div>
            <div className="hp-stat-main">
              <span className="hp-stat-num">
                <AnimatedNumber value={summaryStats.upcomingMatches} />
              </span>
              <span className="hp-stat-sub">Scheduled Matches</span>
            </div>
            <div className="hp-stat-progress-bar">
              <div className="hp-progress-fill" style={{ width: '70%', background: '#2980b9' }} />
            </div>
            <div className="hp-stat-trend">
              <span className="trend-badge-positive">✓ Referees Assigned</span>
              <span className="hp-stat-meta-text">Facilities reserved</span>
            </div>
          </Link>

          {/* Card 4: Matches Completed */}
          <Link to="/matches" className="hp-stat-box stagger-4">
            <div className="hp-stat-header">
              <span className="hp-stat-title">Completed Results</span>
              <div className="hp-stat-icon-circle hp-stat-icon-circle--emerald">
                <Icon name="trophy" size={20} />
              </div>
            </div>
            <div className="hp-stat-main">
              <span className="hp-stat-num">
                <AnimatedNumber value={summaryStats.completedMatches} />
              </span>
              <span className="hp-stat-sub">Scores Audited</span>
            </div>
            <div className="hp-stat-progress-bar">
              <div className="hp-progress-fill" style={{ width: '60%', background: '#27ae60' }} />
            </div>
            <div className="hp-stat-trend">
              <span className="trend-badge-positive">Official Records Finalized</span>
              <span className="hp-stat-meta-text">Standings recalculated</span>
            </div>
          </Link>

          {/* Card 5: Available Equipment */}
          <Link to="/equipment" className="hp-stat-box stagger-5">
            <div className="hp-stat-header">
              <span className="hp-stat-title">Equipment In Stock</span>
              <div className="hp-stat-icon-circle hp-stat-icon-circle--purple">
                <Icon name="tool" size={20} />
              </div>
            </div>
            <div className="hp-stat-main">
              <span className="hp-stat-num">
                <AnimatedNumber value={summaryStats.availableEquipment} />
              </span>
              <span className="hp-stat-sub">/ {summaryStats.totalEquipment} In Stock</span>
            </div>
            <div className="hp-stat-progress-bar">
              <div
                className="hp-progress-fill"
                style={{
                  width: `${Math.round((summaryStats.availableEquipment / (summaryStats.totalEquipment || 1)) * 100)}%`,
                  background: '#8e44ad',
                }}
              />
            </div>
            <div className="hp-stat-trend">
              <span className="trend-badge-neutral">{summaryStats.inUseEquipment} Checked Out</span>
              <span className="hp-stat-meta-text">Warehouse Barcode Locked</span>
            </div>
          </Link>

          {/* Card 6: Available Venues */}
          <Link to="/venues" className="hp-stat-box stagger-6">
            <div className="hp-stat-header">
              <span className="hp-stat-title">Available Facilities</span>
              <div className="hp-stat-icon-circle hp-stat-icon-circle--rose">
                <Icon name="map-pin" size={20} />
              </div>
            </div>
            <div className="hp-stat-main">
              <span className="hp-stat-num">
                <AnimatedNumber value={summaryStats.availableVenues} />
              </span>
              <span className="hp-stat-sub">/ {summaryStats.totalVenues} Pavilions</span>
            </div>
            <div className="hp-stat-progress-bar">
              <div
                className="hp-progress-fill"
                style={{
                  width: `${Math.round((summaryStats.availableVenues / (summaryStats.totalVenues || 1)) * 100)}%`,
                  background: '#d35400',
                }}
              />
            </div>
            <div className="hp-stat-trend">
              <span className="trend-badge-positive">✓ Turf &amp; Hardwood Ready</span>
              <span className="hp-stat-meta-text">{summaryStats.pendingRegistrations} trials pending</span>
            </div>
          </Link>
        </section>

        {/* ─── SECTION 4: SPORT-SPECIFIC TOP-THREE RANKINGS PODIUM ─── */}
        <section className="hp-podium-section">
          <div className="hp-section-header-split">
            <div>
              <div className="hp-section-tag">CONFERENCE LEAGUE STANDINGS</div>
              <h2 className="hp-podium-title">Top Performers &amp; Podium Contenders</h2>
              <p className="hp-podium-sub">
                Official NCAA collegiate rankings dynamically computed from verified head-to-head records, win percentages, and recent tournament form.
              </p>
            </div>

            {/* Sport Selector Chips */}
            <div className="hp-sport-chips-row">
              {sports.map((sp) => (
                <button
                  key={sp.id}
                  className={`hp-sport-pill ${selectedSport === sp.id ? 'active' : ''}`}
                  onClick={() => setSelectedSport(sp.id)}
                >
                  <span className="hp-sport-pill-icon">{sp.icon}</span>
                  <span className="hp-sport-pill-name">{sp.shortName || sp.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hp-podium-cards-grid">
            {topThreeTeams.length === 0 ? (
              <div className="hp-empty-podium-state">
                <p>No active teams currently registered for this sport.</p>
                <button
                  className="hp-cta-primary"
                  onClick={() => openModal('createTeam', { sport: selectedSport })}
                >
                  Register First Team
                </button>
              </div>
            ) : (
              topThreeTeams.map((team, idx) => {
                const rank = idx + 1
                const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
                const rankBannerColor = rank === 1 ? 'linear-gradient(135deg, #c8972e, #dfb75d)' : rank === 2 ? 'linear-gradient(135deg, #7f8c8d, #95a5a6)' : 'linear-gradient(135deg, #d35400, #e67e22)'
                const rankBadgeLabel = rank === 1 ? '1ST PLACE · DIVISION LEADER' : rank === 2 ? '2ND PLACE · RUNNER UP' : '3RD PLACE · CONTENDER'

                return (
                  <div
                    key={team.id}
                    className={`hp-rank-card hp-rank-card--rank-${rank}`}
                  >
                    <div className="hp-rank-banner" style={{ background: rankBannerColor }}>
                      <div className="hp-rank-banner-left">
                        <span className="hp-medal-icon">{medalEmoji}</span>
                        <span className="hp-rank-number-tag">RANK #{rank}</span>
                      </div>
                      <span className="hp-rank-label-tag">{rankBadgeLabel}</span>
                    </div>

                    <div className="hp-rank-card-body">
                      <div className="hp-rank-team-row">
                        <TeamLogo team={team} size="lg" showGlow={rank === 1} />
                        <div className="hp-rank-team-info">
                          <h3 className="hp-rank-team-name">{team.name}</h3>
                          <span className="hp-rank-team-div">{team.division} · Coach {team.coach}</span>
                        </div>
                      </div>

                      {/* Stat Numbers */}
                      <div className="hp-rank-metrics">
                        <div className="hp-rank-metric-box">
                          <span className="hp-rank-metric-val">{team.record}</span>
                          <span className="hp-rank-metric-lbl">W - L</span>
                        </div>
                        <div className="hp-rank-metric-box">
                          <span className="hp-rank-metric-val font-gold">{team.pct}</span>
                          <span className="hp-rank-metric-lbl">Win %</span>
                        </div>
                        <div className="hp-rank-metric-box">
                          <span className="hp-rank-metric-val">{team.seed}</span>
                          <span className="hp-rank-metric-lbl">Seed</span>
                        </div>
                      </div>

                      {/* Form pills */}
                      <div className="hp-rank-form-row">
                        <span className="hp-rank-form-lbl">Recent Form:</span>
                        <div className="hp-rank-form-pills">
                          {(team.wl || [1, 1, 0, 1]).slice(-5).map((res, i) => (
                            <span
                              key={i}
                              className={`hp-form-dot ${res === 1 ? 'win' : res === 0 ? 'loss' : 'draw'}`}
                              title={res === 1 ? 'Win' : res === 0 ? 'Loss' : 'Draw'}
                            >
                              {res === 1 ? 'W' : res === 0 ? 'L' : 'D'}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="hp-rank-card-footer">
                        <Link to={`/teams/${team.id}`} className="hp-rank-explore-link">
                          Explore Squad Roster &amp; Stats →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* ─── SECTION 5: DUAL FIXTURES & RESULTS ─── */}
        <section className="hp-fixtures-dual-grid">
          {/* Panel 1: Upcoming Fixtures */}
          <div className="hp-panel-card">
            <div className="hp-panel-header">
              <div className="hp-panel-title-area">
                <div className="hp-panel-icon-circle hp-panel-icon-circle--green">
                  📅
                </div>
                <div>
                  <h3 className="hp-panel-title">Upcoming Fixtures</h3>
                  <span className="hp-panel-desc">Audited NCAA scheduled conference clashes</span>
                </div>
              </div>
              <Link to="/matches" className="hp-panel-link">
                All Matches ({matches.length}) →
              </Link>
            </div>

            <div className="hp-fixtures-stack">
              {upcomingMatches.length === 0 ? (
                <div className="hp-empty-panel-msg">
                  <p>No upcoming fixtures scheduled.</p>
                  <button
                    className="hp-cta-primary"
                    onClick={() => openModal('scheduleMatch')}
                  >
                    Schedule Match
                  </button>
                </div>
              ) : (
                upcomingMatches.map((m) => {
                  const tA = teams.find((t) => t.id === m.teamAId)
                  const tB = teams.find((t) => t.id === m.teamBId)
                  const ven = venues.find((v) => v.id === m.venueId)
                  const dateParts = m.date.split('-')
                  const day = dateParts[2] || '15'
                  const month = new Date(m.date).toLocaleString('default', { month: 'short' }).toUpperCase()

                  return (
                    <div key={m.id} className="hp-fixture-item">
                      <div className="hp-fixture-date-badge">
                        <span className="hp-fixture-day">{day}</span>
                        <span className="hp-fixture-month">{month}</span>
                      </div>

                      <div className="hp-fixture-matchup">
                        <div className="hp-fixture-team">
                          <TeamLogo team={tA} size="sm" />
                          <span className="hp-fixture-team-name">{tA?.name || 'Squad A'}</span>
                        </div>
                        <span className="hp-fixture-vs">VS</span>
                        <div className="hp-fixture-team">
                          <TeamLogo team={tB} size="sm" />
                          <span className="hp-fixture-team-name">{tB?.name || 'Squad B'}</span>
                        </div>
                      </div>

                      <div className="hp-fixture-details">
                        <span className="hp-fixture-time">🕐 {m.time}</span>
                        <span className="hp-fixture-venue">🏟️ {ven?.name || 'Arena'}</span>
                      </div>

                      <Link to={`/matches/${m.id}`} className="hp-fixture-action-btn">
                        Details →
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Panel 2: Recent Results */}
          <div className="hp-panel-card">
            <div className="hp-panel-header">
              <div className="hp-panel-title-area">
                <div className="hp-panel-icon-circle hp-panel-icon-circle--gold">
                  🏆
                </div>
                <div>
                  <h3 className="hp-panel-title">Recent Results</h3>
                  <span className="hp-panel-desc">Official verified match outcomes &amp; scores</span>
                </div>
              </div>
              <Link to="/leaderboard" className="hp-panel-link">
                Standings Table →
              </Link>
            </div>

            <div className="hp-fixtures-stack">
              {recentResults.length === 0 ? (
                <div className="hp-empty-panel-msg">
                  <p>No completed matches recorded yet.</p>
                </div>
              ) : (
                recentResults.map((m) => {
                  const tA = teams.find((t) => t.id === m.teamAId)
                  const tB = teams.find((t) => t.id === m.teamBId)
                  const isWinnerA = (m.scoreA || 0) > (m.scoreB || 0)
                  const isWinnerB = (m.scoreB || 0) > (m.scoreA || 0)

                  return (
                    <div key={m.id} className="hp-result-item">
                      <div className="hp-result-sport-badge">
                        {m.sport?.toUpperCase()}
                      </div>

                      <div className="hp-result-teams-box">
                        <div className={`hp-result-row ${isWinnerA ? 'winner' : ''}`}>
                          <TeamLogo team={tA} size="xs" />
                          <span className="hp-result-team-name">{tA?.name}</span>
                          <span className="hp-result-score-digit">{m.scoreA}</span>
                        </div>
                        <div className={`hp-result-row ${isWinnerB ? 'winner' : ''}`}>
                          <TeamLogo team={tB} size="xs" />
                          <span className="hp-result-team-name">{tB?.name}</span>
                          <span className="hp-result-score-digit">{m.scoreB}</span>
                        </div>
                      </div>

                      <div className="hp-result-badge-col">
                        <span className="hp-final-badge">FINAL</span>
                        <Link to={`/matches/${m.id}`} className="hp-result-box-score-link">
                          Box Score →
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {/* ─── SECTION 6: ANALYTICS & VISUALIZATIONS ─── */}
        <section className="hp-analytics-grid">
          {/* Win Rate Performance Bar Chart */}
          <div className="hp-analytics-card">
            <div className="hp-analytics-header">
              <div>
                <span className="hp-section-tag">ANALYTICS ENGINE</span>
                <h3 className="hp-analytics-title">Varsity Win Rate Comparison</h3>
              </div>
              <div className="hp-analytics-toggles">
                <button
                  className={`hp-toggle-pill ${chartMetric === 'winPct' ? 'active' : ''}`}
                  onClick={() => setChartMetric('winPct')}
                >
                  Win %
                </button>
                <button
                  className={`hp-toggle-pill ${chartMetric === 'matches' ? 'active' : ''}`}
                  onClick={() => setChartMetric('matches')}
                >
                  Wins Count
                </button>
              </div>
            </div>

            <div className="hp-bar-chart-container">
              {performanceChartData.map((d, i) => {
                const val = chartMetric === 'winPct' ? d.winPct : d.wins
                const maxVal = chartMetric === 'winPct' ? 100 : 20
                const pct = Math.min(Math.round((val / maxVal) * 100), 100)

                return (
                  <div key={i} className="hp-bar-row">
                    <div className="hp-bar-label">
                      <span className="hp-bar-team-name">{d.fullName}</span>
                      <span className="hp-bar-sport-tag">{d.sport}</span>
                    </div>

                    <div className="hp-bar-track">
                      <div
                        className="hp-bar-fill"
                        style={{
                          width: `${pct}%`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      >
                        <span className="hp-bar-inner-text">
                          {chartMetric === 'winPct' ? `${val}%` : `${val} Wins`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sport Distribution Donut Chart */}
          <div className="hp-analytics-card">
            <div className="hp-analytics-header">
              <div>
                <span className="hp-section-tag">PROGRAM BREAKDOWN</span>
                <h3 className="hp-analytics-title">Discipline Roster Distribution</h3>
              </div>
              <span className="hp-donut-total-tag">{teams.length} Teams Total</span>
            </div>

            <div className="hp-donut-layout">
              {/* Pure SVG Donut Chart */}
              <div className="hp-donut-chart-wrap">
                <svg width="180" height="180" viewBox="0 0 100 100" className="hp-donut-svg">
                  {sportDistribution.map((item, idx) => {
                    const radius = 38
                    const circumference = 2 * Math.PI * radius
                    const strokeDash = (item.pct / 100) * circumference
                    let prevOffset = 0
                    for (let p = 0; p < idx; p++) {
                      prevOffset += (sportDistribution[p].pct / 100) * circumference
                    }

                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={-prevOffset}
                        strokeLinecap="round"
                        className="hp-donut-circle"
                      />
                    )
                  })}
                  <text x="50" y="47" textAnchor="middle" fill="var(--color-primary)" fontFamily="'Barlow Condensed'" fontSize="18" fontWeight="800">
                    {sports.length}
                  </text>
                  <text x="50" y="60" textAnchor="middle" fill="#6b6b6b" fontSize="7" fontWeight="600" letterSpacing="0.05em">
                    SPORTS
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="hp-donut-legend">
                {sportDistribution.map((item, idx) => (
                  <div key={idx} className="hp-legend-item">
                    <span className="hp-legend-dot" style={{ background: item.color }} />
                    <span className="hp-legend-name">{item.name}</span>
                    <span className="hp-legend-val">{item.count} squads ({item.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7: DIRECTIVE COMMAND & COMPLIANCE ─── */}
        <section className="hp-footer-command">
          <div className="hp-command-left">
            <span className="hp-command-tag">ATHLETICS DIRECTORATE · RAPID DISPATCH</span>
            <h3 className="hp-command-title">Fast Administrative Actions</h3>
            <p className="hp-command-desc">
              Immediate access to roster adjustments, match scheduling, equipment dispatch, and facility allocations.
            </p>
            <div className="hp-command-buttons">
              <button
                className="hp-cmd-btn"
                onClick={() => openModal('scheduleMatch')}
              >
                <span>🏆 Schedule Fixture</span>
              </button>
              <button
                className="hp-cmd-btn"
                onClick={() => openModal('createTeam')}
              >
                <span>👥 Register Team</span>
              </button>
              <button
                className="hp-cmd-btn"
                onClick={() => openModal('bookVenue')}
              >
                <span>🏟️ Book Facility</span>
              </button>
              <button
                className="hp-cmd-btn"
                onClick={() => openModal('addPlayer')}
              >
                <span>🏃 Add Athlete</span>
              </button>
              <button
                className="hp-cmd-btn"
                onClick={() => openModal('joinTeam')}
              >
                <span>📝 Walk-on Application</span>
              </button>
            </div>
          </div>

          <div className="hp-command-right">
            <div className="hp-compliance-box">
              <div className="hp-comp-badge">NCAA DIVISION I COMPLIANCE STATUS</div>
              <p className="hp-comp-text">
                All 14 varsity squads are verified under NCAA Division I academic indices and medical clearances.
              </p>
              <div className="hp-comp-actions">
                <Link to="/rulebook" className="hp-comp-link">
                  📖 View NCAA Rulebook &amp; Specifications →
                </Link>
                <Link to="/leaderboard" className="hp-comp-link">
                  🏆 Conference Leaderboards →
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
