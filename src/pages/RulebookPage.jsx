import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sportsRules } from '../data/rulebookData'
import './RulebookPage.css'

const disciplineCards = [
  {
    number: '01',
    tier: 'NCRA TIER 3 · COURT HANDBOOK #4.1',
    title: 'Basketball',
    id: 'basketball',
    icon: '🏀',
    specs: [
      { label: 'RIM HEIGHT', value: '10\' 0" Exact' },
      { label: 'BALL SPEC', value: 'Size 7 (29.5")' },
      { label: 'SHOT CLOCK', value: '30s NCAA' },
    ],
    details: ['Brownsburg Certified', '3.6 PSI Confirmed', 'Pre-approved NCAA'],
    rules: ['Zone-Ball Defensive Directive', 'Restricted Area Arc Calibration', 'Official Key Matchplay'],
    tags: ['14 ACTIVE REGULATIONS', 'NCAA CHAMPIONSHIP SPEC'],
    visual: 'basketball',
  },
  {
    number: '02',
    tier: 'COMPETITIVE FACILITY · WORLD ALIGNMENT 7',
    title: 'Football & Soccer',
    id: 'soccer',
    icon: '⚽',
    specs: [
      { label: 'PITCH STANDARD', value: '100 x 75 Yds' },
      { label: 'BALL CALIBER', value: 'FIFA Pro / Size 5' },
      { label: 'SUB WINDOWS', value: '3 Max Windows' },
    ],
    details: ['300-325 Lux Lighting', 'FIFA Quality Pro', 'NCAA Turf Standard'],
    rules: ['Offside Laser Calibration', 'VAR Telemetry Protocol', 'Intercollegiate Regulations'],
    tags: ['12 ACTIVE REGULATIONS', 'MATCH CLEARANCE READY'],
    visual: 'football',
  },
  {
    number: '03',
    tier: 'RANKING PRECISION · HARDCOURT & CLAY',
    title: 'Tennis & Racquet',
    id: 'tennis',
    icon: '🎾',
    specs: [
      { label: 'NET HEIGHT', value: '3\' 0" (Center)' },
      { label: 'SURFACE TYPE', value: 'Pro Acrylic / Clay' },
      { label: 'BALL PRESSURE', value: '7.8 PSI Certified' },
    ],
    details: ['ITF Approved Stage 1', 'Hawk-Eye Synchronized', 'ATP/NCAA Protocol'],
    rules: ['Tiebreak 10-Point Match', 'Court Drainage Velocity', 'Racket Tension Limits'],
    tags: ['10 ACTIVE REGULATIONS', 'ATP/WTA COMPLIANT'],
    visual: 'tennis',
  },
  {
    number: '04',
    tier: 'VARSITY SINGLES · HARDWOOD VOLLEY COMMAND',
    title: 'Volleyball',
    id: 'volleyball',
    icon: '🏐',
    specs: [
      { label: 'NET HEIGHT', value: '2.43m (M) / 2.24m (W)' },
      { label: 'BALL WEIGHT', value: '260 - 280g' },
      { label: 'MAX CONTACTS', value: '3 Contacts / Side' },
    ],
    details: ['FIVB Regulation', 'Molten FLISTATEC', 'NCAA Varsity Spec'],
    rules: ['Libero Replacement Rules', 'Rotational Fault Tracking', 'Attack Line 3m Distance'],
    tags: ['11 ACTIVE REGULATIONS', 'SET CALIBRATION OK'],
    visual: 'volleyball',
  },
  {
    number: '05',
    tier: 'COLLEGIATE CLUB · TURF WICKET & GROUND',
    title: 'Cricket & Striking',
    id: 'cricket',
    icon: '🏏',
    specs: [
      { label: 'PITCH SPAN', value: '22 Yards (20.12m)' },
      { label: 'BALL WEIGHT', value: '5.5 - 5.75 oz' },
      { label: 'STUMP HEIGHT', value: '28" Complete' },
    ],
    details: ['ICC Division Standards', 'Kookaburra Red/White', 'MCC Code 2025'],
    rules: ['Mandatory Powerplay 1-10', 'LBW UltraEdge Verification', 'Concussion Sub Protocol'],
    tags: ['09 ACTIVE REGULATIONS', 'WICKET AUDITED'],
    visual: 'cricket',
  },
  {
    number: '06',
    tier: 'NATIONAL CHAMPIONSHIPS · MONDO TRACK ALL-WEATHER',
    title: 'Track & Field',
    id: 'track',
    icon: '🏃',
    specs: [
      { label: 'LANE WIDTH', value: '1.22m (± 0.01m)' },
      { label: 'BATON WEIGHT', value: '50g / 28-30cm' },
      { label: 'FALSE START', value: '0.100s Sensor' },
    ],
    details: ['World Athletics Class 1', 'Mondo Super X 720', 'Electronic Timing (FAT)'],
    rules: ['Staggered Start Calibrations', 'Wind Gauge Over 2.0m/s', 'Baton Handover Zone 30m'],
    tags: ['08 ACTIVE REGULATIONS', 'OLYMPIC SENSOR SYNC'],
    visual: 'track',
  },
]

const categoryTabs = [
  'All 6 Disciplines',
  'Court (Basketball & Volleyball)',
  'Pitch & Field (Soccer & Cricket)',
  'Racquet (Tennis & Squash)',
  'Track & Athletics',
]

const categoryMap = {
  'All 6 Disciplines': null,
  'Court (Basketball & Volleyball)': ['basketball', 'volleyball'],
  'Pitch & Field (Soccer & Cricket)': ['soccer', 'cricket'],
  'Racquet (Tennis & Squash)': ['tennis'],
  'Track & Athletics': ['track'],
}

function CourtDiagram({ type }) {
  if (type === 'basketball') {
    return (
      <div className="rb-court-visual rb-court-basketball">
        <div className="rb-court-surface rb-surface-wood">
          <div className="rb-court-center-circle" />
          <div className="rb-court-midline" />
          <div className="rb-court-key rb-court-key-left">
            <div className="rb-free-throw-circle" />
          </div>
          <div className="rb-court-key rb-court-key-right">
            <div className="rb-free-throw-circle" />
          </div>
          <div className="rb-three-point-arc-left" />
          <div className="rb-three-point-arc-right" />
        </div>
      </div>
    )
  }
  if (type === 'football') {
    return (
      <div className="rb-court-visual rb-court-football">
        <div className="rb-court-surface rb-surface-grass">
          <div className="rb-pitch-center-circle" />
          <div className="rb-pitch-midline" />
          <div className="rb-pitch-box rb-pitch-box-left">
            <div className="rb-goal-box" />
          </div>
          <div className="rb-pitch-box rb-pitch-box-right">
            <div className="rb-goal-box" />
          </div>
        </div>
      </div>
    )
  }
  if (type === 'tennis') {
    return (
      <div className="rb-court-visual rb-court-tennis">
        <div className="rb-court-surface rb-surface-tennis">
          <div className="rb-tennis-net" />
          <div className="rb-tennis-service-box-left" />
          <div className="rb-tennis-service-box-right" />
          <div className="rb-tennis-baseline" />
        </div>
      </div>
    )
  }
  if (type === 'volleyball') {
    return (
      <div className="rb-court-visual rb-court-volleyball">
        <div className="rb-court-surface rb-surface-volleyball">
          <div className="rb-vb-net" />
          <div className="rb-vb-attack rb-vb-attack-left" />
          <div className="rb-vb-attack rb-vb-attack-right" />
        </div>
      </div>
    )
  }
  if (type === 'cricket') {
    return (
      <div className="rb-court-visual rb-court-cricket">
        <div className="rb-court-surface rb-surface-oval">
          <div className="rb-cricket-pitch-strip" />
          <div className="rb-cricket-crease-left" />
          <div className="rb-cricket-crease-right" />
        </div>
      </div>
    )
  }
  if (type === 'track') {
    return (
      <div className="rb-court-visual rb-court-track">
        <div className="rb-court-surface rb-surface-track">
          <div className="rb-track-ring rb-track-ring-1" />
          <div className="rb-track-ring rb-track-ring-2" />
          <div className="rb-track-field-infield" />
        </div>
      </div>
    )
  }
  return null
}

export default function RulebookPage() {
  const [activeTab, setActiveTab] = useState('All 6 Disciplines')
  const [searchQuery, setSearchQuery] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const allowedIds = categoryMap[activeTab]
  const filteredCards = disciplineCards.filter((card) => {
    const matchesCategory = allowedIds === null || allowedIds.includes(card.id)
    const matchesSearch =
      searchQuery.trim() === '' ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.specs.some(
        (s) =>
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesCategory && matchesSearch
  })

  const handleVerifyCompliance = () => {
    setIsVerified(true)
    setTimeout(() => setIsVerified(false), 3500)
  }

  return (
    <div className="rb-page">
      <div className="rb-container">

        {/* ─── HEADER CARD ─── */}
        <div className="rb-header-card">
          <div className="rb-header-left">
            <div className="rb-header-badge-row">
              <span className="rb-header-badge">
                <span className="badge-dot-gold" />
                NCAA DIVISION I OFFICIAL HANDBOOK · 2025/2026 CYCLE
              </span>
              <span className="rb-badge-compliance">✓ 6 OF 6 CERTIFIED</span>
            </div>
            <h1 className="rb-header-title">Collegiate Athletic Rulebooks &amp; Specifications</h1>
            <p className="rb-header-subtitle">
              Comprehensive court blueprints, regulation ball pressures, shot clocks, and tactical officiating standards certified for NCAA collegiate sports directors and referee crews.
            </p>
          </div>

          <div className="rb-header-right">
            <div className="rb-header-doc-box">
              <div className="doc-icon">📑</div>
              <div className="doc-text">
                <span className="doc-title">Master NCAA Rulebook</span>
                <span className="doc-meta">Rev 8.24 · Official Telemetry</span>
              </div>
            </div>
            <button
              className={`rb-verify-btn ${isVerified ? 'verified' : ''}`}
              onClick={handleVerifyCompliance}
            >
              {isVerified ? '✓ All 6 Standards Validated' : '🛡️ Verify Roster Compliance'}
            </button>
          </div>
        </div>

        {/* ─── STATS ROW ─── */}
        <div className="rb-stats-row">
          <div className="rb-stat-card">
            <div className="rb-stat-icon-wrap green">
              <span>🏟️</span>
            </div>
            <div className="rb-stat-content">
              <span className="rb-stat-val">06</span>
              <span className="rb-stat-lbl">Discipline Areas Calibrated</span>
            </div>
          </div>

          <div className="rb-stat-card">
            <div className="rb-stat-icon-wrap gold">
              <span>🎯</span>
            </div>
            <div className="rb-stat-content">
              <span className="rb-stat-val">100%</span>
              <span className="rb-stat-lbl">NCAA Div I Alignment</span>
            </div>
          </div>

          <div className="rb-stat-card">
            <div className="rb-stat-icon-wrap blue">
              <span>⚖️</span>
            </div>
            <div className="rb-stat-content">
              <span className="rb-stat-val">64</span>
              <span className="rb-stat-lbl">Official Game Rules Enforced</span>
            </div>
          </div>

          <div className="rb-stat-card">
            <div className="rb-stat-icon-wrap purple">
              <span>🛡️</span>
            </div>
            <div className="rb-stat-content">
              <span className="rb-stat-val">ZERO</span>
              <span className="rb-stat-lbl">Compliance Violations Logged</span>
            </div>
          </div>
        </div>

        {/* ─── SEARCH & FILTER TOOLBAR ─── */}
        <div className="rb-toolbar">
          <div className="rb-search-wrap">
            <span className="rb-search-icon">🔍</span>
            <input
              type="text"
              className="rb-search-input"
              placeholder="Search specifications, court dimensions, ball pressures, rules (e.g. 10' 0, FIFA, Size 7)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="rb-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="rb-category-tabs">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                className={`rb-cat-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ─── DISCIPLINE CARDS GRID ─── */}
        <div className="rb-cards-grid">
          {filteredCards.length === 0 ? (
            <div className="rb-empty-state">
              <div className="empty-icon">📖</div>
              <h3>No Rulebook Guidelines Found</h3>
              <p>Try searching for a different keyword or resetting your category filter.</p>
              <button
                className="rb-reset-btn"
                onClick={() => {
                  setSearchQuery('')
                  setActiveTab('All 6 Disciplines')
                }}
              >
                Reset Rulebook Search
              </button>
            </div>
          ) : (
            filteredCards.map((card, idx) => {
              const sportData = sportsRules.find((s) => s.id === card.id)

              return (
                <div
                  key={card.id}
                  className="rb-discipline-card"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <span className="rb-card-watermark">{card.number}</span>

                  <div className="rb-card-top">
                    <span className="rb-sport-icon">{card.icon}</span>
                    <div className="rb-card-heading-box">
                      <span className="rb-card-tier">{card.tier}</span>
                      <h2 className="rb-card-title">{card.title}</h2>
                    </div>
                  </div>

                  {/* High-fidelity court diagram */}
                  <div className="rb-diagram-container">
                    <CourtDiagram type={card.visual} />
                    <span className="rb-diagram-caption">Regulation Field Layout</span>
                  </div>

                  {/* Specs Grid */}
                  <div className="rb-card-specs-grid">
                    {card.specs.map((spec, i) => (
                      <div key={i} className="rb-spec-item">
                        <span className="rb-spec-label">{spec.label}</span>
                        <span className="rb-spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Details chips */}
                  <div className="rb-card-details">
                    {card.details.map((d, i) => (
                      <span key={i} className="rb-detail-chip">
                        <span className="chip-dot" /> {d}
                      </span>
                    ))}
                  </div>

                  {/* Rules Checkmarks */}
                  <div className="rb-card-rules">
                    {card.rules.map((rule, i) => (
                      <div key={i} className="rb-rule-check">
                        <span className="check-mark">✓</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="rb-card-tags">
                    {card.tags.map((tag, i) => (
                      <span key={i} className="rb-tag">{tag}</span>
                    ))}
                  </div>

                  {/* Action Link */}
                  <Link
                    to={sportData ? `/rulebook/${sportData.id}` : '/rulebook'}
                    className="rb-card-link"
                  >
                    <span>Full Tactical Rulebook &amp; Code</span>
                    <span className="arrow-icon">→</span>
                  </Link>
                </div>
              )
            })
          )}
        </div>

        {/* ─── BOTTOM BANNER ─── */}
        <div className="rb-bottom-banner">
          <div className="rb-banner-content">
            <div className="rb-banner-text">
              <span className="rb-banner-label">NCAA ATHLETICS AUDIT COMMISSION</span>
              <h3 className="rb-banner-title">Certified Game Day Tactical Execution</h3>
              <p className="rb-banner-desc">
                All court calibrations, line markings, referee signals, and shot clocks are inspected 90 minutes prior to official tipoff or kickoff.
              </p>
            </div>
            <div className="rb-banner-actions">
              <button
                className="rb-banner-btn rb-banner-btn-outline"
                onClick={handleVerifyCompliance}
              >
                Run 3-Step Audit
              </button>
              <Link to="/" className="rb-banner-btn rb-banner-btn-gold">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* ─── COMPLIANCE FOOTER ─── */}
        <div className="rb-compliance-footer">
          <div className="rb-compliance-inner">
            <div className="rb-compliance-badge">
              <span className="badge-shield">🛡️</span>
              <span>Official NCAA Rulebook Audit <strong>CERTIFIED VALID</strong></span>
            </div>
            <div className="rb-compliance-meta">
              <span>Updated for 2025/2026 Academic Cluster</span>
              <span className="rb-compliance-sep">·</span>
              <span>Digital Ledger Hash: #R5-X662-V73</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
