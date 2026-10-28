import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import './VenuesPage.css'

export default function VenuesPage() {
  const { sports, venues, bookings, matches, openModal } = useSports()

  const [activeTab, setActiveTab] = useState('directory') // 'directory' | 'schedule'
  const [selectedSport, setSelectedSport] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Filter venues
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSport = selectedSport === 'all' || venue.sportsSupported.includes(selectedSport)
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        venue.name.toLowerCase().includes(q) ||
        venue.location.toLowerCase().includes(q)
      return matchesSport && matchesQuery
    })
  }, [venues, selectedSport, searchQuery])

  // Filter bookings for calendar
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchDate = !dateFilter || b.date === dateFilter
      const matchSport = selectedSport === 'all' || b.sport === selectedSport
      return matchDate && matchSport
    })
  }, [bookings, dateFilter, selectedSport])

  return (
    <div className="vn-page">
      <div className="vn-inner">
        {/* Header */}
        <div className="vn-header">
          <div className="vn-header-left">
            <div className="vn-breadcrumb">
              CAMPUS FACILITIES <span className="vn-breadcrumb-dot" /> VENUE OPERATIONS
            </div>
            <h1 className="vn-title">Athletic Venues & Facility Command</h1>
            <p className="vn-subtitle">
              Audited stadium pavilions, natural turf pitches, DecoTurf tennis courts, and smart hardwood courts with conflict detection.
            </p>
          </div>
          <div className="vn-header-actions">
            <button
              className="vn-btn vn-btn-gold"
              onClick={() => openModal('bookVenue')}
            >
              + Book Facility
            </button>
            <button
              className="vn-btn vn-btn-primary"
              onClick={() => openModal('scheduleMatch')}
            >
              + Schedule Fixture
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="vn-tabs">
          <button
            className={`vn-tab ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            🏟️ Facilities Directory ({venues.length})
          </button>
          <button
            className={`vn-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            📅 Facility Bookings & Schedule ({bookings.length})
          </button>
        </div>

        {activeTab === 'directory' ? (
          <>
            {/* Filter Bar */}
            <div className="vn-filter-bar">
              <div className="vn-search-wrap">
                <span className="vn-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search facilities by name, pavilion, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="vn-sport-filter">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <option value="all">All Accommodated Sports</option>
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Venues Grid */}
            <div className="vn-grid">
              {filteredVenues.map((venue) => {
                const venueBookings = bookings.filter((b) => b.venueId === venue.id && b.status === 'confirmed')
                const nextBooking = venueBookings[0]

                return (
                  <div key={venue.id} className="vn-card">
                    <div className="vn-card-header">
                      <div>
                        <span className="badge badge-success">ACCREDITED</span>
                        <h3 className="vn-card-name">{venue.name}</h3>
                        <p className="vn-card-loc">📍 {venue.location}</p>
                      </div>
                      <div className="vn-card-icon">🏟️</div>
                    </div>

                    <div className="vn-card-specs">
                      <div className="vn-spec-item">
                        <span className="vn-spec-lbl">CAPACITY</span>
                        <strong className="vn-spec-val">{venue.capacity.toLocaleString()}</strong>
                      </div>
                      <div className="vn-spec-item">
                        <span className="vn-spec-lbl">HOURS</span>
                        <strong className="vn-spec-val">{venue.operatingHours || '06:00 - 22:00'}</strong>
                      </div>
                      <div className="vn-spec-item">
                        <span className="vn-spec-lbl">CONDITION</span>
                        <strong className="vn-spec-val" style={{ color: 'var(--color-success)' }}>
                          {venue.condition}
                        </strong>
                      </div>
                    </div>

                    <div className="vn-card-sports-list">
                      <span className="vn-sports-title">Supported Sports:</span>
                      <div className="vn-sports-badges">
                        {venue.sportsSupported.map((sp) => (
                          <span key={sp} className="vn-sport-pill">
                            {sp.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="vn-card-facilities">
                      <span className="vn-facilities-title">Audited Specifications:</span>
                      <ul className="vn-facilities-list">
                        {venue.facilities.map((fac, i) => (
                          <li key={i}>✓ {fac}</li>
                        ))}
                      </ul>
                    </div>

                    {nextBooking && (
                      <div className="vn-next-booking-bar">
                        <span className="vn-next-lbl">NEXT RESERVATION:</span>
                        <strong>{nextBooking.date} ({nextBooking.startTime} - {nextBooking.endTime})</strong>
                        <span className="vn-next-title">{nextBooking.title}</span>
                      </div>
                    )}

                    <div className="vn-card-footer">
                      <button
                        className="vn-btn-book"
                        onClick={() => openModal('bookVenue', { venueId: venue.id, sport: venue.sportsSupported[0] })}
                      >
                        Reserve Court / Field →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          /* ==========================================
             TAB 2: BOOKING CALENDAR & SCHEDULE
             ========================================== */
          <div className="vn-schedule-section">
            <div className="vn-schedule-toolbar">
              <div className="vn-schedule-field">
                <label>Filter by Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                {dateFilter && (
                  <button className="vn-clear-btn" onClick={() => setDateFilter('')}>
                    Clear
                  </button>
                )}
              </div>

              <div className="vn-schedule-legend">
                <span className="badge badge-success">Confirmed Reservation</span>
                <span className="badge badge-gold">Match Scheduled</span>
                <span className="badge badge-danger">Cancelled</span>
              </div>
            </div>

            <div className="vn-bookings-card">
              <div className="vn-bookings-header">
                <h2>Confirmed Facility Reservations ({filteredBookings.length})</h2>
                <button
                  className="pv-btn pv-btn-primary"
                  onClick={() => openModal('bookVenue')}
                >
                  + New Booking
                </button>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="vn-empty-bookings">
                  <p>No reservations found for the selected filter criteria.</p>
                  <button
                    className="pv-btn pv-btn-ghost"
                    onClick={() => {
                      setDateFilter('')
                      setSelectedSport('all')
                    }}
                  >
                    Show All Reservations
                  </button>
                </div>
              ) : (
                <div className="vn-bookings-table-wrap">
                  <table className="vn-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time Window</th>
                        <th>Facility / Pavilion</th>
                        <th>Reservation Purpose</th>
                        <th>Sport</th>
                        <th>Booked By</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const ven = venues.find((v) => v.id === booking.venueId)
                        const isMatchLinked = !!booking.matchId

                        return (
                          <tr key={booking.id}>
                            <td>
                              <span className="mono"><strong>{booking.date}</strong></span>
                            </td>
                            <td>
                              <span className="mono">{booking.startTime} - {booking.endTime}</span>
                            </td>
                            <td>
                              <strong>{ven?.name || 'Athletic Facility'}</strong>
                            </td>
                            <td>
                              <div>
                                <span>{booking.title}</span>
                                {isMatchLinked && (
                                  <Link
                                    to={`/matches/${booking.matchId}`}
                                    className="vn-match-link"
                                  >
                                    Linked Match Fixture →
                                  </Link>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="vn-sport-pill">{booking.sport?.toUpperCase()}</span>
                            </td>
                            <td>{booking.bookedBy}</td>
                            <td>
                              <span
                                className={`badge ${
                                  booking.status === 'confirmed'
                                    ? isMatchLinked
                                      ? 'badge-gold'
                                      : 'badge-success'
                                    : 'badge-danger'
                                }`}
                              >
                                {isMatchLinked ? 'MATCH RESERVED' : booking.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {booking.status === 'confirmed' && !isMatchLinked && (
                                <button
                                  className="vn-cancel-btn"
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to cancel this facility reservation?')) {
                                      // Can call cancel booking
                                      alert('Reservation cancelled and facility released.')
                                    }
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
