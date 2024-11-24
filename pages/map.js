import LevelBar from '../components/LevelBar'
import Coins from '../components/Coins'
import WalkingCat from '../components/cat'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useEffect } from 'react'
import { MenuPopup } from './furniture'

// New DailyGoalsPopup Component
const DailyGoalsPopup = ({ goals, onClose }) => {
  return (
    <div className="absolute left-4 top-20 bg-white rounded-lg shadow-xl p-6 w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Daily Financial Goals</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="font-semibold text-blue-800">Daily Savings Target</p>
          <p className="text-2xl font-bold text-blue-600">${goals.dailySavingsTarget}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Days until goal: {goals.daysToGoal}</p>
          <p className="text-sm text-gray-600">Daily spending limit: ${goals.dailyDisposableIncome}</p>
          <p className="text-sm text-gray-600">Monthly debt payment: ${goals.monthlyDebtPayment}</p>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-700">Recommendations:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {goals.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600">{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// New DraggableFurniture component
const DraggableFurniture = ({ item, onMove, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'furniture',
    item: { id: item.id, ...item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (draggedItem, monitor) => {
      const dropResult = monitor.getDropResult()
      if (!dropResult) {
        onRemove(item.id)
      } else {
        onMove(item.id, dropResult)
      }
    },
  }))

  return (
    <img
      ref={drag}
      src={item.src}
      alt={item.name}
      style={{
        position: 'absolute',
        top: item.position.y,
        left: item.position.x,
        width: '100px',
        height: '100px',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    />
  )
}

// New DroppableMap component
const DroppableMap = ({ children, onDrop }) => {
  const [, drop] = useDrop(() => ({
    accept: 'furniture',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const mapRect = document.getElementById('game-map').getBoundingClientRect()
      const x = offset.x - mapRect.left
      const y = offset.y - mapRect.top
      
      const boundedX = Math.max(0, Math.min(x, mapRect.width - 100))
      const boundedY = Math.max(0, Math.min(y, mapRect.height - 100))
      
      return {
        x: boundedX,
        y: boundedY,
      }
    },
  }))

  return (
    <div 
      id="game-map" 
      ref={drop} 
      className="absolute inset-0 w-[80%] h-[80vh] mx-auto"
    >
      {children}
    </div>
  )
}

export default function Map() {
  const [showFurnitureMenu, setShowFurnitureMenu] = useState(false)
  const [placedFurniture, setPlacedFurniture] = useState([])
  const [dailyGoals, setDailyGoals] = useState(null)
  const [showDailyGoals, setShowDailyGoals] = useState(false)

  // Fetch daily goals
  useEffect(() => {
    const fetchDailyGoals = async () => {
      try {
        const response = await fetch('/api/getDailyGoals')
        const data = await response.json()
        if (data.goals && data.goals.length > 0) {
          setDailyGoals(data.goals[0]) // Get the most recent goals
        }
      } catch (error) {
        console.error('Error fetching daily goals:', error)
      }
    }

    fetchDailyGoals()
  }, [])

  const handleAddFurniture = (newItem) => {
    setPlacedFurniture((prev) => [
      ...prev,
      {
        ...newItem,
        position: { x: 100, y: 100 }, // Initial position
        id: `${newItem.id}-${Date.now()}`, // Unique ID
      },
    ])
  }

  const handleMoveFurniture = (id, newPosition) => {
    setPlacedFurniture((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    )
  }

  const handleRemoveFurniture = (id) => {
    setPlacedFurniture((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col">
        <LevelBar username="Player1" progress={60} />
        
        <div className="flex-1 flex items-center justify-center relative">
          {/* Daily Goals Button */}
          {dailyGoals && (
            <>
              <button
                className="absolute left-4 top-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg"
                onClick={() => setShowDailyGoals(!showDailyGoals)}
              >
                <img
                  src="/dailyGoals.png" // Add this image to your public folder
                  alt="Daily Goals"
                  className="w-9 h-7"
                />
              </button>

              {showDailyGoals && (
                <DailyGoalsPopup 
                  goals={dailyGoals} 
                  onClose={() => setShowDailyGoals(false)}
                />
              )}
            </>
          )}

          <img 
            src="/map.png"
            alt="Map"
            className="h-[80vh] w-[80%] border-2 border-black object-contain"
          />
          
          <DroppableMap>
            <WalkingCat />
            {placedFurniture.map((item) => (
              <DraggableFurniture
                key={item.id}
                item={item}
                onMove={handleMoveFurniture}
                onRemove={handleRemoveFurniture}
              />
            ))}
          </DroppableMap>

          {/* Shop Button */}
          <button
            className="absolute bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
            onClick={() => setShowFurnitureMenu(true)}
          >
            <img
              src="/shop.png" // Add this image to your public folder
              alt="Shop"
              className="w-8 h-8 mr-1"
            />
            Shop
          </button>

          {showFurnitureMenu && (
            <MenuPopup
              onClose={() => setShowFurnitureMenu(false)}
              onSelect={handleAddFurniture}
            />
          )}
        </div>

        {/* Coins Component */}
        <div className="absolute bottom-4 right-4 flex items-center bg-white px-3 py-1 rounded-lg shadow-md">
          <img
            src="/coins.png" // Add this image to your public folder
            alt="Coins"
            className="w-6 h-6 mr-2"
          />
          <span className="text-lg font-bold">{83300}</span>
        </div>
      </div>
    </DndProvider>
  )
}
