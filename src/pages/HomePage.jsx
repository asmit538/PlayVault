import { useState, useEffect } from 'react'
import StatCards from '../components/StatCards.jsx'
import MatchesList from '../components/MatchesList.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import './HomePage.css'

const STORAGE_KEY = 'playvault_teams'

const INITIAL_TEAMS = [
  { id: '1', teamName: 'Falcons FC', sport: 'Soccer', coachName: 'Coach Miller', players: ['Arjun Mehta', 'Rohan Das', 'Karan Singh'] },
  { id: '2', teamName: 'Titans Ballers', sport: 'Basketball', coachName: 'Coach Sarah', players: ['Vikram Rao', 'David Paul', 'Sam Wilson'] },
  { id: '3', teamName: 'Warriors Spikers', sport: 'Volleyball', coachName: 'Coach John', players: ['Priya Sharma', 'Neha Gupta', 'Rhea Sen'] },
  { id: '4', teamName: 'Hawks Strikers', sport: 'Soccer', coachName: 'Coach Robert', players: ['Aman Verma', 'Kabir Roy', 'Tushar Gill'] },
  { id: '5', teamName: 'Eagles United', sport: 'Tennis', coachName: 'Coach Lisa', players: ['Yash Kumar', 'Dev Patel'] },
  { id: '6', teamName: 'Panthers XI', sport: 'Cricket', coachName: 'Coach Vikram', players: ['Rohit Sethi', 'Siddharth Varma', 'Rahul Jain'] }
]

function HomePage() {
  const [teamsCount, setTeamsCount] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTeamsCount(parsed.length)
      } catch (e) {
        setTeamsCount(INITIAL_TEAMS.length)
      }
    } else {
      setTeamsCount(INITIAL_TEAMS.length)
    }
  }, [])

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Welcome to PlayVault</h1>
        <p>College sports management portal for matches, rules, equipment, and teams.</p>
      </div>

      <StatCards teamsCount={teamsCount} />

      <MatchesList />
      <Leaderboard />
    </div>
  )
}

export default HomePage