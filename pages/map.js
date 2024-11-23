import LevelBar from '../components/LevelBar'
import Coins from '../components/Coins'
import WalkingCat from '../components/cat'
import { useState, useEffect } from 'react'

// Add static props if you need to fetch data
export async function getStaticProps() {
  return {
    props: {
      initialBalance: 83300,
      initialProgress: 60,
      username: "Player1"
    },
    // Optionally add revalidation if you want to update the data periodically
  }
}

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

      <Coins balance={initialBalance} />
    </div>
  )
}
