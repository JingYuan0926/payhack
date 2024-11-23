import React, { useState, useEffect } from 'react';

const WalkingCat = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [facingLeft, setFacingLeft] = useState(false);

  const SPRITE_WIDTH = 32;
  const SPRITE_HEIGHT = 32;
  const TOTAL_FRAMES = 8;
  const ANIMATION_SPEED = 100;
  const MOVEMENT_SPEED = 3;
  const DIRECTION_CHANGE_INTERVAL = 4000;
  const SPRITE_ROW = 5;

  // Animation frame update
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % TOTAL_FRAMES);
    }, ANIMATION_SPEED);

    return () => clearInterval(animationInterval);
  }, []);

  // Movement update
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition((prev) => {
        const newX = prev.x + (direction.x * MOVEMENT_SPEED);
        const newY = prev.y + (direction.y * MOVEMENT_SPEED);
        
        // Get container boundaries (accounting for sprite size)
        const container = document.getElementById('cat-container');
        if (!container) return prev;
        
        const maxX = container.clientWidth - SPRITE_WIDTH * 1.5;  // Accounting for scale
        const maxY = container.clientHeight - SPRITE_HEIGHT * 1.5;
        
        // Bounce off walls
        let newDirX = direction.x;
        let newDirY = direction.y;
        
        if (newX <= 0 || newX >= maxX) {
          newDirX = -direction.x;
          setDirection(prev => ({ ...prev, x: newDirX }));
          setFacingLeft(newDirX < 0);
        }
        if (newY <= 0 || newY >= maxY) {
          newDirY = -direction.y;
          setDirection(prev => ({ ...prev, y: newDirY }));
        }
        
        return {
          x: Math.max(0, Math.min(maxX, newX)),
          y: Math.max(0, Math.min(maxY, newY))
        };
      });
    }, 16); // 60fps

    return () => clearInterval(moveInterval);
  }, [direction]);

  // Random direction change
  useEffect(() => {
    const directionInterval = setInterval(() => {
      setDirection(prev => {
        const newDir = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        };
        setFacingLeft(newDir.x < 0);
        return newDir;
      });
    }, DIRECTION_CHANGE_INTERVAL);

    return () => clearInterval(directionInterval);
  }, []);

  const spriteStyles = {
    width: `${SPRITE_WIDTH}px`,
    height: `${SPRITE_HEIGHT}px`,
    backgroundImage: 'url("/cat-sprite.png")',
    imageRendering: 'pixelated',
    backgroundPosition: `-${currentFrame * SPRITE_WIDTH}px -${SPRITE_ROW * SPRITE_HEIGHT}px`, // Updated to use SPRITE_ROW
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `scaleX(${facingLeft ? -1 : 1}) scale(3)`,
    transition: 'transform 0.1s ease-in-out'
  };

  return (
    <div id="cat-container" className="relative w-full h-96 bg-slate-100 overflow-hidden rounded-lg shadow-lg">
      <div style={spriteStyles} />
      <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-sm text-gray-600">
        Position: ({Math.round(position.x)}, {Math.round(position.y)})
      </div>
    </div>
  );
};

export default WalkingCat;