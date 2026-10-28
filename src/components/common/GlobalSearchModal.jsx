import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSports } from '../../context/SportsContext'
import { Icon } from './Icons'
import './GlobalSearchModal.css'

export default function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, searchResults } = useSports()
  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, setIsSearchOpen])

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isSearchOpen])

  if (!isSearchOpen) return null

  const hasResults =
    searchResults.teams.length > 0 ||
    searchResults.players.length > 0 ||
    searchResults.matches.length > 0 ||
    searchResults.equipment.length > 0 ||
    searchResults.venues.length > 0

  const handleSelect = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="pv-search-overlay" onClick={() => setIsSearchOpen(false)}>
      <div className="pv-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pv-search-header">
          <Icon name="search" size={20} color="var(--color-primary-light)" />
          <input
            ref={inputRef}
            type="text"
            className="pv-search-input-field"
            placeholder="Search teams, varsity athletes, fixtures, equipment, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="pv-search-esc-btn" onClick={() => setIsSearchOpen(false)}>
            ESC
          </button>
        </div>

        <div className="pv-search-results">
          {!searchQuery.trim() ? (
            <div className="pv-search-empty-prompt">
              <span>Type a keyword or press <strong>ESC</strong> to dismiss.</span>
              <div className="pv-search-quick-tags">
                <span onClick={() => setSearchQuery('Tigers')}>State Tigers</span>
                <span onClick={() => setSearchQuery('Soccer')}>Soccer</span>
                <span onClick={() => setSearchQuery('Basketball')}>Basketball</span>
                <span onClick={() => setSearchQuery('Pavilion')}>Pavilion Court</span>
                <span onClick={() => setSearchQuery('Vance')}>Marcus Vance</span>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="pv-search-no-results">
              <Icon name="alert" size={24} color="var(--text-tertiary)" />
              <p>No athletic records found matching &ldquo;{searchQuery}&rdquo;</p>
              <span>Try searching by team name, sport, athlete, or equipment item.</span>
            </div>
          ) : (
            <div className="pv-search-sections">
              {/* Teams */}
              {searchResults.teams.length > 0 && (
                <div className="pv-search-group">
                  <div className="pv-search-group-title">Teams ({searchResults.teams.length})</div>
                  {searchResults.teams.slice(0, 4).map((team) => (
                    <Link
                      key={team.id}
                      to={`/teams/${team.id}`}
                      className="pv-search-item"
                      onClick={handleSelect}
                    >
                      <div className="pv-search-item-icon">👥</div>
                      <div className="pv-search-item-info">
                        <span className="pv-search-item-name">{team.name}</span>
                        <span className="pv-search-item-sub">
                          {team.sport.toUpperCase()} • {team.division} • Coach: {team.coach}
                        </span>
                      </div>
                      <span className="pv-search-badge">{team.seed}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Players */}
              {searchResults.players.length > 0 && (
                <div className="pv-search-group">
                  <div className="pv-search-group-title">Athletes ({searchResults.players.length})</div>
                  {searchResults.players.slice(0, 4).map((player) => (
                    <Link
                      key={player.id}
                      to={`/players/${player.id}`}
                      className="pv-search-item"
                      onClick={handleSelect}
                    >
                      <div className="pv-search-item-avatar">{player.avatar}</div>
                      <div className="pv-search-item-info">
                        <span className="pv-search-item-name">{player.name}</span>
                        <span className="pv-search-item-sub">
                          #{player.jerseyNumber} • {player.position} ({player.sport.toUpperCase()})
                        </span>
                      </div>
                      <span className="pv-search-badge-rate">{player.attendanceRate}% Attendance</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Matches */}
              {searchResults.matches.length > 0 && (
                <div className="pv-search-group">
                  <div className="pv-search-group-title">Fixtures & Matches ({searchResults.matches.length})</div>
                  {searchResults.matches.slice(0, 4).map((match) => (
                    <Link
                      key={match.id}
                      to={`/matches/${match.id}`}
                      className="pv-search-item"
                      onClick={handleSelect}
                    >
                      <div className="pv-search-item-icon">🏆</div>
                      <div className="pv-search-item-info">
                        <span className="pv-search-item-name">
                          {match.tag || `${match.sport.toUpperCase()} Match`}
                        </span>
                        <span className="pv-search-item-sub">
                          Date: {match.date} • {match.time} • Status: {match.status.toUpperCase()}
                        </span>
                      </div>
                      <span className={`pv-search-status pv-search-status--${match.status}`}>
                        {match.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Equipment */}
              {searchResults.equipment.length > 0 && (
                <div className="pv-search-group">
                  <div className="pv-search-group-title">Equipment ({searchResults.equipment.length})</div>
                  {searchResults.equipment.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      to="/equipment"
                      className="pv-search-item"
                      onClick={handleSelect}
                    >
                      <div className="pv-search-item-icon">🔧</div>
                      <div className="pv-search-item-info">
                        <span className="pv-search-item-name">{item.name}</span>
                        <span className="pv-search-item-sub">
                          {item.sport.toUpperCase()} • {item.storageLocation}
                        </span>
                      </div>
                      <span className="pv-search-badge-qty">
                        {item.availableQuantity} of {item.totalQuantity} Available
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Venues */}
              {searchResults.venues.length > 0 && (
                <div className="pv-search-group">
                  <div className="pv-search-group-title">Venues ({searchResults.venues.length})</div>
                  {searchResults.venues.slice(0, 3).map((venue) => (
                    <Link
                      key={venue.id}
                      to="/venues"
                      className="pv-search-item"
                      onClick={handleSelect}
                    >
                      <div className="pv-search-item-icon">🏟️</div>
                      <div className="pv-search-item-info">
                        <span className="pv-search-item-name">{venue.name}</span>
                        <span className="pv-search-item-sub">
                          Cap: {venue.capacity.toLocaleString()} • {venue.location}
                        </span>
                      </div>
                      <span className="pv-search-badge">{venue.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
