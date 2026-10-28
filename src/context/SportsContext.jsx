import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { sportsService } from '../services/sportsService'

const SportsContext = createContext(null)

export function SportsProvider({ children }) {
  // Core Entities State
  const [sports, setSports] = useState([])
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [venues, setVenues] = useState([])
  const [equipment, setEquipment] = useState([])
  const [bookings, setBookings] = useState([])
  const [attendance, setAttendance] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [bookmarkedRules, setBookmarkedRules] = useState([])

  // Async Status
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Global UI States
  const [toasts, setToasts] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'scheduleMatch' | 'createTeam' | 'joinTeam' | 'bookVenue' | 'addPlayer' | 'addEquipment' | null
  const [modalProps, setModalProps] = useState({})

  // Toast System
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Initial Data Fetching
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [
        sList,
        tList,
        pList,
        mList,
        vList,
        eList,
        bList,
        aList,
        rList,
        nList,
      ] = await Promise.all([
        sportsService.getSports(),
        sportsService.getTeams(),
        sportsService.getPlayers(),
        sportsService.getMatches(),
        sportsService.getVenues(),
        sportsService.getEquipment(),
        sportsService.getBookings(),
        sportsService.getAttendance(),
        sportsService.getRegistrations(),
        sportsService.getNotifications(),
      ])

      setSports(sList)
      setTeams(tList)
      setPlayers(pList)
      setMatches(mList)
      setVenues(vList)
      setEquipment(eList)
      setBookings(bList)
      setAttendance(aList)
      setRegistrations(rList)
      setNotifications(nList)
      setBookmarkedRules(sportsService.getBookmarkedRules())
    } catch (err) {
      console.error('Failed to load application sports state:', err)
      setError(err.message || 'Error initializing sports platform data.')
      showToast('Error synchronizing database.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // ==========================================
  // ACTION HANDLERS WITH FEEDBACK
  // ==========================================

  // Create Team
  const handleCreateTeam = async (teamData) => {
    try {
      const newTeam = await sportsService.createTeam(teamData)
      setTeams((prev) => [newTeam, ...prev])
      showToast(`Team "${newTeam.name}" created successfully!`, 'success')

      // Auto notification
      await sportsService.addNotification({
        title: 'New Team Registered',
        message: `${newTeam.name} has entered the ${newTeam.division} roster.`,
        type: 'registration',
      })
      const updatedNotifs = await sportsService.getNotifications()
      setNotifications(updatedNotifs)
      return newTeam
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Create Player
  const handleCreatePlayer = async (playerData) => {
    try {
      const newPlayer = await sportsService.createPlayer(playerData)
      setPlayers((prev) => [newPlayer, ...prev])
      showToast(`Player "${newPlayer.name}" registered to roster!`, 'success')
      return newPlayer
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Schedule Match
  const handleScheduleMatch = async (matchData) => {
    try {
      const newMatch = await sportsService.scheduleMatch(matchData)
      const [updatedMatches, updatedBookings] = await Promise.all([
        sportsService.getMatches(),
        sportsService.getBookings(),
      ])
      setMatches(updatedMatches)
      setBookings(updatedBookings)
      showToast('Match scheduled and venue reserved successfully!', 'success')

      await sportsService.addNotification({
        title: 'New Fixture Scheduled',
        message: `Match scheduled for ${newMatch.date} at venue.`,
        type: 'match',
      })
      const updatedNotifs = await sportsService.getNotifications()
      setNotifications(updatedNotifs)
      return newMatch
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Advance score of a simulated live match (persisted, not display-only)
  const handleSimulatePoints = async (matchId, side, points) => {
    try {
      await sportsService.recordSimulatedPoints(matchId, side, points)
      const updatedMatches = await sportsService.getMatches()
      setMatches(updatedMatches)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Update Match Result
  const handleUpdateMatchResult = async (matchId, resultData) => {
    try {
      const { match, teams: updatedTeams } = await sportsService.updateMatchResult(matchId, resultData)
      const updatedMatches = await sportsService.getMatches()
      setMatches(updatedMatches)
      setTeams(updatedTeams)
      showToast('Match result verified and league table recalculated!', 'success')

      await sportsService.addNotification({
        title: 'Match Result Recorded',
        message: `Official result confirmed: ${resultData.sportScoreSummary}`,
        type: 'match',
      })
      const updatedNotifs = await sportsService.getNotifications()
      setNotifications(updatedNotifs)
      return match
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Book Venue
  const handleCreateVenueBooking = async (bookingData) => {
    try {
      const newBooking = await sportsService.createVenueBooking(bookingData)
      setBookings((prev) => [newBooking, ...prev])
      showToast(`Facility booked for ${newBooking.title}!`, 'success')

      await sportsService.addNotification({
        title: 'Facility Reserved',
        message: `Booking confirmed for ${newBooking.date} (${newBooking.startTime} - ${newBooking.endTime}).`,
        type: 'venue',
      })
      const updatedNotifs = await sportsService.getNotifications()
      setNotifications(updatedNotifs)
      return newBooking
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Equipment Operations
  const handleAddEquipment = async (itemData) => {
    try {
      const item = await sportsService.addEquipment(itemData)
      setEquipment((prev) => [item, ...prev])
      showToast(`Added ${item.name} to warehouse inventory.`, 'success')
      return item
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  const handleIssueEquipment = async (equipmentId, issueData) => {
    try {
      const updated = await sportsService.issueEquipment(equipmentId, issueData)
      setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? updated : e)))
      showToast(`Issued ${issueData.quantity} units of ${updated.name}.`, 'success')
      return updated
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  const handleReturnEquipment = async (equipmentId, assignmentId) => {
    try {
      const updated = await sportsService.returnEquipment(equipmentId, assignmentId)
      setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? updated : e)))
      showToast(`Equipment returned and verified in inventory.`, 'success')
      return updated
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  const handleReportDamage = async (equipmentId, qty) => {
    try {
      const updated = await sportsService.reportDamage(equipmentId, qty)
      setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? updated : e)))
      showToast(`Reported ${qty} items damaged. Placed in maintenance.`, 'warning')
      return updated
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  const handleRepairEquipment = async (equipmentId, qty) => {
    try {
      const updated = await sportsService.repairEquipment(equipmentId, qty)
      setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? updated : e)))
      showToast(`Restored ${qty} repaired items to active circulation!`, 'success')
      return updated
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Attendance
  const handleSaveAttendance = async (attendanceData) => {
    try {
      const updatedList = await sportsService.saveAttendance(attendanceData)
      setAttendance(updatedList)
      const updatedPlayers = await sportsService.getPlayers()
      setPlayers(updatedPlayers)
      showToast('Attendance recorded and athlete percentages updated.', 'success')
      return updatedList
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Registrations (Join / Create)
  const handleSubmitRegistration = async (regData) => {
    try {
      const newReg = await sportsService.submitRegistration(regData)
      setRegistrations((prev) => [newReg, ...prev])
      showToast('Application submitted! Our athletics desk will review it shortly.', 'success')

      await sportsService.addNotification({
        title: 'New Roster Request',
        message: `${newReg.applicantName} requested to ${newReg.type === 'join_team' ? 'join a team' : 'register a new team'}.`,
        type: 'registration',
      })
      const updatedNotifs = await sportsService.getNotifications()
      setNotifications(updatedNotifs)
      return newReg
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    }
  }

  // Rulebook Bookmarks
  const handleToggleBookmark = (ruleId) => {
    const updated = sportsService.toggleBookmarkRule(ruleId)
    setBookmarkedRules(updated)
    const saved = updated.includes(ruleId)
    showToast(saved ? 'Rule bookmarked to your playbook.' : 'Rule removed from bookmarks.', 'info')
  }

  // Notifications
  const handleMarkNotifRead = async (id) => {
    const updated = await sportsService.markNotificationRead(id)
    setNotifications(updated)
  }

  const handleMarkAllNotifsRead = async () => {
    const updated = await sportsService.markAllNotificationsRead()
    setNotifications(updated)
    showToast('All notifications marked as read.', 'info')
  }

  // ==========================================
  // DERIVED GLOBAL STATS (useMemo)
  // ==========================================
  const summaryStats = useMemo(() => {
    const totalPlayers = players.length
    const activeTeams = teams.filter((t) => t.status === 'ACTIVE' || t.status === 'ROSTER LOCKED').length
    const upcomingMatches = matches.filter((m) => m.status === 'upcoming').length
    const completedMatches = matches.filter((m) => m.status === 'completed').length
    const liveMatches = matches.filter((m) => m.status === 'live').length

    const totalEquipment = equipment.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)
    const availableEquipment = equipment.reduce((sum, item) => sum + (item.availableQuantity || 0), 0)
    const inUseEquipment = equipment.reduce((sum, item) => sum + (item.inUseQuantity || 0), 0)
    const damagedEquipment = equipment.reduce((sum, item) => sum + (item.damagedQuantity || 0), 0)

    const availableVenues = venues.filter((v) => v.status === 'available').length
    const pendingRegistrations = registrations.filter((r) => r.status === 'pending').length
    const attentionMatches = matches.filter((m) => m.status === 'live' || m.status === 'upcoming').length

    return {
      totalPlayers,
      activeTeams,
      upcomingMatches,
      completedMatches,
      liveMatches,
      totalEquipment,
      availableEquipment,
      inUseEquipment,
      damagedEquipment,
      availableVenues,
      totalVenues: venues.length,
      pendingRegistrations,
      attentionMatches,
    }
  }, [players, teams, matches, equipment, venues, registrations])

  // Global Search Filter (Derived)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { teams: [], players: [], matches: [], equipment: [], venues: [] }
    const q = searchQuery.toLowerCase().trim()

    return {
      teams: teams.filter((t) => t.name.toLowerCase().includes(q) || t.sport.toLowerCase().includes(q) || t.coach.toLowerCase().includes(q)),
      players: players.filter((p) => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q) || p.sport.toLowerCase().includes(q)),
      matches: matches.filter((m) => {
        const teamA = teams.find((t) => t.id === m.teamAId)?.name || ''
        const teamB = teams.find((t) => t.id === m.teamBId)?.name || ''
        return teamA.toLowerCase().includes(q) || teamB.toLowerCase().includes(q) || m.sport.toLowerCase().includes(q)
      }),
      equipment: equipment.filter((e) => e.name.toLowerCase().includes(q) || e.sport.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)),
      venues: venues.filter((v) => v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q)),
    }
  }, [searchQuery, teams, players, matches, equipment, venues])

  // Context value object
  const value = {
    // Entities
    sports,
    teams,
    players,
    matches,
    venues,
    equipment,
    bookings,
    attendance,
    registrations,
    notifications,
    bookmarkedRules,
    summaryStats,

    // Status
    loading,
    error,
    reload: loadAllData,

    // Operations
    createTeam: handleCreateTeam,
    createPlayer: handleCreatePlayer,
    scheduleMatch: handleScheduleMatch,
    updateMatchResult: handleUpdateMatchResult,
    simulatePoints: handleSimulatePoints,
    createVenueBooking: handleCreateVenueBooking,
    addEquipment: handleAddEquipment,
    issueEquipment: handleIssueEquipment,
    returnEquipment: handleReturnEquipment,
    reportDamage: handleReportDamage,
    repairEquipment: handleRepairEquipment,
    saveAttendance: handleSaveAttendance,
    submitRegistration: handleSubmitRegistration,
    toggleBookmark: handleToggleBookmark,
    markNotifRead: handleMarkNotifRead,
    markAllNotifsRead: handleMarkAllNotifsRead,

    // Modals & UI
    toasts,
    showToast,
    removeToast,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    isNotifOpen,
    setIsNotifOpen,
    activeModal,
    setActiveModal,
    modalProps,
    setModalProps,
    openModal: (type, props = {}) => {
      setModalProps(props)
      setActiveModal(type)
    },
    closeModal: () => {
      setActiveModal(null)
      setModalProps({})
    },
  }

  return <SportsContext.Provider value={value}>{children}</SportsContext.Provider>
}

export function useSports() {
  const context = useContext(SportsContext)
  if (!context) {
    throw new Error('useSports must be used within a SportsProvider')
  }
  return context
}
