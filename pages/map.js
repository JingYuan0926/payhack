import LevelBar from '../components/LevelBar'
import Coins from '../components/Coins'
import WalkingCat from '../components/cat'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useRef } from 'react'
import { MenuPopup } from './furniture'

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

          <button
            className="absolute bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
            onClick={() => setShowFurnitureMenu(true)}
          >
            Shop
          </button>

          {showFurnitureMenu && (
            <MenuPopup
              onClose={() => setShowFurnitureMenu(false)}
              onSelect={handleAddFurniture}
            />
          )}
        </div>

        <Coins balance={83300} />
      </div>
    </DndProvider>
  )
}
