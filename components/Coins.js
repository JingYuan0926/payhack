export default function Coins({ balance = 1500 }) {
  return (
    <div className="
      fixed bottom-8 right-8 
      flex items-center gap-2 
      bg-black/10 backdrop-blur-sm 
      px-4 py-2 rounded-full
    ">
      <img 
        src="/coin.png" 
        alt="Coin" 
        className="w-8 h-8 object-contain"
      />
      <span className="font-mono text-xl font-bold">
        {balance.toLocaleString()}
      </span>
    </div>
  )
} 