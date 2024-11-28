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
import WeeklyChallenge from '../components/WeeklyChallenge'




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
  //gamegame
  return (
    <div 
      id="game-map" 
      ref={drop} 
      className="absolute inset-0 w-[80%] h-[70vh] mx-auto"
    >
      {children}
    </div>
  )
}

export default function Map() {
  const router = useRouter()
  const [showFurnitureMenu, setShowFurnitureMenu] = useState(false)
  const [placedFurniture, setPlacedFurniture] = useState([])
  const [showDailyGoals, setShowDailyGoals] = useState(false)
  const [catEmotion, setCatEmotion] = useState('love')
  const [catMessage, setCatMessage] = useState('')
  const [showCatModal, setShowCatModal] = useState(false)
  const [catModalMessage, setCatModalMessage] = useState('')
  const [loveLevel, setLoveLevel] = useState(90);
  const [progress, setProgress] = useState(60);
  const [rewards, setRewards] = useState({
    food: [{ name: "Premium Cat Food", quantity: 1 }],
    vouchers: [{ name: "TNG Cashback RM5 Voucher", code: "TNGRM5-484861", id: 1 }]
  });
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showSpendingHistory, setShowSpendingHistory] = useState(false);

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

  const handleChallengeComplete = (isCompleting) => {
    setLoveLevel(prev => {
      const newLevel = isCompleting ? prev + 5 : prev - 5;
      
      // If new level would exceed 100%, reset to 30%
      if (newLevel >= 100) {
        return 30;
      }
      
      // Otherwise, keep within 0-100 range
      return Math.min(Math.max(newLevel, 0), 100);
    });
    
    // Return the current level for the WeeklyChallenge component
    return loveLevel;
  };

  const handleFeedCat = (value = 5) => {
    setProgress(prev => {
      const newProgress = prev + value;
      return Math.min(Math.max(newProgress, 0), 100); // Keeps progress between 0 and 100
    });
  };

  // Function to check and add rewards when love bar reaches 100%
  const checkAndAddRewards = (newLoveLevel) => {
    if (newLoveLevel >= 100) {
      // Reset love level
      setLoveLevel(0);
      
      // Add new rewards
      setRewards(prev => ({
        food: [...prev.food, { name: "Premium Cat Food", quantity: 1 }],
        vouchers: [
          ...prev.vouchers, 
          { 
            name: "TNG Cashback RM5 Voucher", 
            code: `TNGRM5-${Math.random().toString(36).substr(2, 6)}`,
            id: Date.now()
          }
        ]
      }));
    } else {
      setLoveLevel(newLoveLevel);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <LevelBar username="Jack" progress={progress} dangerProgress={loveLevel} onFeedCat={handleFeedCat} />
        
        <div
          style={{
            position: "absolute",
            top: "2%",
            left: "37%",
            zIndex: 9999,
            display: showSpendingHistory ? "none" : "block",
          }}
        >
          <WeeklyChallenge onChallengeComplete={handleChallengeComplete} onFeedCat={handleFeedCat} />
        </div>        
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
          
          {/* Map and DroppableMap */}
          <div className="relative w-[80%] h-[70vh]" style={{ marginTop: "20px" }}>
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
            className="fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
            onClick={() => setShowFurnitureMenu(true)}
          >
            <img
              src="/shop.png"
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
        
        <CatModal 
          isOpen={showCatModal} 
          onOpenChange={setShowCatModal}
          initialMessage={catModalMessage}
          isCase5={true}
        />
      </div>
    </DndProvider>
  )
}
