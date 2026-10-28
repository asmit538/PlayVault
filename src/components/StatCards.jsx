import { useEffect, useState } from 'react'
import { matches } from '../data/mockData'
import './StatCards.css'

const EQUIPMENT_KEY = 'playvault_equipment'

function StatCards({ teamsCount }) {
  const [equipmentCount, setEquipmentCount] = useState(55)

  useEffect(() => {
    const savedEquipmentJSON = localStorage.getItem(EQUIPMENT_KEY)
    if (savedEquipmentJSON) {
      try {
        const savedEquipment = JSON.parse(savedEquipmentJSON)
        const total = savedEquipment.reduce((sum, item) => sum + item.quantity, 0)
        setEquipmentCount(total)
      } catch (e) {
        setEquipmentCount(55)
      }
    }
  }, [])

  const upcomingMatches = matches.filter((m) => m.status === 'upcoming').length

  return (
    <div className="stat-cards-row">
      <div className="stat-card green">
        <div className="stat-number">{teamsCount}</div>
        <div className="stat-label">Teams Registered</div>
      </div>

      <div className="stat-card blue">
        <div className="stat-number">{equipmentCount}</div>
        <div className="stat-label">Equipment in Stock</div>
      </div>

      <div className="stat-card amber">
        <div className="stat-number">{upcomingMatches}</div>
        <div className="stat-label">Upcoming Matches</div>
      </div>
    </div>
  )
}

export default StatCards
