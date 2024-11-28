export default function Coins({ balance = 1500 }) {
  return (
    <div className="
      fixed bottom-8 right-8 
      flex items-center gap-2 
      bg-black/10 backdrop-blur-sm 
      px-4 py-2 rounded-full
    ">
      <img 
        src="/coins.png" 
        alt="Coin" 
        className="w-8 h-8 object-contain"
      />
      <span className="pixel-text-yellow text-4xl">
        {balance.toLocaleString()}
      </span>
    </div>
  )
} 