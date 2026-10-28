import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from './common/Icons'
import './Sidebar.css'

const navItems = [
  { label: 'Dashboard', iconName: 'dashboard', path: '/' },
  { label: 'Teams', iconName: 'users', path: '/teams' },
  { label: 'Athletes & Attendance', iconName: 'activity', path: '/players' },
  { label: 'Match Center', iconName: 'trophy', path: '/matches' },
  { label: 'Venues & Facilities', iconName: 'map-pin', path: '/venues' },
  { label: 'Leaderboard', iconName: 'trophy', path: '/leaderboard' },
  { label: 'Sports Rulebook', iconName: 'book', path: '/rulebook' },
  { label: 'Equipment Vault', iconName: 'tool', path: '/equipment' },
]

function Sidebar() {
  const location = useLocation()
  const { summaryStats, openModal } = useSports()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="pv-mobile-sidebar-toggle"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        <Icon name={isMobileOpen ? 'x' : 'settings'} size={20} />
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div className="pv-sidebar-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-top">
            <div className="sidebar-logo-icon">PV</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">PlayVault</span>
              <div className="sidebar-brand-badge">
                <span className="sidebar-ncaa-tag">NCAA</span>
              </div>
            </div>
          </div>
          <div className="sidebar-subtitle">Varsity Athletic Command</div>
        </div>

        {/* Quick Launch Action */}
        <div className="sidebar-quick-action">
          <button
            className="sidebar-quick-btn"
            onClick={() => {
              openModal('scheduleMatch')
              setIsMobileOpen(false)
            }}
          >
            <span className="sidebar-quick-plus">+</span>
            <span>Schedule Fixture</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">COMMAND CENTER</div>
          {navItems.map((item, index) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                style={{ animationDelay: `${0.04 + index * 0.03}s` }}
                end={item.path === '/'}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="sidebar-nav-icon">
                  <Icon name={item.iconName} size={18} />
                </span>
                <span className="sidebar-nav-item-text">{item.label}</span>
                {item.path === '/matches' && summaryStats.liveMatches > 0 && (
                  <span className="sidebar-pill sidebar-pill--live">LIVE</span>
                )}
                {item.path === '/teams' && (
                  <span className="sidebar-pill">{summaryStats.activeTeams}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">MV</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Marcus Vance</div>
              <div className="sidebar-user-role">Head of Athletics, Div I</div>
            </div>
            <button
              className="sidebar-user-settings"
              title="Quick Settings / Info"
              onClick={() => alert('PlayVault NCAA Varsity Athletic Command v2.4\nAcademic Year 2024-2025')}
            >
              <Icon name="settings" size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
