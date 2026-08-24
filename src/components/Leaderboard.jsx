import { leaderboard } from '../data/mockData'
import './Leaderboard.css'

function Leaderboard() {
  const sortedTeams = [...leaderboard].sort((a, b) => b.wins - a.wins)

  return (
    <section className="leaderboard-section">
      <h2>League Leaderboard</h2>

      <div className="leaderboard-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, i) => (
              <tr key={team.team}>
                <td><strong>#{i + 1}</strong></td>
                <td>{team.team}</td>
                <td className="wins-col">{team.wins}</td>
                <td>{team.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Leaderboard
