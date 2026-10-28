import { useState } from 'react'
import { useSports } from '../../context/SportsContext'
import { Icon } from '../common/Icons'
import './NotificationDrawer.css'

export default function NotificationDrawer() {
  const { isNotifOpen, setIsNotifOpen, notifications, markNotifRead, markAllNotifsRead } = useSports()
  const [filter, setFilter] = useState('all') // 'all' | 'unread'

  if (!isNotifOpen) return null

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="pv-notif-backdrop" onClick={() => setIsNotifOpen(false)}>
      <aside className="pv-notif-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="pv-notif-header">
          <div className="pv-notif-header-title">
            <Icon name="bell" size={20} color="var(--color-primary-light)" />
            <h2>Athletics Alerts</h2>
            {unreadCount > 0 && <span className="pv-notif-badge">{unreadCount}</span>}
          </div>
          <button className="pv-notif-close-btn" onClick={() => setIsNotifOpen(false)}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="pv-notif-toolbar">
          <div className="pv-notif-filter-tabs">
            <button
              className={`pv-notif-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`pv-notif-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="pv-notif-mark-all" onClick={markAllAll => markAllNotifsRead()}>
              Mark all read
            </button>
          )}
        </div>

        <div className="pv-notif-list">
          {filteredNotifs.length === 0 ? (
            <div className="pv-notif-empty">
              <Icon name="check" size={32} color="var(--color-success)" />
              <p>You&apos;re all caught up!</p>
              <span>No {filter === 'unread' ? 'unread' : ''} operational alerts.</span>
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                className={`pv-notif-card ${!n.read ? 'pv-notif-card--unread' : ''}`}
                onClick={() => !n.read && markNotifRead(n.id)}
              >
                <div className={`pv-notif-type-icon pv-notif-type-icon--${n.type}`}>
                  {n.type === 'match' && '🏆'}
                  {n.type === 'equipment' && '🔧'}
                  {n.type === 'registration' && '👥'}
                  {n.type === 'venue' && '🏟️'}
                  {(!n.type || n.type === 'system') && '🔔'}
                </div>
                <div className="pv-notif-card-body">
                  <div className="pv-notif-card-header">
                    <span className="pv-notif-card-title">{n.title}</span>
                    <span className="pv-notif-card-time">{n.time}</span>
                  </div>
                  <p className="pv-notif-card-desc">{n.message}</p>
                </div>
                {!n.read && <span className="pv-notif-unread-dot" title="Unread" />}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
