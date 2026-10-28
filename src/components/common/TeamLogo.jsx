import React from 'react'

/**
 * TeamLogo - Generates a stylized sports team shield badge
 * Pure SVG + CSS: no external dependencies, no emoji, no copyrighted logos.
 */
export default function TeamLogo({
  team,
  name,
  colors,
  sport,
  size = 'md',
  className = '',
  showGlow = false,
}) {
  // Extract team metadata
  const teamName = team?.name || name || 'Team'
  const teamColors = team?.avatarColors || colors || ['#2563eb', '#1d4ed8', '#60a5fa']
  const teamSport = team?.sport || sport || 'general'

  const primaryColor = teamColors[0] || '#3b82f6'
  const secondaryColor = teamColors[1] || '#1d4ed8'
  const accentColor = teamColors[2] || '#f59e0b'

  // Extract initials (e.g. "State Tigers" -> "ST")
  const initials = teamName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PV'

  // Pixel sizing mapping
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72,
    xxl: 96,
  }

  const px = typeof size === 'number' ? size : sizeMap[size] || 42
  const uniqueId = `team-badge-${teamName.replace(/[^a-zA-Z0-9]/g, '')}-${px}`

  return (
    <div
      className={`team-logo-badge ${className}`}
      style={{
        width: px,
        height: px,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        filter: showGlow ? `drop-shadow(0 0 8px ${primaryColor}66)` : 'none',
      }}
      title={teamName}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`${uniqueId}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <linearGradient id={`${uniqueId}-stroke`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>

          <filter id={`${uniqueId}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Shield Path */}
        <path
          d="M 50 4 
             L 88 18 
             L 88 56 
             C 88 78 50 96 50 96 
             C 50 96 12 78 12 56 
             L 12 18 
             Z"
          fill={`url(#${uniqueId}-grad)`}
          stroke={`url(#${uniqueId}-stroke)`}
          strokeWidth="3"
          filter={`url(#${uniqueId}-shadow)`}
        />

        {/* Inner Shield Accent Contour */}
        <path
          d="M 50 12 
             L 80 23 
             L 80 54 
             C 80 71 50 86 50 86 
             C 50 86 20 71 20 54 
             L 20 23 
             Z"
          fill="rgba(0,0,0,0.18)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
        />

        {/* Athletic Diagonal Banner / Chevron */}
        <path
          d="M 12 40 L 88 40 L 88 46 L 12 46 Z"
          fill="rgba(255,255,255,0.08)"
        />

        {/* Small Sport Star / Accent Marker at the top */}
        <polygon
          points="50,16 52,21 57,21 53,24 55,29 50,26 45,29 47,24 43,21 48,21"
          fill={accentColor}
          opacity="0.9"
        />

        {/* Athletic Initials Typography */}
        <text
          x="50"
          y="62"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
          fontWeight="900"
          fontSize="32"
          letterSpacing="1"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
          }}
        >
          {initials}
        </text>

        {/* Bottom Sport Notch */}
        <circle cx="50" cy="80" r="2.5" fill={accentColor} opacity="0.8" />
      </svg>
    </div>
  )
}
