import { useState } from 'react'
import { matches } from '../data/mockData'
import './MatchesList.css'

function MatchesList() {
  const [filter, setFilter] = useState('upcoming')

  const filteredMatches = matches.filter((m) => m.status === filter)

  return (
    <section className="matches-section">
      <div className="matches-header">
        <h2>Tournament Matches</h2>

        <div className="matches-tabs">
          <button
            className={`tab-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="matches-list">
        {filteredMatches.map((match) => (
          <div key={match.id} className="match-card">
            <div>
              <div className="match-teams">
                {match.teamA} vs {match.teamB}
              </div>
              <div className="match-date">Date: {match.date}</div>
            </div>

            <div>
              {match.status === 'upcoming' ? (
                <span className="badge-upcoming">Upcoming</span>
              ) : (
                <span className="badge-completed">{match.result}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MatchesList
