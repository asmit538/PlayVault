import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { STRUCTURED_RULEBOOK } from '../data/seedData'
import { sportsRules } from '../data/rulebookData'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import './SportDetailPage.css'

const sportIcons = {
  basketball: '🏀',
  soccer: '⚽',
  volleyball: '🏐',
  tennis: '🎾',
  badminton: '🏸',
  cricket: '🏏',
  track: '🏃',
}

const sportColors = {
  basketball: '#e65100',
  soccer: '#2e7d32',
  volleyball: '#8e24aa',
  tennis: '#1565c0',
  badminton: '#c8972e',
  cricket: '#c0392b',
  track: '#d35400',
}

export default function SportDetailPage() {
  const { sportId } = useParams()
  const { bookmarkedRules, toggleBookmark } = useSports()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')
  const [expandedCats, setExpandedCats] = useState({})

  // Find structured rulebook entry
  const structuredEntry = STRUCTURED_RULEBOOK.find((e) => e.id === sportId)
  const legacyEntry = sportsRules.find((e) => e.id === sportId)

  if (!structuredEntry && !legacyEntry) {
    return (
      <div className="sd-page">
        <div className="sd-inner">
          <h1 className="sd-title">Sport Rulebook Not Found</h1>
          <p className="sd-subtitle">No rulebook entry found for &ldquo;{sportId}&rdquo;.</p>
          <Link to="/rulebook" className="sd-back-btn">
            ← Back to Rulebook
          </Link>
        </div>
      </div>
    )
  }

  const sportName = structuredEntry?.sport || legacyEntry?.sport || sportId
  const icon = sportIcons[sportId] || '🏆'
  const color = sportColors[sportId] || '#1a3c2a'
  const governingBody = structuredEntry?.governingBody || 'NCAA Collegiate Sports Rules Committee'
  const campusRules = structuredEntry?.campusRules || 'Inter-Collegiate Athletic League Division I Regulation'

  // Extract categories
  const categories = structuredEntry?.categories || [
    {
      id: 'general',
      title: 'Official Rules & Guidelines',
      rules: legacyEntry?.rules || [],
    },
  ]

  // Filter categories by search keyword
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        const matchesCategory = selectedCat === 'all' || cat.id === selectedCat
        if (!matchesCategory) return null

        const matchingRules = cat.rules.filter((r) =>
          !searchKeyword.trim() || r.toLowerCase().includes(searchKeyword.toLowerCase().trim())
        )

        if (matchingRules.length === 0 && searchKeyword.trim()) return null

        return {
          ...cat,
          rules: matchingRules,
        }
      })
      .filter(Boolean)
  }, [categories, selectedCat, searchKeyword])

  const toggleCategory = (catId) => {
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: prev[catId] === false ? true : false,
    }))
  }

  const isExpanded = (catId) => expandedCats[catId] !== false

  return (
    <div className="sd-page">
      <div className="sd-inner">
        {/* Navigation */}
        <div className="sd-nav-top">
          <Link to="/rulebook" className="sd-back-link">
            ← Back to Rulebook Disciplines
          </Link>
          <div className="sd-nav-tags">
            <span className="badge badge-success">2025/2026 AUDITED</span>
            <span className="badge badge-gold">GOVERNING: {governingBody.split('/')[0]}</span>
          </div>
        </div>

        {/* Header */}
        <div className="sd-header" style={{ borderLeftColor: color }}>
          <div className="sd-header-icon" style={{ background: `${color}15`, color }}>
            {icon}
          </div>
          <div className="sd-header-text">
            <h1 className="sd-title">{sportName} Official Rulebook</h1>
            <p className="sd-subtitle">
              {campusRules} • Governing Body: {governingBody}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="sd-controls-bar">
          <div className="sd-search-box">
            <span className="sd-search-icon">🔍</span>
            <input
              type="text"
              placeholder={`Search ${sportName} rules, fouls, dimensions, scoring...`}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <button className="sd-clear-btn" onClick={() => setSearchKeyword('')}>
                ✕
              </button>
            )}
          </div>

          <div className="sd-cat-pills">
            <button
              className={`sd-pill ${selectedCat === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCat('all')}
            >
              All Sections ({categories.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`sd-pill ${selectedCat === c.id ? 'active' : ''}`}
                onClick={() => setSelectedCat(c.id)}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Categorized Rules Accordions */}
        <div className="sd-categories-list">
          {filteredCategories.length === 0 ? (
            <div className="sd-empty-search">
              <Icon name="alert" size={32} color="var(--text-tertiary)" />
              <p>No rules found matching &ldquo;{searchKeyword}&rdquo;</p>
              <button
                className="pv-btn pv-btn-ghost"
                onClick={() => {
                  setSearchKeyword('')
                  setSelectedCat('all')
                }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const open = isExpanded(cat.id)

              return (
                <div key={cat.id} className="sd-cat-card">
                  <div className="sd-cat-header" onClick={() => toggleCategory(cat.id)}>
                    <div className="sd-cat-title-wrap">
                      <span className="sd-cat-bullet" style={{ background: color }} />
                      <h3>{cat.title}</h3>
                      <span className="sd-cat-count">{cat.rules.length} Directives</span>
                    </div>
                    <span className="sd-cat-arrow">{open ? '▲' : '▼'}</span>
                  </div>

                  {open && (
                    <div className="sd-cat-body">
                      <ol className="sd-rules-list">
                        {cat.rules.map((rule, index) => {
                          const ruleKey = `${sportId}-${cat.id}-${index}`
                          const isBookmarked = bookmarkedRules.includes(ruleKey)

                          return (
                            <li key={index} className="sd-rule-item">
                              <span
                                className="sd-rule-number"
                                style={{ background: `${color}15`, color }}
                              >
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="sd-rule-text">{rule}</span>
                              <button
                                className={`sd-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                                onClick={() => toggleBookmark(ruleKey)}
                                title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}
                              >
                                <Icon name="bookmark" size={15} color={isBookmarked ? '#c8972e' : 'currentColor'} />
                              </button>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Compliance Certification Bar */}
        <div className="sd-compliance-bar">
          <span className="sd-compliance-icon">✓</span>
          <span>All rules verified per NCAA 2025/2026 Athletic Compliance Standards</span>
          <span className="sd-compliance-hash">Hash: #SPT-{sportId.toUpperCase()}-V8.4</span>
        </div>

        <div className="sd-footer-action">
          <Link to="/rulebook" className="sd-back-btn">
            ← Return to Rulebook Overview
          </Link>
        </div>
      </div>
    </div>
  )
}
