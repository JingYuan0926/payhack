import LevelBar from '../components/LevelBar'
import WalkingCat from '../components/cat'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useEffect } from 'react'
import { MenuPopup } from './furniture'
import DailyGoals from '../components/DailyGoals'
import { useRouter } from 'next/router'
import CatModal from '../components/CatModal'
import { getFurniture, saveFurniture, subscribeFurniture } from '../utils/furnitureStorage'
import LeaderboardModal from '../components/LeaderboardModal'




// New DraggableFurniture component
const DraggableFurniture = ({ item, onMove, onRemove }) => {
  const [dimensions, setDimensions] = useState({
    width: item.placedWidth || (item.originalWidth ? item.originalWidth * 2.5 : 100),
    height: item.placedHeight || (item.originalHeight ? item.originalHeight * 2.5 : 100)
  });
  
  const [progress, setProgress] = useState(item.progress || 0);
  const [opacity, setOpacity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!item.originalWidth || !item.originalHeight) {
      const img = new Image();
      img.src = item.src;
      img.onload = () => {
        setDimensions({
          width: img.width * 2.5,
          height: img.height * 2.5
        });
      };
    }
  }, [item]);

  // Add keyboard event listener for the '9' key
  useEffect(() => {
    if (!item.isCelebration) return;

    const handleKeyPress = async (event) => {
      if (event.key === '9' && !isAnimating) {
        setIsAnimating(true);
        
        const startTime = Date.now();
        const duration = 300;

        setProgress(10);
        setOpacity(0.9);

        const animate = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const newProgress = Math.min((elapsed / duration) * 100, 100);
          
          setProgress(newProgress);
          setOpacity(1 - (newProgress / 100));
          
          if (newProgress < 100) {
            requestAnimationFrame(animate);
          } else {
            setTimeout(() => {
              onRemove(item.id);
            }, 50);
          }
        };

        requestAnimationFrame(animate);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [item, onRemove, isAnimating]);

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
  }));

  return (
    <div
      style={{
        position: 'absolute',
        top: item.position.y,
        left: item.position.x,
      }}
    >
      <img
        ref={drag}
        src={item.src}
        alt={item.name}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          opacity: isDragging ? 0.5 : opacity,
          cursor: 'move',
          transition: 'opacity 0.001s linear',
        }}
      />
      {item.isCelebration && (
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: 0,
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.001s linear',
            }}
          />
        </div>
      )}
    </div>
  );
};

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
  const [showSpendingHistory, setShowSpendingHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const sendEmail = async () => {
    try {
      console.log('Sending email...');
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'derekliew0@gmail.com',
          subject: 'Meow! 🐱 Your Spending is Pawsitively Concerning!',
          text: 'Purr-lease be careful! You\'ve spent RM 842 today, which is 83% of your daily budget! Time to put those paws back in your pockets! 🐾💰\n\n',
          html: `
            <p>Purr-lease be careful! You've spent RM 842 today, which is 83% of your daily budget! Time to put those paws back in your pockets! 🐾💰</p>
            <img src="cid:cryCat" alt="Crying Cat" style="width: 200px;">
          `,
          attachments: [{
            filename: 'cryCat.gif',
            path: 'cryCat.gif',
            cid: 'cryCat'
          }]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSent(true);
      setCatEmotion('happy');
      setCatMessage("Purrfect! Email sent successfully! 📧");
    } catch (error) {
      console.error('Detailed error sending email:', error);
      setCatEmotion('sad');
      setCatMessage(`Meowch! Failed to send email: ${error.message} 😿`);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      const financialPlanPopup = document.querySelector('[role="dialog"]');
      if (financialPlanPopup) {
        return;
      }

      switch (event.key) {
        case '+':
          sendEmail();
          break;
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

  // Load furniture data
  useEffect(() => {
    setIsLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeFurniture((furnitureData) => {
      setPlacedFurniture(furnitureData)
      setIsLoading(false)
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleAddFurniture = async (newItem) => {
    // Format current time in 12-hour format with AM/PM
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).replace(/\s/g, ''); // Remove spaces between time and AM/PM

    const updatedFurniture = [
      ...placedFurniture,
      {
        ...newItem,
        position: { x: 100, y: 100 },
        id: `${newItem.id}-${timeString}`, // Use formatted time in ID
      },
    ];

    await saveFurniture(updatedFurniture);
    setPlacedFurniture(updatedFurniture);
  };

  const handleMoveFurniture = async (id, newPosition) => {
    const updatedFurniture = placedFurniture.map((item) =>
      item.id === id ? { ...item, position: newPosition } : item
    );

    await saveFurniture(updatedFurniture);
    setPlacedFurniture(updatedFurniture);
  };

  const handleRemoveFurniture = async (id) => {
    const updatedFurniture = placedFurniture.filter((item) => item.id !== id);
    await saveFurniture(updatedFurniture);
    setPlacedFurniture(updatedFurniture);
  };

  const handleFeedCat = (value = 5) => {
    setProgress(prev => {
      const newProgress = prev + value
      return Math.min(Math.max(newProgress, 0), 100)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col">
        <div className="px-4 pt-2">
          <LevelBar 
            username="Tom The Cat" 
            progress={progress} 
            dangerProgress={loveLevel} 
            onFeedCat={handleFeedCat} 
          />
        </div>

        <div className="flex-1 flex items-center justify-center relative mt-4">
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
            
            {/* Add a small trophy icon that opens the leaderboard */}
            <div 
              className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              <img
                src="/leaderboard.png"
                alt="Leaderboard"
                className="w-8 h-8"
              />
            </div>

            {/* Leaderboard Modal */}
            <LeaderboardModal 
              isOpen={showLeaderboard}
              onClose={() => setShowLeaderboard(false)}
            />
          </DroppableMap>

          {/* Inventory Button (previously Shop) */}
          <button
            className="fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
            onClick={() => setShowFurnitureMenu(true)}
          >
            <img
              src="/shop.png"
              alt="Inventory"
              className="w-10 h-10 mr-2"
            />
            Inventory
          </button>

          {showFurnitureMenu && (
            <MenuPopup
              onClose={() => setShowFurnitureMenu(false)}
              onSelect={handleAddFurniture}
            />
          )}
        </div>

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