import LevelBar from '../components/LevelBar'
import Coins from '../components/Coins'
import WalkingCat from '../components/cat'

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
          <WalkingCat />
        </div>
      </div>

      <Coins balance={initialBalance} />
    </div>
  )
}
