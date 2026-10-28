import { useState, useMemo } from 'react'
import useDebounce from '../hooks/useDebounce'
import { Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import TeamLogo from '../components/common/TeamLogo'
import './TeamsPage.css'

export default function TeamsPage() {
  const { sports, teams, openModal } = useSports()

  const [selectedSport, setSelectedSport] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [sortBy, setSortBy] = useState('seed') // 'seed' | 'winPct' | 'name'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  // Filter and sort teams
  const filteredTeams = useMemo(() => {
    return teams
      .filter((team) => {
        const matchesSport = selectedSport === 'all' || team.sport === selectedSport
        const q = debouncedSearch.toLowerCase().trim()
        const matchesQuery =
          !q ||
          team.name.toLowerCase().includes(q) ||
          team.coach.toLowerCase().includes(q) ||
          team.division.toLowerCase().includes(q)
        return matchesSport && matchesQuery
      })
      .sort((a, b) => {
        if (sortBy === 'winPct') {
          return (parseFloat(b.pct) || 0) - (parseFloat(a.pct) || 0)
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name)
        }
        // default by seed
        const seedA = parseInt(a.seed?.replace('#', ''), 10) || 99
        const seedB = parseInt(b.seed?.replace('#', ''), 10) || 99
        return seedA - seedB
      })
  }, [teams, selectedSport, debouncedSearch, sortBy])

  return (
    <div className="tm-page">
      <div className="tm-inner">
        {/* Header */}
        <div className="tm-header">
          <div className="tm-header-left">
            <div className="tm-breadcrumb">
              VARSITY ATHLETICS <span className="tm-breadcrumb-dot" /> SQUAD DIRECTORY
            </div>
            <h1 className="tm-title">Collegiate Teams & Rosters</h1>
            <p className="tm-subtitle">
              Manage NCAA Division I squads, active rosters, coaching staff accreditation, and tournament seeds across all sports.
            </p>
          </div>
          <div className="tm-header-actions">
            <button
              className="tm-btn tm-btn-gold"
              onClick={() => openModal('createTeam')}
            >
              + Create New Team
            </button>
            <button
              className="tm-btn tm-btn-primary"
              onClick={() => openModal('joinTeam')}
            >
              📝 Join Existing Team
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="tm-toolbar">
          <div className="tm-toolbar-top">
            <div className="tm-search-box">
              <span className="tm-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search teams by name, coach, or division..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="tm-search-clear" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>

            <div className="tm-controls">
              <div className="tm-control-group">
                <span className="tm-control-label">SORT BY:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="seed">Tournament Seed (Asc)</option>
                  <option value="winPct">Win Percentage (Desc)</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>

              <div className="tm-view-toggle">
                <button
                  className={`tm-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Card Grid View"
                >
                  <Icon name="dashboard" size={16} />
                </button>
                <button
                  className={`tm-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table List View"
                >
                  <Icon name="filter" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Sport Filter Chips */}
          <div className="tm-sport-chips">
            <button
              className={`tm-chip ${selectedSport === 'all' ? 'tm-chip--active' : ''}`}
              onClick={() => setSelectedSport('all')}
            >
              All Disciplines ({teams.length})
            </button>
            {sports.map((sp) => {
              const count = teams.filter((t) => t.sport === sp.id).length
              return (
                <button
                  key={sp.id}
                  className={`tm-chip ${selectedSport === sp.id ? 'tm-chip--active' : ''}`}
                  onClick={() => setSelectedSport(sp.id)}
                >
                  <span>{sp.icon}</span>
                  <span>{sp.name} ({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Teams Display: Grid or Table */}
        {filteredTeams.length === 0 ? (
          <div className="tm-empty-state">
            <Icon name="users" size={48} color="var(--text-tertiary)" />
            <h3>No collegiate squads found</h3>
            <p>Try refining your search keyword or selecting a different sport filter.</p>
            <button
              className="pv-btn pv-btn-primary"
              onClick={() => {
                setSelectedSport('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="tm-grid">
            {filteredTeams.map((team) => (
              <div key={team.id} className="tm-card">
                <div className="tm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TeamLogo team={team} size="md" />
                    <div>
                      <h3 className="tm-card-name">{team.name}</h3>
                      <div className="tm-card-meta">
                        <span className="tm-card-sport">{team.sport.toUpperCase()}</span>
                        <span className="tm-card-dot">•</span>
                        <span>{team.division}</span>
                      </div>
                    </div>
                  </div>
                  <div className="tm-card-badges">
                    <span className="tm-seed-badge">{team.seed} SEED</span>
                    <span className={`tm-status-badge tm-status-badge--${team.statusType || 'active'}`}>
                      {team.status}
                    </span>
                  </div>
                </div>

                <div className="tm-card-record-row">
                  <div>
                    <span className="tm-record-label">Season Record</span>
                    <div className="tm-record-val">
                      {team.record} <span className="tm-record-pct">({team.pct} PCT)</span>
                    </div>
                  </div>
                  <div className="tm-wl-bars">
                    {(team.wl || [1, 1, 0, 1]).slice(-10).map((w, i) => (
                      <div
                        key={i}
                        className={`tm-wl-bar ${w === 1 ? 'tm-wl-bar--win' : w === 0 ? 'tm-wl-bar--loss' : 'tm-wl-bar--draw'}`}
                        style={{ height: `${w === 1 ? 22 : 10}px` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="tm-card-info-grid">
                  <div className="tm-info-item">
                    <span className="tm-info-label">Head Coach</span>
                    <span className="tm-info-val">{team.coach}</span>
                  </div>
                  <div className="tm-info-item">
                    <span className="tm-info-label">Captain</span>
                    <span className="tm-info-val">{team.captain || 'Nominated'}</span>
                  </div>
                  <div className="tm-info-item">
                    <span className="tm-info-label">Roster Capacity</span>
                    <span className="tm-info-val">{team.activeAthletes || `${team.rosterSize} Athletes`}</span>
                  </div>
                  <div className="tm-info-item">
                    <span className="tm-info-label">Upcoming Fixture</span>
                    <span className="tm-info-val tm-info-val--match">{team.matchTime || 'TBD'}</span>
                  </div>
                </div>

                <div className="tm-card-footer">
                  <Link to={`/teams/${team.id}`} className="tm-card-btn-view">
                    View Full Roster & Stats →
                  </Link>
                  <button
                    className="tm-card-btn-join"
                    onClick={() => openModal('joinTeam', { teamId: team.id, sport: team.sport })}
                  >
                    Apply Walk-On
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tm-table-card">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Seed</th>
                  <th>Squad Name</th>
                  <th>Sport</th>
                  <th>Division</th>
                  <th>Coach</th>
                  <th>Record (W-L)</th>
                  <th>Win %</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td><strong>{team.seed}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TeamLogo team={team} size="xs" />
                        <Link to={`/teams/${team.id}`} className="tm-table-link">
                          {team.name}
                        </Link>
                      </div>
                    </td>
                    <td><span className="tm-table-sport">{team.sport.toUpperCase()}</span></td>
                    <td>{team.division}</td>
                    <td>{team.coach}</td>
                    <td><span className="mono">{team.record}</span></td>
                    <td><span className="mono" style={{ fontWeight: 700 }}>{team.pct}</span></td>
                    <td>
                      <span className={`tm-status-badge tm-status-badge--${team.statusType || 'active'}`}>
                        {team.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/teams/${team.id}`} className="tm-table-btn">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
