import { useState } from 'react'
import './TeamForm.css'

const STORAGE_KEY = 'playvault_teams'

function TeamForm({ onTeamAdded }) {
  const [teamName, setTeamName] = useState('')
  const [sport, setSport] = useState('Soccer')
  const [coachName, setCoachName] = useState('')
  const [playersInput, setPlayersInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!teamName.trim()) return

    const newTeam = {
      id: Date.now().toString(),
      teamName: teamName.trim(),
      sport,
      coachName: coachName.trim(),
      players: playersInput
        ? playersInput.split(',').map((p) => p.trim()).filter(Boolean)
        : [],
    }

    const existingJSON = localStorage.getItem(STORAGE_KEY)
    const existing = existingJSON ? JSON.parse(existingJSON) : []
    const updated = [newTeam, ...existing]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    if (onTeamAdded) {
      onTeamAdded(updated)
    }

    setTeamName('')
    setCoachName('')
    setPlayersInput('')
  }

  return (
    <form className="team-form-card" onSubmit={handleSubmit}>
      <h3>Register New Team</h3>

      <div className="team-form-grid">
        <div className="team-form-group">
          <label>Team Name</label>
          <input
            type="text"
            placeholder="e.g. Thunderbolts FC"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>

        <div className="team-form-group">
          <label>Sport</label>
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="Soccer">Soccer</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Tennis">Tennis</option>
            <option value="Badminton">Badminton</option>
            <option value="Cricket">Cricket</option>
            <option value="Athletics">Athletics</option>
          </select>
        </div>

        <div className="team-form-group">
          <label>Coach Name</label>
          <input
            type="text"
            placeholder="e.g. Coach Alex"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
          />
        </div>

        <div className="team-form-group">
          <label>Players (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. Arjun, Rohan, Kabir"
            value={playersInput}
            onChange={(e) => setPlayersInput(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="team-submit-btn">
        Add Team
      </button>
    </form>
  )
}

export default TeamForm