import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import Pagination from '../components/common/Pagination'
import useDebounce from '../hooks/useDebounce'
import './PlayersPage.css'

const PAGE_SIZE = 8

export default function PlayersPage() {
  const { sports, teams, players, attendance, saveAttendance, openModal } = useSports()

  const [activeTab, setActiveTab] = useState('directory') // 'directory' | 'attendance'

  // Directory filter states
  const [selectedSport, setSelectedSport] = useState('all')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [minAttendance, setMinAttendance] = useState(0)
  const [page, setPage] = useState(1)

  // Typing updates searchQuery instantly (responsive input); filtering uses
  // the debounced copy so the list only recomputes after a 300ms pause.
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Attendance management states
  const [attDate, setAttDate] = useState(() => new Date().toISOString().split('T')[0])
  const [attTeamId, setAttTeamId] = useState(() => teams[0]?.id || '')
  const [attSessionType, setAttSessionType] = useState('Tactical Training')
  const [attendanceSheet, setAttendanceSheet] = useState({})
  const [attSubmitting, setAttSubmitting] = useState(false)

  // Teams eligible for selected sport filter
  const eligibleTeamsForFilter = useMemo(() => {
    if (selectedSport === 'all') return teams
    return teams.filter((t) => t.sport === selectedSport)
  }, [teams, selectedSport])

  // Filtered player directory
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchSport = selectedSport === 'all' || p.sport === selectedSport
      const matchTeam = selectedTeam === 'all' || p.teamId === selectedTeam
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchRate = (p.attendanceRate || 0) >= minAttendance

      const q = debouncedSearch.toLowerCase().trim()
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)

      return matchSport && matchTeam && matchStatus && matchRate && matchQuery
    })
  }, [players, selectedSport, selectedTeam, statusFilter, minAttendance, debouncedSearch])

  // Jump back to page 1 whenever the filtered result set changes
  useEffect(() => {
    setPage(1)
  }, [selectedSport, selectedTeam, statusFilter, minAttendance, debouncedSearch])

  // Pagination: slice the filtered list for the current page
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedPlayers = filteredPlayers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Players in currently selected attendance team
  const attendanceTeamPlayers = useMemo(() => {
    return players.filter((p) => p.teamId === attTeamId)
  }, [players, attTeamId])

  // Toggle single player attendance status in session sheet
  const handleToggleAttendance = (playerId, newStatus) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [playerId]: newStatus,
    }))
  }

  // Handle Mark All Present
  const handleMarkAllPresent = () => {
    const updated = {}
    attendanceTeamPlayers.forEach((p) => {
      updated[p.id] = 'present'
    })
    setAttendanceSheet(updated)
  }

  // Save attendance sheet
  const handleSaveAttendance = async () => {
    if (attendanceTeamPlayers.length === 0) return

    const records = attendanceTeamPlayers.map((p) => ({
      playerId: p.id,
      status: attendanceSheet[p.id] || 'present',
      notes: 'Session attendance logged',
    }))

    const selectedTeamObj = teams.find((t) => t.id === attTeamId)

    try {
      setAttSubmitting(true)
      await saveAttendance({
        date: attDate,
        teamId: attTeamId,
        sport: selectedTeamObj?.sport || 'varsity',
        sessionType: attSessionType,
        records,
      })
    } finally {
      setAttSubmitting(false)
    }
  }

  return (
    <div className="pl-page">
      <div className="pl-inner">
        {/* Header */}
        <div className="pl-header">
          <div className="pl-header-left">
            <div className="pl-breadcrumb">
              ATHLETIC PERSONNEL <span className="pl-breadcrumb-dot" /> ROSTER & ATTENDANCE
            </div>
            <h1 className="pl-title">Student-Athletes & Attendance Management</h1>
            <p className="pl-subtitle">
              Track student-athlete collegiate eligibility, training participation rates, injury status, and squad call-ups.
            </p>
          </div>
          <div className="pl-header-actions">
            <button
              className="pl-btn pl-btn-gold"
              onClick={() => openModal('addPlayer')}
            >
              + Register Athlete
            </button>
            <button
              className="pl-btn pl-btn-primary"
              onClick={() => openModal('joinTeam')}
            >
              📝 Walk-on Application
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pl-tabs">
          <button
            className={`pl-tab ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            👥 Athlete Directory ({players.length})
          </button>
          <button
            className={`pl-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            📋 Attendance Command & Sessions
          </button>
        </div>

        {activeTab === 'directory' ? (
          <>
            {/* Directory Filter Bar */}
            <div className="pl-filter-card">
              <div className="pl-filter-row-top">
                <div className="pl-search-wrap">
                  <span className="pl-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search athletes by name, position, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="pl-search-clear" onClick={() => setSearchQuery('')}>
                      ✕
                    </button>
                  )}
                </div>

                <div className="pl-filter-selects">
                  <select
                    value={selectedSport}
                    onChange={(e) => {
                      setSelectedSport(e.target.value)
                      setSelectedTeam('all')
                    }}
                  >
                    <option value="all">All Sports</option>
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                  >
                    <option value="all">All Squads</option>
                    {eligibleTeamsForFilter.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="ACTIVE">Active Roster</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="SUSPENDED">Probation / Suspended</option>
                  </select>
                </div>
              </div>

              {/* Attendance Range Slider */}
              <div className="pl-range-row">
                <span className="pl-range-label">
                  MIN ATTENDANCE RATE: <strong>{minAttendance}%</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(parseInt(e.target.value, 10))}
                  className="pl-range-input"
                />
                <span className="pl-results-count">
                  Showing {filteredPlayers.length} of {players.length} registered student-athletes
                </span>
              </div>
            </div>

            {/* Players Table */}
            <div className="pl-table-card">
              {filteredPlayers.length === 0 ? (
                <div className="pl-empty-state">
                  <Icon name="users" size={40} color="var(--text-tertiary)" />
                  <h3>No athletes matched the selected filters</h3>
                  <p>Try lowering the minimum attendance rate or clearing sport filters.</p>
                  <button
                    className="pv-btn pv-btn-ghost"
                    onClick={() => {
                      setSelectedSport('all')
                      setSelectedTeam('all')
                      setStatusFilter('all')
                      setMinAttendance(0)
                      setSearchQuery('')
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="pl-table-wrap">
                  <table className="pl-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student-Athlete</th>
                        <th>Sport Discipline</th>
                        <th>Assigned Team</th>
                        <th>Position</th>
                        <th>Academic Year</th>
                        <th>Attendance Rate</th>
                        <th>Matches Played</th>
                        <th>Eligibility Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPlayers.map((player) => {
                        const team = teams.find((t) => t.id === player.teamId)

                        return (
                          <tr key={player.id}>
                            <td><span className="mono">#{player.jerseyNumber}</span></td>
                            <td>
                              <Link to={`/players/${player.id}`} className="pl-player-cell">
                                <span
                                  className="pl-player-avatar"
                                  style={{ background: player.avatarColor || '#1a3c2a' }}
                                >
                                  {player.avatar}
                                </span>
                                <div>
                                  <strong className="pl-player-name">{player.name}</strong>
                                  <span className="pl-player-email">{player.email}</span>
                                </div>
                              </Link>
                            </td>
                            <td>
                              <span className="pl-sport-badge">{player.sport.toUpperCase()}</span>
                            </td>
                            <td>
                              {team ? (
                                <Link to={`/teams/${team.id}`} className="pl-team-link">
                                  {team.name}
                                </Link>
                              ) : (
                                'Free Agent'
                              )}
                            </td>
                            <td>{player.position}</td>
                            <td>{player.year || 'Sophomore'}</td>
                            <td>
                              <div className="pl-rate-cell">
                                <span
                                  className="pl-rate-text"
                                  style={{
                                    color: player.attendanceRate >= 90 ? 'var(--color-success)' : 'var(--color-warning)',
                                  }}
                                >
                                  {player.attendanceRate}%
                                </span>
                                <div className="pl-rate-bar">
                                  <div
                                    className="pl-rate-bar-fill"
                                    style={{
                                      width: `${player.attendanceRate}%`,
                                      background: player.attendanceRate >= 90 ? 'var(--color-success)' : 'var(--color-warning)',
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td><span className="mono">{player.matchesPlayed || 0}</span></td>
                            <td>
                              <span className="badge badge-success">{player.status}</span>
                            </td>
                            <td>
                              <Link to={`/players/${player.id}`} className="pl-btn-action">
                                View Profile →
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <Pagination
                page={currentPage}
                totalItems={filteredPlayers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : (
          /* ==========================================
             TAB 2: ATTENDANCE MANAGEMENT
             ========================================== */
          <div className="pl-att-section">
            <div className="pl-att-controls-card">
              <div className="pl-att-controls-header">
                <div>
                  <h2>Mark Training / Match Attendance</h2>
                  <p>Log verified athlete attendance for varsity conditioning and tactical drills.</p>
                </div>
                <button
                  className="pv-btn pv-btn-ghost"
                  onClick={handleMarkAllPresent}
                >
                  ✓ Mark All Present
                </button>
              </div>

              <div className="pl-att-selectors-row">
                <div className="pl-att-field">
                  <label>Session Date</label>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                  />
                </div>

                <div className="pl-att-field">
                  <label>Target Squad Roster</label>
                  <select
                    value={attTeamId}
                    onChange={(e) => {
                      setAttTeamId(e.target.value)
                      setAttendanceSheet({})
                    }}
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.sport.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pl-att-field">
                  <label>Session Type</label>
                  <select
                    value={attSessionType}
                    onChange={(e) => setAttSessionType(e.target.value)}
                  >
                    <option value="Tactical Training">Tactical Training</option>
                    <option value="Conditioning & Weightroom">Conditioning & Weightroom</option>
                    <option value="Film & Strategy Review">Film & Strategy Review</option>
                    <option value="Official Match Day">Official Match Day</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Attendance Roster Toggles */}
            <div className="pl-att-roster-card">
              <div className="pl-att-roster-header">
                <h3>Athletes on Selected Squad ({attendanceTeamPlayers.length})</h3>
                <span className="pl-att-session-tag">
                  {attDate} • {attSessionType}
                </span>
              </div>

              {attendanceTeamPlayers.length === 0 ? (
                <div className="pl-empty-roster-att">
                  <p>No players registered to this team yet.</p>
                  <button
                    className="pv-btn pv-btn-primary"
                    onClick={() => openModal('addPlayer', { teamId: attTeamId })}
                  >
                    + Add Player to this Team
                  </button>
                </div>
              ) : (
                <div className="pl-att-list">
                  {attendanceTeamPlayers.map((player) => {
                    const currentStatus = attendanceSheet[player.id] || 'present'

                    return (
                      <div key={player.id} className="pl-att-row">
                        <div className="pl-att-player-info">
                          <span
                            className="pl-player-avatar"
                            style={{ background: player.avatarColor || '#1a3c2a' }}
                          >
                            {player.avatar}
                          </span>
                          <div>
                            <strong>{player.name}</strong>
                            <span>#{player.jerseyNumber} • {player.position}</span>
                          </div>
                        </div>

                        <div className="pl-att-toggles">
                          <button
                            type="button"
                            className={`pl-att-btn pl-att-btn--present ${currentStatus === 'present' ? 'active' : ''}`}
                            onClick={() => handleToggleAttendance(player.id, 'present')}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            className={`pl-att-btn pl-att-btn--late ${currentStatus === 'late' ? 'active' : ''}`}
                            onClick={() => handleToggleAttendance(player.id, 'late')}
                          >
                            ⏱ Late
                          </button>
                          <button
                            type="button"
                            className={`pl-att-btn pl-att-btn--absent ${currentStatus === 'absent' ? 'active' : ''}`}
                            onClick={() => handleToggleAttendance(player.id, 'absent')}
                          >
                            ✕ Absent
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  <div className="pl-att-submit-footer">
                    <button
                      className="pv-btn pv-btn-primary pl-btn-submit-att"
                      onClick={handleSaveAttendance}
                      disabled={attSubmitting}
                    >
                      {attSubmitting ? 'Saving Ledger...' : 'Save & Recalculate Attendance Rates'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance History Log */}
            <div className="pl-att-history-card">
              <h3>Historical Training Sessions Log</h3>
              <div className="pl-att-history-list">
                {attendance.length === 0 ? (
                  <p className="pl-att-empty-hist">No past training sessions recorded.</p>
                ) : (
                  attendance.slice(0, 5).map((session) => {
                    const t = teams.find((item) => item.id === session.teamId)
                    const presentCount = session.records.filter((r) => r.status === 'present').length

                    return (
                      <div key={session.id} className="pl-att-hist-item">
                        <div className="pl-att-hist-date">
                          <strong>{session.date}</strong>
                          <span>{session.sessionType}</span>
                        </div>
                        <div className="pl-att-hist-team">
                          <strong>{t?.name || 'Varsity Squad'}</strong>
                          <span>{session.sport?.toUpperCase()}</span>
                        </div>
                        <div className="pl-att-hist-summary">
                          <span>{presentCount} of {session.records.length} Present</span>
                          <span className="badge badge-success">LOGGED</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
