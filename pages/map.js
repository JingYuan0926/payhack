import LevelBar from '../components/LevelBar'
import Coins from '../components/Coins'
import WalkingCat from '../components/cat'

export default function Map() {
  return (
    <div className="min-h-screen flex flex-col">
      <LevelBar username="Player1" progress={60} />
      
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

      <Coins balance={83300} />
    </div>
  )
}
