import { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from './common/Icons'
import './TopBar.css'

const routeLabels = {
  '/': 'Varsity Dashboard',
  '/teams': 'Team Operations',
  '/players': 'Athletes & Attendance',
  '/matches': 'Match Center & Schedule',
  '/venues': 'Facility Bookings',
  '/leaderboard': 'Conference Standings',
  '/rulebook': 'Sports Rulebook',
  '/equipment': 'Equipment Vault',
}

function TopBar() {
  const location = useLocation()
  const {
    notifications,
    setIsSearchOpen,
    setIsNotifOpen,
    openModal,
  } = useSports()

  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const quickMenuRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target)) {
        setShowQuickMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getPageBreadcrumb = () => {
    const path = location.pathname
    if (path.startsWith('/teams/')) return { root: 'Teams', sub: 'Squad Roster Detail' }
    if (path.startsWith('/players/')) return { root: 'Athletes', sub: 'Player Profile & Eligibility' }
    if (path.startsWith('/matches/')) return { root: 'Matches', sub: 'Fixture Command & Scoreboard' }
    if (path.startsWith('/rulebook/')) return { root: 'Rulebook', sub: 'Sport Discipline Code' }
    return { root: 'Athletic Command', sub: routeLabels[path] || 'Operations' }
  }

  const breadcrumb = getPageBreadcrumb()

  return (
    <header className="topbar">
      {/* Left: Breadcrumbs */}
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <Link to="/" className="topbar-breadcrumb-root">{breadcrumb.root}</Link>
          <span className="topbar-breadcrumb-sep">/</span>
          <span className="topbar-breadcrumb-current">{breadcrumb.sub}</span>
        </div>
      </div>

      {/* Center: Search trigger */}
      <div className="topbar-center">
        <div
          className="topbar-search pv-clickable"
          onClick={() => setIsSearchOpen(true)}
          role="button"
          tabIndex={0}
          title="Search anything (Cmd+K)"
        >
          <span className="topbar-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search teams, athletes, fixtures, equipment... (⌘K)"
            readOnly
          />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="topbar-right">
        <div className="topbar-semester-badge">
          <span className="badge-dot"></span>
          Fall 2025 / Div I
        </div>

        {/* Notifications Button */}
        <button
          className="topbar-icon-btn"
          title="Athletics Notifications"
          onClick={() => setIsNotifOpen(true)}
        >
          🔔
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>

        {/* Quick Create Dropdown */}
        <div className="topbar-quick-actions" ref={quickMenuRef}>
          <button
            className="topbar-create-btn"
            onClick={() => setShowQuickMenu((prev) => !prev)}
          >
            <span className="btn-icon">+</span>
            Action Center
            <span style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
          </button>

          {showQuickMenu && (
            <div className="topbar-quick-dropdown">
              <button
                className="topbar-quick-item"
                onClick={() => {
                  openModal('scheduleMatch')
                  setShowQuickMenu(false)
                }}
              >
                <span className="quick-item-icon">🏆</span>
                <div>
                  <strong>Schedule Fixture</strong>
                  <span>Reserve court & pick teams</span>
                </div>
              </button>

              <button
                className="topbar-quick-item"
                onClick={() => {
                  openModal('createTeam')
                  setShowQuickMenu(false)
                }}
              >
                <span className="quick-item-icon">👥</span>
                <div>
                  <strong>Create New Team</strong>
                  <span>Add varsity squad to directory</span>
                </div>
              </button>

              <button
                className="topbar-quick-item"
                onClick={() => {
                  openModal('joinTeam')
                  setShowQuickMenu(false)
                }}
              >
                <span className="quick-item-icon">📝</span>
                <div>
                  <strong>Athlete Registration</strong>
                  <span>Apply for roster walk-on trial</span>
                </div>
              </button>

              <button
                className="topbar-quick-item"
                onClick={() => {
                  openModal('bookVenue')
                  setShowQuickMenu(false)
                }}
              >
                <span className="quick-item-icon">🏟️</span>
                <div>
                  <strong>Book Venue</strong>
                  <span>Reserve training facility</span>
                </div>
              </button>

              <button
                className="topbar-quick-item"
                onClick={() => {
                  openModal('addPlayer')
                  setShowQuickMenu(false)
                }}
              >
                <span className="quick-item-icon">🏃</span>
                <div>
                  <strong>Add Player</strong>
                  <span>Register player to squad</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="topbar-avatar" title="Director Marcus Vance">
          MV
        </div>
      </div>
    </header>
  )
}

export default TopBar
