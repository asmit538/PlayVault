import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">🏆</span>
          <span>PlayVault</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/teams"
            className={`navbar-link ${location.pathname === '/teams' ? 'active' : ''}`}
          >
            Teams
          </Link>
          <Link
            to="/rulebook"
            className={`navbar-link ${location.pathname.startsWith('/rulebook') ? 'active' : ''}`}
          >
            Rulebook
          </Link>
          <Link
            to="/equipment"
            className={`navbar-link ${location.pathname === '/equipment' ? 'active' : ''}`}
          >
            Equipment
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
