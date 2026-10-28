/**
 * PlayVault Sports Management Service Layer
 * Simulates REST API endpoints with localStorage persistence,
 * validation, conflict detection, and business logic enforcement.
 */

import {
  INITIAL_SPORTS,
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_VENUES,
  INITIAL_EQUIPMENT,
  INITIAL_MATCHES,
  INITIAL_BOOKINGS,
  INITIAL_ATTENDANCE,
  INITIAL_REGISTRATIONS,
  INITIAL_NOTIFICATIONS,
  STRUCTURED_RULEBOOK,
} from '../data/seedData'
import { todayISO } from '../utils/dateUtils'

const STORAGE_KEYS = {
  TEAMS: 'playvault_teams_v2',
  PLAYERS: 'playvault_players_v2',
  VENUES: 'playvault_venues_v2',
  EQUIPMENT: 'playvault_equipment_v3',
  MATCHES: 'playvault_matches_v3',
  BOOKINGS: 'playvault_bookings_v3',
  ATTENDANCE: 'playvault_attendance_v3',
  REGISTRATIONS: 'playvault_registrations_v3',
  NOTIFICATIONS: 'playvault_notifications_v3',
  BOOKMARKS: 'playvault_rule_bookmarks_v2',
}

const simulateDelay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const getStorageItem = (key, defaultData) => {
  try {
    const item = localStorage.getItem(key)
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData))
      return defaultData
    }
    return JSON.parse(item)
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err)
    return defaultData
  }
}

const setStorageItem = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`Error saving localStorage for key ${key}:`, err)
  }
}

// ==========================================
// SPORTS & RULEBOOK
// ==========================================
export const sportsService = {
  async getSports() {
    await simulateDelay()
    return [...INITIAL_SPORTS]
  },

  async getRulebooks() {
    await simulateDelay()
    return [...STRUCTURED_RULEBOOK]
  },

  getBookmarkedRules() {
    return getStorageItem(STORAGE_KEYS.BOOKMARKS, [])
  },

  toggleBookmarkRule(ruleId) {
    const current = getStorageItem(STORAGE_KEYS.BOOKMARKS, [])
    const exists = current.includes(ruleId)
    const updated = exists ? current.filter((id) => id !== ruleId) : [...current, ruleId]
    setStorageItem(STORAGE_KEYS.BOOKMARKS, updated)
    return updated
  },

  // ==========================================
  // TEAMS CRUD
  // ==========================================
  async getTeams() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.TEAMS, INITIAL_TEAMS)
  },

  async getTeamById(id) {
    await simulateDelay()
    const teams = getStorageItem(STORAGE_KEYS.TEAMS, INITIAL_TEAMS)
    const team = teams.find((t) => t.id === id)
    if (!team) throw new Error(`Team with ID ${id} not found`)
    return team
  },

  async createTeam(teamData) {
    await simulateDelay(200)
    const teams = getStorageItem(STORAGE_KEYS.TEAMS, INITIAL_TEAMS)

    // Validation: Duplicate team name
    if (teams.some((t) => t.name.toLowerCase() === teamData.name.trim().toLowerCase())) {
      throw new Error(`A team named "${teamData.name}" already exists.`)
    }

    if (!teamData.name.trim()) throw new Error('Team name is required.')
    if (!teamData.sport) throw new Error('Sport selection is required.')

    const newTeam = {
      id: `team-${Date.now()}`,
      name: teamData.name.trim(),
      sport: teamData.sport,
      division: teamData.division || 'Varsity Collegiate',
      record: '0-0',
      wins: 0,
      losses: 0,
      draws: 0,
      pct: '.000',
      seed: `#${teams.filter((t) => t.sport === teamData.sport).length + 1}`,
      status: 'ACTIVE',
      statusType: 'active',
      coach: teamData.coach || 'Unassigned',
      captain: teamData.captain || 'To be nominated',
      rosterSize: parseInt(teamData.rosterSize, 10) || 12,
      activeAthletes: `${parseInt(teamData.rosterSize, 10) || 12} Active Athletes`,
      wl: [0],
      matchTime: 'Schedule Pending',
      matchOpponent: 'Awaiting fixture',
      matchTag: 'NEWLY AFFILIATED',
      avatarColors: teamData.avatarColors || ['#1a3c2a', '#c8972e', '#2980b9'],
      description: teamData.description || 'Newly registered collegiate team.',
    }

    const updated = [newTeam, ...teams]
    setStorageItem(STORAGE_KEYS.TEAMS, updated)
    return newTeam
  },

  // ==========================================
  // PLAYERS CRUD
  // ==========================================
  async getPlayers() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS)
  },

  async getPlayerById(id) {
    await simulateDelay()
    const players = getStorageItem(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS)
    const player = players.find((p) => p.id === id)
    if (!player) throw new Error(`Player with ID ${id} not found`)
    return player
  },

  async createPlayer(playerData) {
    await simulateDelay(200)
    const players = getStorageItem(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS)

    if (!playerData.name.trim()) throw new Error('Player name is required.')
    if (!playerData.sport) throw new Error('Sport is required.')
    if (!playerData.teamId) throw new Error('Team selection is required.')

    // Check duplicate by email or name in same team
    if (players.some((p) => p.email && p.email.toLowerCase() === playerData.email?.trim().toLowerCase())) {
      throw new Error(`A player with email ${playerData.email} is already registered.`)
    }

    const initials = playerData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

    const newPlayer = {
      id: `ply-${Date.now()}`,
      name: playerData.name.trim(),
      sport: playerData.sport,
      teamId: playerData.teamId,
      position: playerData.position || 'General Squad',
      jerseyNumber: playerData.jerseyNumber || String(Math.floor(Math.random() * 90 + 10)),
      email: playerData.email || `${playerData.name.toLowerCase().replace(/\s+/g, '.')}@athletics.edu`,
      status: 'ACTIVE',
      attendanceRate: 100,
      matchesPlayed: 0,
      avatar: initials,
      avatarColor: playerData.avatarColor || '#1a3c2a',
      year: playerData.year || 'Freshman',
    }

    const updated = [newPlayer, ...players]
    setStorageItem(STORAGE_KEYS.PLAYERS, updated)
    return newPlayer
  },

  // ==========================================
  // MATCHES & SCHEDULING CRUD
  // ==========================================
  async getMatches() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.MATCHES, INITIAL_MATCHES)
  },

  async getMatchById(id) {
    await simulateDelay()
    const matches = getStorageItem(STORAGE_KEYS.MATCHES, INITIAL_MATCHES)
    const match = matches.find((m) => m.id === id)
    if (!match) throw new Error(`Match with ID ${id} not found`)
    return match
  },

  async scheduleMatch(matchData) {
    await simulateDelay(250)
    const matches = getStorageItem(STORAGE_KEYS.MATCHES, INITIAL_MATCHES)
    const venues = getStorageItem(STORAGE_KEYS.VENUES, INITIAL_VENUES)
    const bookings = getStorageItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS)

    // Validation 1: Team A and Team B cannot be identical
    if (matchData.teamAId === matchData.teamBId) {
      throw new Error('A team cannot play against itself. Please select two distinct squads.')
    }

    // Validation 2: Required fields
    if (!matchData.sport || !matchData.teamAId || !matchData.teamBId || !matchData.date || !matchData.time || !matchData.venueId) {
      throw new Error('All match fields (Sport, Teams, Date, Time, Venue) are required.')
    }

    // Validation 2b: Fixtures must be scheduled for today or a future date
    if (matchData.date < todayISO()) {
      throw new Error('Match date cannot be in the past. Please choose today or a future date.')
    }

    // Validation 3: Venue must support the sport
    const venue = venues.find((v) => v.id === matchData.venueId)
    if (!venue) throw new Error('Selected venue does not exist.')
    if (!venue.sportsSupported.includes(matchData.sport)) {
      throw new Error(`Venue "${venue.name}" does not support ${matchData.sport}. Supported sports: ${venue.sportsSupported.join(', ')}`)
    }

    // Validation 4: Venue availability / double-booking conflict check
    const conflictingBooking = bookings.find(
      (b) => b.venueId === matchData.venueId && b.date === matchData.date && b.status === 'confirmed'
    )
    if (conflictingBooking) {
      throw new Error(`Venue conflict: "${venue.name}" is already reserved on ${matchData.date} for "${conflictingBooking.title}".`)
    }

    // Validation 5: Check team schedule conflict on same date
    const teamAConflict = matches.find(
      (m) => (m.teamAId === matchData.teamAId || m.teamBId === matchData.teamAId) && m.date === matchData.date && m.status !== 'cancelled'
    )
    if (teamAConflict) {
      throw new Error(`Schedule conflict: Team A is already scheduled for a match on ${matchData.date}.`)
    }

    const teamBConflict = matches.find(
      (m) => (m.teamAId === matchData.teamBId || m.teamBId === matchData.teamBId) && m.date === matchData.date && m.status !== 'cancelled'
    )
    if (teamBConflict) {
      throw new Error(`Schedule conflict: Team B is already scheduled for a match on ${matchData.date}.`)
    }

    const matchId = `mat-${Date.now()}`
    const newMatch = {
      id: matchId,
      sport: matchData.sport,
      teamAId: matchData.teamAId,
      teamBId: matchData.teamBId,
      date: matchData.date,
      time: matchData.time,
      endTime: matchData.endTime || '2 Hours Duration',
      venueId: matchData.venueId,
      status: 'upcoming',
      tag: matchData.tag || 'Varsity League Fixture',
      scoreA: null,
      scoreB: null,
      referees: matchData.referees || ['NCAA Assigned Referee'],
      events: [],
      notes: matchData.notes || 'Official collegiate scheduled match.',
    }

    // Synchronize by automatically creating a confirmed venue booking!
    const newBooking = {
      id: `bok-${Date.now()}`,
      venueId: matchData.venueId,
      title: `Match: ${matchData.sport.toUpperCase()} Fixture`,
      sport: matchData.sport,
      matchId: matchId,
      date: matchData.date,
      startTime: matchData.time,
      endTime: matchData.endTime || 'Match Duration',
      bookedBy: 'Athletics Fixture Coordinator',
      status: 'confirmed',
      notes: `Automated reservation for Match ID ${matchId}`,
    }

    const updatedMatches = [newMatch, ...matches]
    const updatedBookings = [newBooking, ...bookings]

    setStorageItem(STORAGE_KEYS.MATCHES, updatedMatches)
    setStorageItem(STORAGE_KEYS.BOOKINGS, updatedBookings)

    return newMatch
  },

  /**
   * Record points for a SIMULATED live match. Writes through to the stored
   * match so every page (dashboard, match list, detail) reads the same score.
   * Real (non-simulated) matches must go through updateMatchResult.
   */
  async recordSimulatedPoints(matchId, side, points) {
    await simulateDelay(100)
    const matches = getStorageItem(STORAGE_KEYS.MATCHES, INITIAL_MATCHES)
    const teams = getStorageItem(STORAGE_KEYS.TEAMS, INITIAL_TEAMS)
    const idx = matches.findIndex((m) => m.id === matchId)
    if (idx === -1) throw new Error('Match not found.')

    const match = matches[idx]
    if (match.status !== 'live' || !match.isSimulatedLive) {
      throw new Error('Only simulated live matches can be advanced this way.')
    }

    const key = side === 'A' ? 'scoreA' : 'scoreB'
    const teamId = side === 'A' ? match.teamAId : match.teamBId
    const teamName = teams.find((t) => t.id === teamId)?.name || `Team ${side}`

    const quarterKey = side === 'A' ? 'teamAQuarters' : 'teamBQuarters'
    const quarters = match.scores?.[quarterKey]
      ? [...match.scores[quarterKey]]
      : null
    if (quarters && quarters.length) quarters[quarters.length - 1] += points

    const updated = {
      ...match,
      [key]: (Number(match[key]) || 0) + points,
      scores: quarters ? { ...match.scores, [quarterKey]: quarters } : match.scores,
      events: [
        {
          time: match.periodTime || '--:--',
          description: `[Simulated] ${teamName} +${points}`,
          type: 'score',
          team: side,
        },
        ...(match.events || []),
      ],
    }
    matches[idx] = updated
    setStorageItem(STORAGE_KEYS.MATCHES, matches)
    return updated
  },

  async updateMatchResult(matchId, resultData) {
    await simulateDelay(200)
    const matches = getStorageItem(STORAGE_KEYS.MATCHES, INITIAL_MATCHES)
    const teams = getStorageItem(STORAGE_KEYS.TEAMS, INITIAL_TEAMS)

    const matchIndex = matches.findIndex((m) => m.id === matchId)
    if (matchIndex === -1) throw new Error('Match not found.')

    const match = matches[matchIndex]
    const { scoreA, scoreB, isDraw, winnerId, notes } = resultData

    const updatedMatch = {
      ...match,
      status: 'completed',
      scoreA,
      scoreB,
      winnerId: isDraw ? null : winnerId,
      sportScoreSummary: resultData.sportScoreSummary || `${scoreA} - ${scoreB}`,
      notes: notes || match.notes,
    }

    matches[matchIndex] = updatedMatch
    setStorageItem(STORAGE_KEYS.MATCHES, matches)

    // Recalculate standings for both participating teams!
    const updatedTeams = teams.map((team) => {
      if (team.id === match.teamAId || team.id === match.teamBId) {
        const isTeamA = team.id === match.teamAId
        const won = !isDraw && winnerId === team.id
        const lost = !isDraw && winnerId !== team.id
        const drew = !!isDraw

        const wins = (team.wins || 0) + (won ? 1 : 0)
        const losses = (team.losses || 0) + (lost ? 1 : 0)
        const draws = (team.draws || 0) + (drew ? 1 : 0)
        const totalGames = wins + losses + draws
        const pct = totalGames > 0 ? (wins / totalGames).toFixed(3).replace(/^0+/, '') : '.000'
        const wl = [...(team.wl || []), won ? 1 : lost ? 0 : 2]

        return {
          ...team,
          wins,
          losses,
          draws,
          pct: pct.startsWith('.') ? pct : `.${pct}`,
          record: draws > 0 ? `${wins}-${losses}-${draws}` : `${wins}-${losses}`,
          wl,
        }
      }
      return team
    })

    setStorageItem(STORAGE_KEYS.TEAMS, updatedTeams)
    return { match: updatedMatch, teams: updatedTeams }
  },

  // ==========================================
  // VENUES & BOOKINGS CRUD
  // ==========================================
  async getVenues() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.VENUES, INITIAL_VENUES)
  },

  async getBookings() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS)
  },

  async createVenueBooking(bookingData) {
    await simulateDelay(200)
    const venues = getStorageItem(STORAGE_KEYS.VENUES, INITIAL_VENUES)
    const bookings = getStorageItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS)

    const venue = venues.find((v) => v.id === bookingData.venueId)
    if (!venue) throw new Error('Selected venue not found.')

    // Sport compatibility
    if (bookingData.sport && !venue.sportsSupported.includes(bookingData.sport)) {
      throw new Error(`Venue "${venue.name}" does not accommodate ${bookingData.sport}.`)
    }

    // Overlapping booking conflict check
    const conflict = bookings.find(
      (b) =>
        b.venueId === bookingData.venueId &&
        b.date === bookingData.date &&
        b.status === 'confirmed' &&
        !(bookingData.endTime <= b.startTime || bookingData.startTime >= b.endTime)
    )

    if (conflict) {
      throw new Error(
        `Conflicting Booking: "${venue.name}" is already reserved by "${conflict.bookedBy}" on ${bookingData.date} from ${conflict.startTime} to ${conflict.endTime}.`
      )
    }

    const newBooking = {
      id: `bok-${Date.now()}`,
      venueId: bookingData.venueId,
      title: bookingData.title || `${bookingData.sport || 'Varsity'} Session`,
      sport: bookingData.sport,
      matchId: null,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      bookedBy: bookingData.bookedBy || 'Athletics Faculty Staff',
      status: 'confirmed',
      notes: bookingData.notes || 'Facility reservation request confirmed.',
    }

    const updated = [newBooking, ...bookings]
    setStorageItem(STORAGE_KEYS.BOOKINGS, updated)
    return newBooking
  },

  async cancelBooking(bookingId) {
    await simulateDelay(150)
    const bookings = getStorageItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS)
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    setStorageItem(STORAGE_KEYS.BOOKINGS, updated)
    return updated
  },

  // ==========================================
  // EQUIPMENT CRUD & OPERATIONS
  // ==========================================
  async getEquipment() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT)
  },

  async addEquipment(itemData) {
    await simulateDelay(200)
    const equipment = getStorageItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT)
    const totalQty = parseInt(itemData.quantity || itemData.totalQuantity, 10) || 1

    const newItem = {
      id: `eq-${Date.now()}`,
      name: itemData.name.trim(),
      sport: itemData.sport || 'soccer',
      category: itemData.category || 'Miscellaneous',
      totalQuantity: totalQty,
      availableQuantity: totalQty,
      inUseQuantity: 0,
      damagedQuantity: 0,
      condition: itemData.condition || 'Good',
      status: 'Available',
      storageLocation: itemData.storageLocation || 'Central Athletics Warehouse',
      assignments: [],
    }

    const updated = [newItem, ...equipment]
    setStorageItem(STORAGE_KEYS.EQUIPMENT, updated)
    return newItem
  },

  async issueEquipment(equipmentId, issueData) {
    await simulateDelay(200)
    const equipment = getStorageItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT)
    const itemIndex = equipment.findIndex((e) => e.id === equipmentId)
    if (itemIndex === -1) throw new Error('Equipment item not found.')

    const item = equipment[itemIndex]
    const qty = parseInt(issueData.quantity, 10) || 1

    // Validation 1: Cannot issue damaged equipment
    if (item.status === 'Under Maintenance' || item.availableQuantity <= 0) {
      throw new Error(`Cannot issue "${item.name}". Item is currently unavailable or under maintenance.`)
    }

    // Validation 2: Cannot issue more than available
    if (qty > item.availableQuantity) {
      throw new Error(`Cannot issue ${qty} units. Only ${item.availableQuantity} available in stock.`)
    }

    const newAssignment = {
      id: `asg-${Date.now()}`,
      teamId: issueData.teamId || null,
      borrower: issueData.borrower || 'Collegiate Squad',
      quantity: qty,
      issueDate: issueData.issueDate || new Date().toISOString().split('T')[0],
      returnDate: issueData.returnDate || '',
      status: 'Active',
      purpose: issueData.purpose || 'Varsity Match / Training',
    }

    const updatedItem = {
      ...item,
      availableQuantity: item.availableQuantity - qty,
      inUseQuantity: item.inUseQuantity + qty,
      status: item.availableQuantity - qty === 0 ? 'In Use' : 'Available',
      assignments: [newAssignment, ...(item.assignments || [])],
    }

    equipment[itemIndex] = updatedItem
    setStorageItem(STORAGE_KEYS.EQUIPMENT, equipment)
    return updatedItem
  },

  async returnEquipment(equipmentId, assignmentId) {
    await simulateDelay(200)
    const equipment = getStorageItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT)
    const itemIndex = equipment.findIndex((e) => e.id === equipmentId)
    if (itemIndex === -1) throw new Error('Equipment item not found.')

    const item = equipment[itemIndex]
    const assignment = (item.assignments || []).find((a) => a.id === assignmentId)
    if (!assignment) throw new Error('Assignment record not found.')

    const qty = assignment.quantity
    const updatedAssignments = item.assignments.filter((a) => a.id !== assignmentId)

    const updatedItem = {
      ...item,
      availableQuantity: Math.min(item.totalQuantity - item.damagedQuantity, item.availableQuantity + qty),
      inUseQuantity: Math.max(0, item.inUseQuantity - qty),
      status: 'Available',
      assignments: updatedAssignments,
    }

    equipment[itemIndex] = updatedItem
    setStorageItem(STORAGE_KEYS.EQUIPMENT, equipment)
    return updatedItem
  },

  async reportDamage(equipmentId, damageQty) {
    await simulateDelay(200)
    const equipment = getStorageItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT)
    const itemIndex = equipment.findIndex((e) => e.id === equipmentId)
    if (itemIndex === -1) throw new Error('Equipment item not found.')

    const item = equipment[itemIndex]
    const qty = Math.min(item.availableQuantity, parseInt(damageQty, 10) || 1)

    const updatedItem = {
      ...item,
      availableQuantity: Math.max(0, item.availableQuantity - qty),
      damagedQuantity: item.damagedQuantity + qty,
      status: item.availableQuantity - qty === 0 ? 'Under Maintenance' : item.status,
      condition: 'Damaged / Pending Repair',
    }

    equipment[itemIndex] = updatedItem
    setStorageItem(STORAGE_KEYS.EQUIPMENT, equipment)
    return updatedItem
  },

  async repairEquipment(equipmentId, repairQty) {
    await simulateDelay(200)
    const equipment = getStorageItem(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT)
    const itemIndex = equipment.findIndex((e) => e.id === equipmentId)
    if (itemIndex === -1) throw new Error('Equipment item not found.')

    const item = equipment[itemIndex]
    const qty = Math.min(item.damagedQuantity, parseInt(repairQty, 10) || item.damagedQuantity)

    const updatedItem = {
      ...item,
      damagedQuantity: Math.max(0, item.damagedQuantity - qty),
      availableQuantity: item.availableQuantity + qty,
      status: 'Available',
      condition: 'Good',
    }

    equipment[itemIndex] = updatedItem
    setStorageItem(STORAGE_KEYS.EQUIPMENT, equipment)
    return updatedItem
  },

  // ==========================================
  // ATTENDANCE MANAGEMENT
  // ==========================================
  async getAttendance() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE)
  },

  async saveAttendance(attendanceData) {
    await simulateDelay(200)
    const attendance = getStorageItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE)
    const players = getStorageItem(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS)

    // Check duplicate session for same team and date
    const existingIndex = attendance.findIndex(
      (a) => a.teamId === attendanceData.teamId && a.date === attendanceData.date && a.sessionType === attendanceData.sessionType
    )

    let updatedList
    if (existingIndex >= 0) {
      // Update existing record
      attendance[existingIndex] = { ...attendance[existingIndex], ...attendanceData }
      updatedList = [...attendance]
    } else {
      const newRecord = {
        id: `att-${Date.now()}`,
        ...attendanceData,
      }
      updatedList = [newRecord, ...attendance]
    }

    setStorageItem(STORAGE_KEYS.ATTENDANCE, updatedList)

    // Update player attendance percentages dynamically!
    const updatedPlayers = players.map((p) => {
      const playerRecord = attendanceData.records.find((r) => r.playerId === p.id)
      if (playerRecord) {
        const isPresent = playerRecord.status === 'present'
        const currentRate = p.attendanceRate || 95
        const newRate = isPresent ? Math.min(100, currentRate + 1) : Math.max(60, currentRate - 4)
        return { ...p, attendanceRate: newRate }
      }
      return p
    })
    setStorageItem(STORAGE_KEYS.PLAYERS, updatedPlayers)

    return updatedList
  },

  // ==========================================
  // REGISTRATIONS (JOIN OR CREATE TEAM)
  // ==========================================
  async getRegistrations() {
    await simulateDelay()
    return getStorageItem(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS)
  },

  async submitRegistration(regData) {
    await simulateDelay(200)
    const registrations = getStorageItem(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS)

    if (!regData.applicantName?.trim()) throw new Error('Applicant name is required.')
    if (!regData.email?.trim()) throw new Error('Contact email is required.')

    const newReg = {
      id: `reg-${Date.now()}`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      ...regData,
    }

    const updated = [newReg, ...registrations]
    setStorageItem(STORAGE_KEYS.REGISTRATIONS, updated)
    return newReg
  },

  async updateRegistrationStatus(id, newStatus) {
    await simulateDelay(200)
    const registrations = getStorageItem(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS)
    const updated = registrations.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    setStorageItem(STORAGE_KEYS.REGISTRATIONS, updated)
    return updated
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications() {
    await simulateDelay(100)
    return getStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  },

  async markNotificationRead(id) {
    const notifs = getStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n))
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, updated)
    return updated
  },

  async markAllNotificationsRead() {
    const notifs = getStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
    const updated = notifs.map((n) => ({ ...n, read: true }))
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, updated)
    return updated
  },

  async addNotification(notif) {
    const notifs = getStorageItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
    const newNotif = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      read: false,
      ...notif,
    }
    const updated = [newNotif, ...notifs]
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, updated)
    return updated
  },
}
