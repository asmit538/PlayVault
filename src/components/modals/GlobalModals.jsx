import { useState, useMemo } from 'react'
import { useSports } from '../../context/SportsContext'
import Modal from '../common/Modal'
import { todayISO } from '../../utils/dateUtils'
import './GlobalModals.css'

export default function GlobalModals() {
  const {
    activeModal,
    closeModal,
    modalProps,
    sports,
    teams,
    players,
    venues,
    equipment,
    createTeam,
    createPlayer,
    scheduleMatch,
    updateMatchResult,
    createVenueBooking,
    issueEquipment,
    submitRegistration,
  } = useSports()

  // Form states with local control
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Clear errors when typing
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // ==========================================
  // MODAL 1: SCHEDULE MATCH
  // ==========================================
  if (activeModal === 'scheduleMatch') {
    const selectedSport = formData.sport || sports[0]?.id || 'basketball'
    const filteredTeams = teams.filter((t) => t.sport === selectedSport)
    const filteredVenues = venues.filter((v) => v.sportsSupported.includes(selectedSport))

    const handleSubmit = async (e) => {
      e.preventDefault()
      const errors = {}
      if (!formData.teamAId) errors.teamAId = 'Please select Home Team'
      if (!formData.teamBId) errors.teamBId = 'Please select Away Team'
      if (formData.teamAId && formData.teamAId === formData.teamBId) {
        errors.teamBId = 'Team A and Team B cannot be the same squad'
      }
      if (!formData.date) errors.date = 'Match date is required'
      else if (formData.date < todayISO()) errors.date = 'Match date cannot be in the past'
      if (!formData.time) errors.time = 'Match start time is required'
      if (!formData.venueId) errors.venueId = 'Please select an accredited venue'

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      try {
        setSubmitting(true)
        await scheduleMatch({
          sport: selectedSport,
          teamAId: formData.teamAId,
          teamBId: formData.teamBId,
          date: formData.date,
          time: formData.time,
          endTime: formData.endTime || 'Match Duration',
          venueId: formData.venueId,
          tag: formData.tag || 'Varsity League Fixture',
          notes: formData.notes || '',
        })
        closeModal()
        setFormData({})
      } catch (err) {
        setFormErrors({ general: err.message })
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Modal
        isOpen={true}
        onClose={closeModal}
        title="Schedule Varsity Fixture"
        subtitle="Reserve official court/field, configure referees, and lock competing rosters."
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit} className="pv-form">
          {formErrors.general && <div className="pv-form-alert">{formErrors.general}</div>}

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Sport Discipline *</label>
              <select
                value={selectedSport}
                onChange={(e) => {
                  handleInputChange('sport', e.target.value)
                  handleInputChange('teamAId', '')
                  handleInputChange('teamBId', '')
                }}
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pv-form-group">
              <label>Match Competition Tag</label>
              <input
                type="text"
                placeholder="e.g. Conference Semifinal"
                value={formData.tag || ''}
                onChange={(e) => handleInputChange('tag', e.target.value)}
              />
            </div>
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Team A (Home) *</label>
              <select
                value={formData.teamAId || ''}
                onChange={(e) => handleInputChange('teamAId', e.target.value)}
                className={formErrors.teamAId ? 'input-error' : ''}
              >
                <option value="">Select Home Team</option>
                {filteredTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.division})
                  </option>
                ))}
              </select>
              {formErrors.teamAId && <span className="pv-form-error">{formErrors.teamAId}</span>}
            </div>

            <div className="pv-form-group">
              <label>Team B (Away) *</label>
              <select
                value={formData.teamBId || ''}
                onChange={(e) => handleInputChange('teamBId', e.target.value)}
                className={formErrors.teamBId ? 'input-error' : ''}
              >
                <option value="">Select Away Team</option>
                {filteredTeams
                  .filter((t) => t.id !== formData.teamAId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.division})
                    </option>
                  ))}
              </select>
              {formErrors.teamBId && <span className="pv-form-error">{formErrors.teamBId}</span>}
            </div>
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Match Date *</label>
              <input
                type="date"
                min={todayISO()}
                value={formData.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={formErrors.date ? 'input-error' : ''}
              />
              {formErrors.date && <span className="pv-form-error">{formErrors.date}</span>}
            </div>

            <div className="pv-form-group">
              <label>Start Time *</label>
              <input
                type="text"
                placeholder="e.g. 7:00 PM EST"
                value={formData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={formErrors.time ? 'input-error' : ''}
              />
              {formErrors.time && <span className="pv-form-error">{formErrors.time}</span>}
            </div>
          </div>

          <div className="pv-form-group">
            <label>Accredited Athletic Venue *</label>
            <select
              value={formData.venueId || ''}
              onChange={(e) => handleInputChange('venueId', e.target.value)}
              className={formErrors.venueId ? 'input-error' : ''}
            >
              <option value="">Select Official Venue</option>
              {filteredVenues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Cap: {v.capacity.toLocaleString()}) • {v.location}
                </option>
              ))}
            </select>
            {formErrors.venueId && <span className="pv-form-error">{formErrors.venueId}</span>}
          </div>

          <div className="pv-form-group">
            <label>Special Instructions / Referee Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. NCAA ball caliber checked, live ESPN+ feed confirmed..."
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div className="pv-form-actions">
            <button type="button" className="pv-btn pv-btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="pv-btn pv-btn-primary" disabled={submitting}>
              {submitting ? 'Locking Fixture...' : 'Schedule Fixture & Reserve Venue'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // ==========================================
  // MODAL 2: CREATE NEW TEAM
  // ==========================================
  if (activeModal === 'createTeam') {
    const handleSubmit = async (e) => {
      e.preventDefault()
      const errors = {}
      if (!formData.name?.trim()) errors.name = 'Team name is required'
      if (!formData.sport) errors.sport = 'Please select a sport discipline'
      if (!formData.coach?.trim()) errors.coach = 'Head Coach name is required'

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      try {
        setSubmitting(true)
        await createTeam({
          name: formData.name,
          sport: formData.sport,
          division: formData.division || 'Atlantic Div I',
          coach: formData.coach,
          captain: formData.captain || 'To be nominated',
          rosterSize: formData.rosterSize || 15,
          description: formData.description || '',
          avatarColors: ['#1a3c2a', '#c8972e', '#2980b9'],
        })
        closeModal()
        setFormData({})
      } catch (err) {
        setFormErrors({ general: err.message })
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Modal
        isOpen={true}
        onClose={closeModal}
        title="Register New Collegiate Team"
        subtitle="Establish an official varsity or club athletic squad in the athletic ledger."
        maxWidth="580px"
      >
        <form onSubmit={handleSubmit} className="pv-form">
          {formErrors.general && <div className="pv-form-alert">{formErrors.general}</div>}

          <div className="pv-form-group">
            <label>Squad / Team Name *</label>
            <input
              type="text"
              placeholder="e.g. Coastal Thunder"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="pv-form-error">{formErrors.name}</span>}
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Sport Discipline *</label>
              <select
                value={formData.sport || ''}
                onChange={(e) => handleInputChange('sport', e.target.value)}
                className={formErrors.sport ? 'input-error' : ''}
              >
                <option value="">Select Sport</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
              {formErrors.sport && <span className="pv-form-error">{formErrors.sport}</span>}
            </div>

            <div className="pv-form-group">
              <label>Collegiate Division</label>
              <select
                value={formData.division || 'Atlantic Div I'}
                onChange={(e) => handleInputChange('division', e.target.value)}
              >
                <option value="Atlantic Div I">Atlantic Div I</option>
                <option value="National Div I">National Div I</option>
                <option value="Northern Conf">Northern Conf</option>
                <option value="Coastal Dev">Coastal Dev</option>
                <option value="Intercollegiate Club">Intercollegiate Club</option>
              </select>
            </div>
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Head Coach Name *</label>
              <input
                type="text"
                placeholder="e.g. Marcus Peterson"
                value={formData.coach || ''}
                onChange={(e) => handleInputChange('coach', e.target.value)}
                className={formErrors.coach ? 'input-error' : ''}
              />
              {formErrors.coach && <span className="pv-form-error">{formErrors.coach}</span>}
            </div>

            <div className="pv-form-group">
              <label>Team Captain (Initial)</label>
              <input
                type="text"
                placeholder="e.g. Trevor Hall"
                value={formData.captain || ''}
                onChange={(e) => handleInputChange('captain', e.target.value)}
              />
            </div>
          </div>

          <div className="pv-form-group">
            <label>Roster Capacity Limit</label>
            <input
              type="number"
              min="5"
              max="60"
              value={formData.rosterSize || 15}
              onChange={(e) => handleInputChange('rosterSize', e.target.value)}
            />
          </div>

          <div className="pv-form-group">
            <label>Program Mission & Squad Overview</label>
            <textarea
              rows={2}
              placeholder="Describe program philosophy and athletic objectives..."
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="pv-form-actions">
            <button type="button" className="pv-btn pv-btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="pv-btn pv-btn-primary" disabled={submitting}>
              {submitting ? 'Creating Team...' : 'Create Team & Open Roster'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // ==========================================
  // MODAL 3: JOIN EXISTING TEAM (REGISTRATION)
  // ==========================================
  if (activeModal === 'joinTeam') {
    const selectedSport = formData.sport || modalProps.sport || sports[0]?.id || 'basketball'
    const availableTeams = teams.filter((t) => t.sport === selectedSport)

    const handleSubmit = async (e) => {
      e.preventDefault()
      const errors = {}
      if (!formData.applicantName?.trim()) errors.applicantName = 'Athlete name is required'
      if (!formData.email?.trim() || !formData.email.includes('@')) errors.email = 'Valid university email required'
      if (!formData.teamId) errors.teamId = 'Please select a team to join'

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      try {
        setSubmitting(true)
        await submitRegistration({
          type: 'join_team',
          applicantName: formData.applicantName,
          email: formData.email,
          studentId: formData.studentId || 'STU-NEW',
          sport: selectedSport,
          teamId: formData.teamId,
          position: formData.position || 'Walk-On Trial',
          experienceYears: formData.experienceYears || '2',
          notes: formData.notes || '',
        })
        closeModal()
        setFormData({})
      } catch (err) {
        setFormErrors({ general: err.message })
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Modal
        isOpen={true}
        onClose={closeModal}
        title="Varsity Roster Application"
        subtitle="Apply to walk-on or transfer into an active collegiate team roster."
        maxWidth="560px"
      >
        <form onSubmit={handleSubmit} className="pv-form">
          {formErrors.general && <div className="pv-form-alert">{formErrors.general}</div>}

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Sport Discipline *</label>
              <select
                value={selectedSport}
                onChange={(e) => {
                  handleInputChange('sport', e.target.value)
                  handleInputChange('teamId', '')
                }}
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pv-form-group">
              <label>Target Team *</label>
              <select
                value={formData.teamId || modalProps.teamId || ''}
                onChange={(e) => handleInputChange('teamId', e.target.value)}
                className={formErrors.teamId ? 'input-error' : ''}
              >
                <option value="">Select Team</option>
                {availableTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.division})
                  </option>
                ))}
              </select>
              {formErrors.teamId && <span className="pv-form-error">{formErrors.teamId}</span>}
            </div>
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Athlete Full Name *</label>
              <input
                type="text"
                placeholder="e.g. David Vance"
                value={formData.applicantName || ''}
                onChange={(e) => handleInputChange('applicantName', e.target.value)}
                className={formErrors.applicantName ? 'input-error' : ''}
              />
              {formErrors.applicantName && <span className="pv-form-error">{formErrors.applicantName}</span>}
            </div>

            <div className="pv-form-group">
              <label>University Email *</label>
              <input
                type="email"
                placeholder="d.vance@athletics.edu"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={formErrors.email ? 'input-error' : ''}
              />
              {formErrors.email && <span className="pv-form-error">{formErrors.email}</span>}
            </div>
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Target Position / Role</label>
              <input
                type="text"
                placeholder="e.g. Shooting Guard / Center Back"
                value={formData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
              />
            </div>

            <div className="pv-form-group">
              <label>Competitive Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.experienceYears || 2}
                onChange={(e) => handleInputChange('experienceYears', e.target.value)}
              />
            </div>
          </div>

          <div className="pv-form-group">
            <label>Athletic Accolades / Coach Endorsement</label>
            <textarea
              rows={2}
              placeholder="Detail high school/club achievements, sprint times, Dean's clearance..."
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div className="pv-form-actions">
            <button type="button" className="pv-btn pv-btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="pv-btn pv-btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application to Coaching Staff'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // ==========================================
  // MODAL 4: BOOK ATHLETIC VENUE
  // ==========================================
  if (activeModal === 'bookVenue') {
    const selectedVenueId = formData.venueId || modalProps.venueId || venues[0]?.id
    const currentVenue = venues.find((v) => v.id === selectedVenueId)

    const handleSubmit = async (e) => {
      e.preventDefault()
      const errors = {}
      if (!formData.title?.trim()) errors.title = 'Reservation purpose/title required'
      if (!formData.date) errors.date = 'Date is required'
      if (!formData.startTime) errors.startTime = 'Start time required'
      if (!formData.endTime) errors.endTime = 'End time required'
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        errors.endTime = 'End time must be after start time'
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      try {
        setSubmitting(true)
        await createVenueBooking({
          venueId: selectedVenueId,
          title: formData.title,
          sport: formData.sport || currentVenue?.sportsSupported[0] || 'varsity',
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          bookedBy: formData.bookedBy || 'Athletics Command Desk',
          notes: formData.notes || '',
        })
        closeModal()
        setFormData({})
      } catch (err) {
        setFormErrors({ general: err.message })
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Modal
        isOpen={true}
        onClose={closeModal}
        title="Reserve Athletic Facility"
        subtitle="Book court time, track lanes, or natural turf pitch with automated conflict detection."
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit} className="pv-form">
          {formErrors.general && <div className="pv-form-alert">{formErrors.general}</div>}

          <div className="pv-form-group">
            <label>Select Facility / Pavilion *</label>
            <select
              value={selectedVenueId}
              onChange={(e) => handleInputChange('venueId', e.target.value)}
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Cap: {v.capacity.toLocaleString()}) • {v.location}
                </option>
              ))}
            </select>
          </div>

          <div className="pv-form-group">
            <label>Booking Title / Purpose *</label>
            <input
              type="text"
              placeholder="e.g. Men's Basketball Shootaround & Tactical Video Review"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={formErrors.title ? 'input-error' : ''}
            />
            {formErrors.title && <span className="pv-form-error">{formErrors.title}</span>}
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Discipline / Sport</label>
              <select
                value={formData.sport || currentVenue?.sportsSupported[0] || ''}
                onChange={(e) => handleInputChange('sport', e.target.value)}
              >
                {currentVenue?.sportsSupported.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="pv-form-group">
              <label>Reservation Date *</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={formErrors.date ? 'input-error' : ''}
              />
              {formErrors.date && <span className="pv-form-error">{formErrors.date}</span>}
            </div>
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Start Time (24h) *</label>
              <input
                type="time"
                value={formData.startTime || '14:00'}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={formErrors.startTime ? 'input-error' : ''}
              />
              {formErrors.startTime && <span className="pv-form-error">{formErrors.startTime}</span>}
            </div>

            <div className="pv-form-group">
              <label>End Time (24h) *</label>
              <input
                type="time"
                value={formData.endTime || '16:00'}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={formErrors.endTime ? 'input-error' : ''}
              />
              {formErrors.endTime && <span className="pv-form-error">{formErrors.endTime}</span>}
            </div>
          </div>

          <div className="pv-form-group">
            <label>Authorized Staff / Coach Contact</label>
            <input
              type="text"
              placeholder="e.g. Coach David Kalu (Varsity Staff)"
              value={formData.bookedBy || ''}
              onChange={(e) => handleInputChange('bookedBy', e.target.value)}
            />
          </div>

          <div className="pv-form-actions">
            <button type="button" className="pv-btn pv-btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="pv-btn pv-btn-primary" disabled={submitting}>
              {submitting ? 'Verifying Availability...' : 'Confirm Facility Booking'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // ==========================================
  // MODAL 5: RECORD MATCH RESULT
  // ==========================================
  if (activeModal === 'recordResult') {
    const match = modalProps.match
    if (!match) return null

    const teamA = teams.find((t) => t.id === match.teamAId)
    const teamB = teams.find((t) => t.id === match.teamBId)

    const handleSubmit = async (e) => {
      e.preventDefault()
      const errors = {}
      if (formData.scoreA === undefined || formData.scoreA === '') errors.scoreA = 'Enter score for Team A'
      if (formData.scoreB === undefined || formData.scoreB === '') errors.scoreB = 'Enter score for Team B'

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      const scoreNumA = Number(formData.scoreA)
      const scoreNumB = Number(formData.scoreB)
      const isDraw = scoreNumA === scoreNumB
      const winnerId = isDraw ? null : scoreNumA > scoreNumB ? match.teamAId : match.teamBId
      const winnerName = isDraw ? 'Draw' : scoreNumA > scoreNumB ? teamA?.name : teamB?.name

      try {
        setSubmitting(true)
        await updateMatchResult(match.id, {
          scoreA: formData.scoreA,
          scoreB: formData.scoreB,
          isDraw,
          winnerId,
          sportScoreSummary: isDraw
            ? `Draw ${scoreNumA}-${scoreNumB}`
            : `${winnerName} won ${scoreNumA}-${scoreNumB}`,
          notes: formData.notes || '',
        })
        closeModal()
        setFormData({})
      } catch (err) {
        setFormErrors({ general: err.message })
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Modal
        isOpen={true}
        onClose={closeModal}
        title="Record Official Match Result"
        subtitle={`Verify final score for ${teamA?.name || 'Team A'} vs ${teamB?.name || 'Team B'}.`}
        maxWidth="540px"
      >
        <form onSubmit={handleSubmit} className="pv-form">
          {formErrors.general && <div className="pv-form-alert">{formErrors.general}</div>}

          <div className="pv-result-teams-row">
            <div className="pv-result-box">
              <span className="pv-result-team-name">{teamA?.name}</span>
              <span className="pv-result-team-tag">Home</span>
              <input
                type="text"
                className="pv-result-score-input"
                placeholder="Score"
                value={formData.scoreA !== undefined ? formData.scoreA : ''}
                onChange={(e) => handleInputChange('scoreA', e.target.value)}
              />
              {formErrors.scoreA && <span className="pv-form-error">{formErrors.scoreA}</span>}
            </div>

            <div className="pv-result-vs">VS</div>

            <div className="pv-result-box">
              <span className="pv-result-team-name">{teamB?.name}</span>
              <span className="pv-result-team-tag">Away</span>
              <input
                type="text"
                className="pv-result-score-input"
                placeholder="Score"
                value={formData.scoreB !== undefined ? formData.scoreB : ''}
                onChange={(e) => handleInputChange('scoreB', e.target.value)}
              />
              {formErrors.scoreB && <span className="pv-form-error">{formErrors.scoreB}</span>}
            </div>
          </div>

          <div className="pv-form-group">
            <label>Referee Match Summary & Key Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Overtime decided by buzzer-beater, clean disciplinary card sheet..."
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div className="pv-form-actions">
            <button type="button" className="pv-btn pv-btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="pv-btn pv-btn-primary" disabled={submitting}>
              {submitting ? 'Updating Standings...' : 'Finalize & Update Standings'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // ==========================================
  // MODAL 6: ISSUE EQUIPMENT
  // ==========================================
  if (activeModal === 'issueEquipment') {
    const item = modalProps.equipment
    if (!item) return null

    const handleSubmit = async (e) => {
      e.preventDefault()
      const errors = {}
      const qty = parseInt(formData.quantity, 10) || 1
      if (qty > item.availableQuantity) {
        errors.quantity = `Only ${item.availableQuantity} items available in stock`
      }
      if (!formData.borrower?.trim()) errors.borrower = 'Borrower / Athlete name required'
      if (!formData.returnDate) errors.returnDate = 'Expected return date required'

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      try {
        setSubmitting(true)
        await issueEquipment(item.id, {
          quantity: qty,
          borrower: formData.borrower,
          teamId: formData.teamId || null,
          issueDate: new Date().toISOString().split('T')[0],
          returnDate: formData.returnDate,
          purpose: formData.purpose || 'Varsity Training Session',
        })
        closeModal()
        setFormData({})
      } catch (err) {
        setFormErrors({ general: err.message })
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Modal
        isOpen={true}
        onClose={closeModal}
        title={`Check Out: ${item.name}`}
        subtitle={`Current available quantity in inventory: ${item.availableQuantity} units.`}
        maxWidth="520px"
      >
        <form onSubmit={handleSubmit} className="pv-form">
          {formErrors.general && <div className="pv-form-alert">{formErrors.general}</div>}

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Check Out Quantity *</label>
              <input
                type="number"
                min="1"
                max={item.availableQuantity}
                value={formData.quantity || 1}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={formErrors.quantity ? 'input-error' : ''}
              />
              {formErrors.quantity && <span className="pv-form-error">{formErrors.quantity}</span>}
            </div>

            <div className="pv-form-group">
              <label>Expected Return Date *</label>
              <input
                type="date"
                value={formData.returnDate || ''}
                onChange={(e) => handleInputChange('returnDate', e.target.value)}
                className={formErrors.returnDate ? 'input-error' : ''}
              />
              {formErrors.returnDate && <span className="pv-form-error">{formErrors.returnDate}</span>}
            </div>
          </div>

          <div className="pv-form-group">
            <label>Borrower Athlete / Coach Name *</label>
            <input
              type="text"
              placeholder="e.g. Captain Julian Martinez"
              value={formData.borrower || ''}
              onChange={(e) => handleInputChange('borrower', e.target.value)}
              className={formErrors.borrower ? 'input-error' : ''}
            />
            {formErrors.borrower && <span className="pv-form-error">{formErrors.borrower}</span>}
          </div>

          <div className="pv-form-group">
            <label>Purpose / Training Session</label>
            <input
              type="text"
              placeholder="e.g. Varsity practice before Saturday fixture"
              value={formData.purpose || ''}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
            />
          </div>

          <div className="pv-form-actions">
            <button type="button" className="pv-btn pv-btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="pv-btn pv-btn-primary" disabled={submitting}>
              {submitting ? 'Checking out...' : 'Confirm Gear Checkout'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // ==========================================
  // MODAL 7: ADD PLAYER
  // ==========================================
  if (activeModal === 'addPlayer') {
    const selectedSport = formData.sport || modalProps.sport || sports[0]?.id || 'basketball'
    const eligibleTeams = teams.filter((t) => t.sport === selectedSport)

    const handleSubmit = async (e) => {
      e.preventDefault()
      const errors = {}
      if (!formData.name?.trim()) errors.name = 'Player name is required'
      if (!formData.teamId) errors.teamId = 'Please select a team'
      if (!formData.email?.trim() || !formData.email.includes('@')) errors.email = 'Valid student email required'

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      try {
        setSubmitting(true)
        await createPlayer({
          name: formData.name,
          sport: selectedSport,
          teamId: formData.teamId,
          position: formData.position || 'Squad Member',
          jerseyNumber: formData.jerseyNumber || '10',
          email: formData.email,
          year: formData.year || 'Sophomore',
        })
        closeModal()
        setFormData({})
      } catch (err) {
        setFormErrors({ general: err.message })
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Modal
        isOpen={true}
        onClose={closeModal}
        title="Add Athlete to Roster"
        subtitle="Register verified student-athlete with NCAA eligibility credentials."
        maxWidth="560px"
      >
        <form onSubmit={handleSubmit} className="pv-form">
          {formErrors.general && <div className="pv-form-alert">{formErrors.general}</div>}

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Sport Discipline *</label>
              <select
                value={selectedSport}
                onChange={(e) => {
                  handleInputChange('sport', e.target.value)
                  handleInputChange('teamId', '')
                }}
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pv-form-group">
              <label>Assigned Squad *</label>
              <select
                value={formData.teamId || modalProps.teamId || ''}
                onChange={(e) => handleInputChange('teamId', e.target.value)}
                className={formErrors.teamId ? 'input-error' : ''}
              >
                <option value="">Select Team</option>
                {eligibleTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {formErrors.teamId && <span className="pv-form-error">{formErrors.teamId}</span>}
            </div>
          </div>

          <div className="pv-form-group">
            <label>Full Athlete Name *</label>
            <input
              type="text"
              placeholder="e.g. Maya Lin"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="pv-form-error">{formErrors.name}</span>}
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Position / Specialty</label>
              <input
                type="text"
                placeholder="e.g. Point Guard / Striker"
                value={formData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
              />
            </div>

            <div className="pv-form-group">
              <label>Jersey Number</label>
              <input
                type="text"
                placeholder="e.g. 23"
                value={formData.jerseyNumber || ''}
                onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="pv-form-row">
            <div className="pv-form-group">
              <label>Academic Year</label>
              <select
                value={formData.year || 'Sophomore'}
                onChange={(e) => handleInputChange('year', e.target.value)}
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>

            <div className="pv-form-group">
              <label>Athletic Email *</label>
              <input
                type="email"
                placeholder="m.lin@athletics.edu"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={formErrors.email ? 'input-error' : ''}
              />
              {formErrors.email && <span className="pv-form-error">{formErrors.email}</span>}
            </div>
          </div>

          <div className="pv-form-actions">
            <button type="button" className="pv-btn pv-btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="pv-btn pv-btn-primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Add Athlete to Official Roster'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  return null
}
