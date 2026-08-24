import { useState, useEffect } from 'react'
import './EquipmentPage.css'

const EQUIPMENT_KEY = 'playvault_equipment'

const INITIAL_EQUIPMENT = [
  { id: '1', name: 'Soccer Balls', category: 'Balls', quantity: 18, condition: 'Good', status: 'Available' },
  { id: '2', name: 'Basketballs', category: 'Balls', quantity: 12, condition: 'Good', status: 'Available' },
  { id: '3', name: 'Badminton Rackets', category: 'Bats & Rackets', quantity: 16, condition: 'New', status: 'Available' },
  { id: '4', name: 'Volleyball Nets', category: 'Nets & Goals', quantity: 6, condition: 'Fair', status: 'In Use' },
  { id: '5', name: 'Cricket Helmets', category: 'Protective', quantity: 8, condition: 'Fair', status: 'Under Maintenance' },
  { id: '6', name: 'Table Tennis Paddles', category: 'Bats & Rackets', quantity: 10, condition: 'Good', status: 'Available' },
  { id: '7', name: 'Tennis Balls (Cans)', category: 'Balls', quantity: 24, condition: 'New', status: 'Available' },
  { id: '8', name: 'Football Pads', category: 'Protective', quantity: 14, condition: 'Good', status: 'In Use' },
  { id: '9', name: 'Volleyballs', category: 'Balls', quantity: 15, condition: 'Good', status: 'Available' },
  { id: '10', name: 'Training Cones', category: 'Miscellaneous', quantity: 40, condition: 'Good', status: 'Available' }
]

function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState([])
  const [category, setCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('Balls')
  const [quantityInput, setQuantityInput] = useState(1)
  const [conditionInput, setConditionInput] = useState('Good')
  const [statusInput, setStatusInput] = useState('Available')

  useEffect(() => {
    const saved = localStorage.getItem(EQUIPMENT_KEY)
    if (saved) {
      try {
        setEquipmentList(JSON.parse(saved))
      } catch (e) {
        setEquipmentList(INITIAL_EQUIPMENT)
        localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(INITIAL_EQUIPMENT))
      }
    } else {
      setEquipmentList(INITIAL_EQUIPMENT)
      localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(INITIAL_EQUIPMENT))
    }
  }, [])

  const saveList = (newList) => {
    setEquipmentList(newList)
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(newList))
  }

  const handleAddEquipment = (e) => {
    e.preventDefault()
    if (!nameInput.trim()) return

    const newItem = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      category: categoryInput,
      quantity: parseInt(quantityInput, 10) || 1,
      condition: conditionInput,
      status: statusInput
    }

    const updated = [newItem, ...equipmentList]
    saveList(updated)

    setNameInput('')
    setQuantityInput(1)
    setShowForm(false)
  }

  const handleQtyChange = (id, delta) => {
    const updated = equipmentList.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    saveList(updated)
  }

  const handleDelete = (id) => {
    const updated = equipmentList.filter((item) => item.id !== id)
    saveList(updated)
  }

  const filteredItems = equipmentList.filter((item) => {
    if (category === 'All') return true
    return item.category === category
  })

  const totalQuantity = equipmentList.reduce((sum, item) => sum + item.quantity, 0)
  const availableCount = equipmentList.filter(i => i.status === 'Available').length
  const maintenanceCount = equipmentList.filter(i => i.status === 'Under Maintenance').length

  const categories = ['All', 'Balls', 'Bats & Rackets', 'Protective', 'Nets & Goals', 'Miscellaneous']

  return (
    <div className="equipment-page">
      <div className="equipment-header">
        <div>
          <h1>Sports Equipment Inventory</h1>
          <p className="page-tagline">Track and manage sports equipment in the college storage.</p>
        </div>

        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          <span>{showForm ? 'Close Form' : '+ Add Equipment'}</span>
        </button>
      </div>

      <div className="equipment-stats-row">
        <div className="equip-stat-card green">
          <div className="stat-badge-text green">Total Units</div>
          <div className="num">{totalQuantity}</div>
          <div className="lbl">Items in Stock</div>
        </div>

        <div className="equip-stat-card blue">
          <div className="stat-badge-text blue">Categories</div>
          <div className="num">{equipmentList.length}</div>
          <div className="lbl">Equipment Types</div>
        </div>

        <div className="equip-stat-card emerald">
          <div className="stat-badge-text emerald">Available</div>
          <div className="num">{availableCount}</div>
          <div className="lbl">Ready for Use</div>
        </div>

        <div className="equip-stat-card amber">
          <div className="stat-badge-text amber">Maintenance</div>
          <div className="num">{maintenanceCount}</div>
          <div className="lbl">Needs Repair</div>
        </div>
      </div>

      {showForm && (
        <form className="equipment-form-card" onSubmit={handleAddEquipment}>
          <div className="form-card-title-row">
            <h3>Add New Equipment</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Equipment Name</label>
              <input
                type="text"
                placeholder="e.g. Football Helmets"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
                <option value="Balls">Balls</option>
                <option value="Bats & Rackets">Bats & Rackets</option>
                <option value="Protective">Protective</option>
                <option value="Nets & Goals">Nets & Goals</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Condition</label>
              <select value={conditionInput} onChange={(e) => setConditionInput(e.target.value)}>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Replacement">Needs Replacement</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="add-btn">
              Save Equipment
            </button>
          </div>
        </form>
      )}

      <div className="controls-row">
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="equipment-grid">
        {filteredItems.length === 0 ? (
          <div className="empty-state-box">
            <p>No equipment items found in this category.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="equipment-card">
              <div className="card-inner-top">
                <div className="card-top">
                  <div>
                    <h4 className="item-title">{item.name}</h4>
                    <div className="card-category">{item.category}</div>
                  </div>

                  <span
                    className={`status-badge ${
                      item.status === 'Available'
                        ? 'available'
                        : item.status === 'In Use'
                        ? 'in-use'
                        : 'maintenance'
                    }`}
                  >
                    <span className="status-dot"></span>
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="card-meta">
                  <div className="condition-chip">
                    <span>Condition:</span> <strong>{item.condition}</strong>
                  </div>

                  <div className="qty-counter">
                    <button
                      className="qty-btn"
                      onClick={() => handleQtyChange(item.id, -1)}
                      title="Decrease"
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQtyChange(item.id, 1)}
                      title="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-actions-bottom">
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default EquipmentPage
