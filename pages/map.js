import LevelBar from '../components/LevelBar'
import Coins from '../components/Coins'
import WalkingCat from '../components/cat'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useEffect } from 'react'
import { MenuPopup } from './furniture'
import DailyGoals from '../components/DailyGoals'
import { useRouter } from 'next/router'
import CatModal from '../components/CatModal'

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

// Add this near the top of your file
const loadFurniture = async () => {
  const response = await fetch('/api/furniture');
  return response.json();
};

const saveFurnitureToServer = async (furniture) => {
  await fetch('/api/furniture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(furniture),
  });
};

export default function Map() {
  const router = useRouter()
  const [showFurnitureMenu, setShowFurnitureMenu] = useState(false)
  const [placedFurniture, setPlacedFurniture] = useState([])
  const [showDailyGoals, setShowDailyGoals] = useState(false)
  const [catEmotion, setCatEmotion] = useState('love')
  const [catMessage, setCatMessage] = useState('')
  const [showCatModal, setShowCatModal] = useState(false)
  const [catModalMessage, setCatModalMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load furniture data
  useEffect(() => {
    const loadInitialFurniture = async () => {
      try {
        const response = await fetch('/api/furniture');
        const data = await response.json();
        setPlacedFurniture(data);
      } catch (error) {
        console.error('Error loading furniture:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialFurniture();
  }, []);

  // Handle key press events
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === '6') {
        router.push('/dashboard')
      }

      switch (event.key) {
        case '1':
          setCatEmotion('angry')
          setCatMessage("Why are you spending so much on Starbucks? You're over budget today! ☕💸")
          break
        case '2':
          setCatEmotion('happy')
          setCatMessage("Great job saving money this week! Keep it up! 💰")
          break
        case '3':
          setCatEmotion('surprise')
          setCatMessage("Did you just make a big purchase? Let's review your spending! 😮")
          break
        case '4':
          setCatEmotion('sad')
          setCatMessage("Your savings goal is falling behind schedule... 😢")
          break
        case '5':
          setCatEmotion('love')
          setCatMessage("You're doing amazing with your finances! I'm so proud! 💖")
          setShowCatModal(true)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [router])

  const handleAddFurniture = (newItem) => {
    setPlacedFurniture((prev) => {
      const updated = [
        ...prev,
        {
          ...newItem,
          position: { x: 100, y: 100 },
          id: `${newItem.id}-${Date.now()}`,
        },
      ];
      saveFurnitureToServer(updated);
      return updated;
    });
  };

  const handleMoveFurniture = (id, newPosition) => {
    setPlacedFurniture((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item
      );
      saveFurnitureToServer(updated);
      return updated;
    });
  };

  const handleRemoveFurniture = (id) => {
    setPlacedFurniture((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveFurnitureToServer(updated);
      return updated;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col">
        <LevelBar username="Jack" progress={60} />
        
        <div className="flex-1 flex items-center justify-center relative">
          {/* Daily Goals Button */}
          <button
            className="absolute left-4 top-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg z-[9998]"
            onClick={() => setShowDailyGoals(!showDailyGoals)}
          >
            <img
              src="/dailyGoals.png"
              alt="Daily Goals"
              className="w-9 h-7"
            />
          </button>

          <DailyGoals 
            showPopup={showDailyGoals}
            onClose={() => setShowDailyGoals(false)}
          />

          <div className="relative w-[80%] h-[80vh]">
            <img 
              src="/map.png"
              alt="Map"
              className="absolute inset-0 w-full h-full border-2 border-black object-cover"
            />
          </div>
          
          <DroppableMap>
            <WalkingCat emotion={catEmotion} message={catMessage} />
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
        <Coins balance={1500} />
      </div>
      <CatModal 
        isOpen={showCatModal} 
        onOpenChange={setShowCatModal}
        initialMessage={catModalMessage}
        isCase5={true}
      />
    </DndProvider>
  )
}
