import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
// import TeamsPage from './pages/TeamsPage'
// import RulebookPage from './pages/RulebookPage'
// import SportDetailPage from './pages/SportDetailPage'
// import EquipmentPage from './pages/EquipmentPage'

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  )
}

export default App
