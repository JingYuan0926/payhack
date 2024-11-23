import LevelBar from '../components/LevelBar'
import Coins from '../components/Coins'
import WalkingCat from '../components/cat'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useEffect } from 'react'
import { MenuPopup } from './furniture'
import DailyGoals from '../components/DailyGoals'
import { useState, useEffect } from 'react'

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
export default function Map({ initialBalance, initialProgress, username }) {
  const [catEmotion, setCatEmotion] = useState('love');
  const [catMessage, setCatMessage] = useState('');

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case '1':
          setCatEmotion('angry');
          setCatMessage("Why are you spending so much on Starbucks? You're over budget today! ☕💸");
          break;
        case '2':
          setCatEmotion('happy');
          setCatMessage("Great job saving money this week! Keep it up! 💰");
          break;
        case '3':
          setCatEmotion('surprise');
          setCatMessage("Did you just make a big purchase? Let's review your spending! 😮");
          break;
        case '4':
          setCatEmotion('sad');
          setCatMessage("Your savings goal is falling behind schedule... 😢");
          break;
        // Add more cases as needed
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <LevelBar username={username} progress={initialProgress} />

      <div className="flex-1 flex items-center justify-center relative">
        <img
          src="/map.png"
          alt="Map"
          className="h-[80vh] w-[80%] border-2 border-black object-contain"
        />
        <div className="absolute inset-0 w-[80%] h-[80vh] mx-auto">
          <WalkingCat emotion={catEmotion} message={catMessage} />
        </div>
      </div>

  return (
    <div 
      id="game-map" 
      ref={drop} 
      className="absolute inset-0 w-full h-full"
    >
      {children}
    </div>
  )
}

export default function Map() {
  const [showFurnitureMenu, setShowFurnitureMenu] = useState(false)
  const [placedFurniture, setPlacedFurniture] = useState([])
  const [showDailyGoals, setShowDailyGoals] = useState(false)
  const [goalsKey, setGoalsKey] = useState(0)

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

  const handleGoalsUpdate = () => {
    setGoalsKey(prev => prev + 1)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col">
        <LevelBar username="Player1" progress={60} />
        
        <div className="flex-1 relative">
          {/* Daily Goals Button */}
          <button
            className="absolute left-4 top-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg z-10"
            onClick={() => setShowDailyGoals(!showDailyGoals)}
          >
            <img
              src="/goals-icon.png"
              alt="Daily Goals"
              className="w-8 h-8"
            />
          </button>

          <DailyGoals 
            key={goalsKey}
            showPopup={showDailyGoals}
            onClose={() => setShowDailyGoals(false)}
          />

          <div className="w-[80%] h-[80vh] mx-auto relative">
            <img 
              src="/map.png"
              alt="Map"
              className="absolute inset-0 w-full h-full object-fill border-2 border-black"
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
          </div>

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
