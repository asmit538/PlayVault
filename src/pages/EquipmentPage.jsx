import { useState, useMemo } from 'react'
import { useSports } from '../context/SportsContext'
import { Icon } from '../components/common/Icons'
import Modal from '../components/common/Modal'
import './EquipmentPage.css'

export default function EquipmentPage() {
  const {
    equipment,
    addEquipment,
    issueEquipment,
    returnEquipment,
    reportDamage,
    repairEquipment,
    openModal,
  } = useSports()

  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Local modal states for Damage & Return
  const [damageModalItem, setDamageModalItem] = useState(null)
  const [damageQty, setDamageQty] = useState(1)
  const [repairModalItem, setRepairModalItem] = useState(null)
  const [repairQty, setRepairQty] = useState(1)
  const [returnModalItem, setReturnModalItem] = useState(null)

  // Add Item form modal state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemSport, setNewItemSport] = useState('soccer')
  const [newItemCategory, setNewItemCategory] = useState('Balls')
  const [newItemQty, setNewItemQty] = useState(10)
  const [newItemCondition, setNewItemCondition] = useState('Good')
  const [newItemLocation, setNewItemLocation] = useState('Central Athletics Warehouse')

  // Calculated Inventory Metrics
  const totalQuantity = useMemo(() => equipment.reduce((sum, item) => sum + (item.totalQuantity || 0), 0), [equipment])
  const availableCount = useMemo(() => equipment.reduce((sum, item) => sum + (item.availableQuantity || 0), 0), [equipment])
  const inUseCount = useMemo(() => equipment.reduce((sum, item) => sum + (item.inUseQuantity || 0), 0), [equipment])
  const damagedCount = useMemo(() => equipment.reduce((sum, item) => sum + (item.damagedQuantity || 0), 0), [equipment])

  // Filtered Equipment List
  const filteredItems = useMemo(() => {
    return equipment.filter((item) => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter
      const matchStatus = statusFilter === 'All' || item.status === statusFilter
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sport.toLowerCase().includes(q) ||
        item.storageLocation?.toLowerCase().includes(q)
      return matchCat && matchStatus && matchQuery
    })
  }, [equipment, categoryFilter, statusFilter, searchQuery])

  // Add Item Handler
  const handleCreateItem = async (e) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    await addEquipment({
      name: newItemName.trim(),
      sport: newItemSport,
      category: newItemCategory,
      totalQuantity: parseInt(newItemQty, 10) || 1,
      condition: newItemCondition,
      storageLocation: newItemLocation,
    })

    setShowAddForm(false)
    setNewItemName('')
    setNewItemQty(10)
  }

  // Categories list
  const categoryChips = [
    { label: 'All Items', val: 'All', icon: '📦' },
    { label: 'Balls & Spheres', val: 'Balls', icon: '⚽' },
    { label: 'Bats & Rackets', val: 'Bats & Rackets', icon: '🏏' },
    { label: 'Protective Gear', val: 'Protective', icon: '🛡️' },
    { label: 'Nets & Goals', val: 'Nets & Goals', icon: '🥅' },
    { label: 'Accessories', val: 'Miscellaneous', icon: '🔧' },
  ]

  return (
    <div className="eq-page">
      <div className="eq-container">

        {/* ─── HEADER CARD ─── */}
        <div className="eq-header">
          <div className="eq-header-left">
            <div className="eq-header-badge-row">
              <span className="eq-header-badge">
                <span className="badge-dot-gold" />
                VARSITY EQUIPMENT VAULT · ASSET LOGISTICS
              </span>
              <span className="eq-header-rfid">✓ RFID BARCODE CALIBRATED</span>
            </div>
            <h1 className="eq-title">Athletic Equipment Vault &amp; Logistics</h1>
            <p className="eq-subtitle">
              Comprehensive real-time inventory ledger, athlete checkout protocols, maintenance tracking, and NCAA certified ball pressure auditing.
            </p>
          </div>
          <div className="eq-header-right">
            <button
              className="eq-btn eq-btn-green"
              onClick={() => setShowAddForm(true)}
            >
              <span className="btn-plus">+</span>
              <span>Register New Asset</span>
            </button>
          </div>
        </div>

        {/* ─── INVENTORY KPI METRICS ─── */}
        <div className="eq-stats-row">
          <div className="eq-stat-card">
            <div className="eq-stat-top">
              <span className="eq-stat-label">Total Assets Tracked</span>
              <div className="eq-stat-icon-wrap green">
                <Icon name="tool" size={20} />
              </div>
            </div>
            <div className="eq-stat-value">
              <span className="eq-stat-number">{totalQuantity}</span>
              <span className="eq-stat-unit">Units Registered</span>
            </div>
            <div className="eq-stat-progress">
              <div className="eq-progress-bar" style={{ width: '100%', background: 'var(--color-primary)' }} />
            </div>
            <div className="eq-stat-footnote">
              <span className="check-icon">✓</span> 100% Barcode verified in vault
            </div>
          </div>

          <div className="eq-stat-card">
            <div className="eq-stat-top">
              <span className="eq-stat-label">Available for Dispatch</span>
              <div className="eq-stat-icon-wrap emerald">
                <Icon name="check" size={20} />
              </div>
            </div>
            <div className="eq-stat-value">
              <span className="eq-stat-number" style={{ color: 'var(--color-success)' }}>
                {availableCount}
              </span>
              <span className="eq-stat-unit">In Vault Stock</span>
            </div>
            <div className="eq-stat-progress">
              <div
                className="eq-progress-bar"
                style={{
                  width: `${Math.round((availableCount / (totalQuantity || 1)) * 100)}%`,
                  background: 'var(--color-success)',
                }}
              />
            </div>
            <div className="eq-stat-footnote">
              Immediate checkout ready for training
            </div>
          </div>

          <div className="eq-stat-card">
            <div className="eq-stat-top">
              <span className="eq-stat-label">Active Loans &amp; Checkouts</span>
              <div className="eq-stat-icon-wrap gold">
                <Icon name="activity" size={20} />
              </div>
            </div>
            <div className="eq-stat-value">
              <span className="eq-stat-number" style={{ color: '#b8860b' }}>
                {inUseCount}
              </span>
              <span className="eq-stat-unit">Units In Play</span>
            </div>
            <div className="eq-stat-progress">
              <div
                className="eq-progress-bar"
                style={{
                  width: `${Math.round((inUseCount / (totalQuantity || 1)) * 100)}%`,
                  background: 'var(--color-gold)',
                }}
              />
            </div>
            <div className="eq-stat-footnote">
              Assigned to active collegiate squads
            </div>
          </div>

          <div className="eq-stat-card">
            <div className="eq-stat-top">
              <span className="eq-stat-label">Under Repair / Maintenance</span>
              <div className="eq-stat-icon-wrap red">
                <Icon name="alert-triangle" size={20} />
              </div>
            </div>
            <div className="eq-stat-value">
              <span className="eq-stat-number" style={{ color: 'var(--color-danger)' }}>
                {damagedCount}
              </span>
              <span className="eq-stat-unit">Isolated</span>
            </div>
            <div className="eq-stat-progress">
              <div
                className="eq-progress-bar"
                style={{
                  width: `${Math.round((damagedCount / (totalQuantity || 1)) * 100)}%`,
                  background: 'var(--color-danger)',
                }}
              />
            </div>
            <div className="eq-stat-footnote">
              Locked from game day checkout
            </div>
          </div>
        </div>

        {/* ─── FILTERS & SEARCH TOOLBAR ─── */}
        <div className="eq-filters-bar">
          <div className="eq-filters-top">
            <div className="eq-search-wrap">
              <span className="eq-search-icon">🔍</span>
              <input
                className="eq-search-input"
                placeholder="Search equipment items, sport disciplines, storage sheds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="eq-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <div className="eq-status-filter-group">
              <span className="eq-filter-label">STATUS:</span>
              <select
                className="eq-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available Only</option>
                <option value="In Use">In Use Only</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="eq-category-chips">
            {categoryChips.map((cat) => (
              <button
                key={cat.val}
                className={`eq-chip ${categoryFilter === cat.val ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.val)}
              >
                <span className="chip-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── EQUIPMENT DIRECTORY TABLE ─── */}
        <div className="eq-table-card">
          {filteredItems.length === 0 ? (
            <div className="eq-empty-state">
              <div className="empty-icon">🔧</div>
              <h3>No equipment assets found</h3>
              <p>Try resetting the category filter or searching with different keywords.</p>
              <button
                className="eq-reset-btn"
                onClick={() => {
                  setCategoryFilter('All')
                  setStatusFilter('All')
                  setSearchQuery('')
                }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="eq-table-wrap">
              <table className="eq-table">
                <thead>
                  <tr>
                    <th>Item Specification</th>
                    <th>Sport</th>
                    <th>Category</th>
                    <th>Stock Health &amp; Availability</th>
                    <th style={{ textAlign: 'center' }}>In Use</th>
                    <th style={{ textAlign: 'center' }}>Damaged</th>
                    <th>Storage Shed</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const isAvailable = item.availableQuantity > 0 && item.status !== 'Under Maintenance'
                    const availPct = Math.round((item.availableQuantity / item.totalQuantity) * 100)
                    const inUsePct = Math.round(((item.inUseQuantity || 0) / item.totalQuantity) * 100)
                    const damPct = Math.round(((item.damagedQuantity || 0) / item.totalQuantity) * 100)

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="eq-item-title-box">
                            <strong className="item-name">{item.name}</strong>
                            <span className="eq-condition-pill">
                              Condition: <strong>{item.condition}</strong>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="eq-sport-tag">{item.sport?.toUpperCase()}</span>
                        </td>
                        <td className="eq-cat-cell">{item.category}</td>
                        <td>
                          <div className="eq-stock-visual-box">
                            <div className="eq-qty-row">
                              <span className="avail-count">{item.availableQuantity}</span>
                              <span className="total-count">/ {item.totalQuantity} Units</span>
                            </div>
                            {/* Visual composite health bar */}
                            <div className="eq-composite-bar" title={`Available: ${item.availableQuantity}, In-Use: ${item.inUseQuantity || 0}, Damaged: ${item.damagedQuantity || 0}`}>
                              <div className="bar-seg-avail" style={{ width: `${availPct}%` }} />
                              <div className="bar-seg-inuse" style={{ width: `${inUsePct}%` }} />
                              <div className="bar-seg-dam" style={{ width: `${damPct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {item.inUseQuantity || 0}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: item.damagedQuantity > 0 ? 'var(--color-danger)' : 'inherit', fontWeight: item.damagedQuantity > 0 ? 800 : 400 }}>
                            {item.damagedQuantity || 0}
                          </span>
                        </td>
                        <td>
                          <span className="eq-location-text">📍 {item.storageLocation}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.status === 'Available'
                              ? 'badge-success'
                              : item.status === 'In Use'
                              ? 'badge-info'
                              : 'badge-danger'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="eq-action-buttons">
                            {isAvailable ? (
                              <button
                                className="eq-action-btn eq-action-btn--issue"
                                onClick={() => openModal('issueEquipment', { equipment: item })}
                                title="Issue / Checkout Gear"
                              >
                                Checkout
                              </button>
                            ) : (
                              <button className="eq-action-btn eq-action-btn--disabled" disabled title="No units available">
                                Locked
                              </button>
                            )}

                            {item.inUseQuantity > 0 && (
                              <button
                                className="eq-action-btn eq-action-btn--return"
                                onClick={() => setReturnModalItem(item)}
                                title="Record Item Return"
                              >
                                Return
                              </button>
                            )}

                            {item.availableQuantity > 0 && (
                              <button
                                className="eq-action-btn eq-action-btn--damage"
                                onClick={() => {
                                  setDamageModalItem(item)
                                  setDamageQty(1)
                                }}
                                title="Report Damaged Item"
                              >
                                Damage
                              </button>
                            )}

                            {item.damagedQuantity > 0 && (
                              <button
                                className="eq-action-btn eq-action-btn--repair"
                                onClick={() => {
                                  setRepairModalItem(item)
                                  setRepairQty(1)
                                }}
                                title="Restore Repaired Unit"
                              >
                                Repair
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── MODAL: REPORT DAMAGE ─── */}
        {damageModalItem && (
          <Modal
            isOpen={true}
            onClose={() => setDamageModalItem(null)}
            title="Report Equipment Damage"
            subtitle={`${damageModalItem.name} (${damageModalItem.sport?.toUpperCase()})`}
          >
            <div className="pv-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Isolate damaged gear from circulation to maintain compliance with NCAA safety requirements.
              </p>
              <div className="pv-form-group">
                <label>Number of Damaged Units</label>
                <input
                  type="number"
                  min="1"
                  max={damageModalItem.availableQuantity}
                  value={damageQty}
                  onChange={(e) => setDamageQty(parseInt(e.target.value, 10) || 1)}
                />
              </div>
              <div className="pv-form-actions">
                <button className="pv-btn pv-btn-ghost" onClick={() => setDamageModalItem(null)}>
                  Cancel
                </button>
                <button
                  className="pv-btn pv-btn-primary"
                  style={{ background: 'var(--color-danger)' }}
                  onClick={async () => {
                    await reportDamage(damageModalItem.id, damageQty, 'Field wear and inspection audit')
                    setDamageModalItem(null)
                  }}
                >
                  Confirm Damage Isolation
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── MODAL: REPAIR EQUIPMENT ─── */}
        {repairModalItem && (
          <Modal
            isOpen={true}
            onClose={() => setRepairModalItem(null)}
            title="Restore Repaired Equipment"
            subtitle={`${repairModalItem.name} · Return to Active Vault`}
          >
            <div className="pv-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Re-certify repaired gear back into the active inventory.
              </p>
              <div className="pv-form-group">
                <label>Number of Units Repaired</label>
                <input
                  type="number"
                  min="1"
                  max={repairModalItem.damagedQuantity}
                  value={repairQty}
                  onChange={(e) => setRepairQty(parseInt(e.target.value, 10) || 1)}
                />
              </div>
              <div className="pv-form-actions">
                <button className="pv-btn pv-btn-ghost" onClick={() => setRepairModalItem(null)}>
                  Cancel
                </button>
                <button
                  className="pv-btn pv-btn-primary"
                  onClick={async () => {
                    await repairEquipment(repairModalItem.id, repairQty)
                    setRepairModalItem(null)
                  }}
                >
                  Return to Active Stock
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── MODAL: RETURN GEAR ─── */}
        {returnModalItem && (
          <Modal
            isOpen={true}
            onClose={() => setReturnModalItem(null)}
            title="Record Equipment Return"
            subtitle={`${returnModalItem.name} · Checkout Check-In`}
          >
            <div className="pv-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Check in loaned gear back to the central athletics warehouse.
              </p>
              <div className="pv-form-group">
                <label>Select Loan Assignment to Check In</label>
                {(returnModalItem.assignments || []).map((asgn) => (
                  <div
                    key={asgn.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-card-2)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <strong>{asgn.teamName || asgn.playerName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Qty: {asgn.quantity} · Loaned on {asgn.issuedDate}
                      </div>
                    </div>
                    <button
                      className="pv-btn pv-btn-primary"
                      onClick={async () => {
                        await returnEquipment(returnModalItem.id, asgn.id)
                        setReturnModalItem(null)
                      }}
                    >
                      Receive Return
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}

        {/* ─── MODAL: ADD EQUIPMENT ITEM ─── */}
        {showAddForm && (
          <Modal
            isOpen={true}
            onClose={() => setShowAddForm(false)}
            title="Register New Equipment Asset"
            subtitle="Add collegiate athletic asset to verified warehouse ledger"
          >
            <form onSubmit={handleCreateItem} className="pv-form">
              <div className="pv-form-group">
                <label>Item Name / Model</label>
                <input
                  type="text"
                  placeholder="e.g. Wilson NCAA Game Basketball"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                />
              </div>

              <div className="pv-form-row">
                <div className="pv-form-group">
                  <label>Sport Discipline</label>
                  <select
                    value={newItemSport}
                    onChange={(e) => setNewItemSport(e.target.value)}
                  >
                    <option value="basketball">Basketball</option>
                    <option value="soccer">Soccer</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="tennis">Tennis</option>
                    <option value="cricket">Cricket</option>
                    <option value="track">Track &amp; Field</option>
                    <option value="badminton">Badminton</option>
                  </select>
                </div>

                <div className="pv-form-group">
                  <label>Asset Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    <option value="Balls">Balls</option>
                    <option value="Bats & Rackets">Bats &amp; Rackets</option>
                    <option value="Protective">Protective Gear</option>
                    <option value="Nets & Goals">Nets &amp; Goals</option>
                    <option value="Miscellaneous">Accessories / Other</option>
                  </select>
                </div>
              </div>

              <div className="pv-form-row">
                <div className="pv-form-group">
                  <label>Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    required
                  />
                </div>

                <div className="pv-form-group">
                  <label>Initial Condition</label>
                  <select
                    value={newItemCondition}
                    onChange={(e) => setNewItemCondition(e.target.value)}
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Good">Good Condition</option>
                    <option value="Fair">Fair / Practice Use</option>
                  </select>
                </div>
              </div>

              <div className="pv-form-group">
                <label>Storage Location Shed</label>
                <input
                  type="text"
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                />
              </div>

              <div className="pv-form-actions">
                <button
                  type="button"
                  className="pv-btn pv-btn-ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pv-btn pv-btn-primary">
                  Save Asset Record
                </button>
              </div>
            </form>
          </Modal>
        )}

      </div>
    </div>
  )
}
