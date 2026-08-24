import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import RulebookPage from './pages/RulebookPage'
import HomePage from './pages/HomePage'
import SportDetailPage from './pages/SportDetailPage'
import EquipmentPage from './pages/EquipmentPage'
function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rulebook" element={<RulebookPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/rulebook/:sportId" element={<SportDetailPage />} />
      </Routes>
    </div>
  )
}

export default App
