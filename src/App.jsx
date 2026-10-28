import { Routes, Route } from 'react-router-dom'
import { SportsProvider } from './context/SportsContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import ToastContainer from './components/common/ToastContainer'
import GlobalSearchModal from './components/common/GlobalSearchModal'
import NotificationDrawer from './components/notifications/NotificationDrawer'
import GlobalModals from './components/modals/GlobalModals'

// Page Components
import HomePage from './pages/HomePage'
import TeamsPage from './pages/TeamsPage'
import TeamDetailPage from './pages/TeamDetailPage'
import PlayersPage from './pages/PlayersPage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import MatchesPage from './pages/MatchesPage'
import MatchDetailPage from './pages/MatchDetailPage'
import VenuesPage from './pages/VenuesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import RulebookPage from './pages/RulebookPage'
import SportDetailPage from './pages/SportDetailPage'
import EquipmentPage from './pages/EquipmentPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <SportsProvider>
      <div className="app-layout">
        <Sidebar />

        <div className="app-main">
          <TopBar />

          <main className="app-content">
            <Routes>
              {/* Module 1: Dashboard */}
              <Route path="/" element={<HomePage />} />

              {/* Module 2: Teams */}
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:teamId" element={<TeamDetailPage />} />

              {/* Module 3: Players & Attendance */}
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:playerId" element={<PlayerDetailPage />} />

              {/* Module 4: Matches */}
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/matches/:matchId" element={<MatchDetailPage />} />

              {/* Module 7: Venues */}
              <Route path="/venues" element={<VenuesPage />} />

              {/* Module 8: Leaderboard */}
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Module 5: Rulebook */}
              <Route path="/rulebook" element={<RulebookPage />} />
              <Route path="/rulebook/:sportId" element={<SportDetailPage />} />

              {/* Module 6: Equipment */}
              <Route path="/equipment" element={<EquipmentPage />} />

              {/* Custom 404 Out-of-Bounds */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        {/* Global Overlays & Modals */}
        <GlobalSearchModal />
        <NotificationDrawer />
        <GlobalModals />
        <ToastContainer />
      </div>
    </SportsProvider>
  )
}

export default App
