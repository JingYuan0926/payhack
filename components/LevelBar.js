export default function LevelBar({ username = "Username", progress = 60 }) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="p-4 flex justify-between items-start">
      <div className="w-[30%] ml-8">
        <div className="text-lg font-bold mb-2">{username}</div>
        <div className="
          w-full h-6 
          border-4 border-black 
          [image-rendering:pixelated]
          bg-gray-200
        ">
          <div 
            className="h-full bg-green-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-lg font-bold font-mono mr-8 text-right">
        <div>{formattedDate}</div>
        <div>{formattedTime}</div>
      </div>
    </div>
  )
} 