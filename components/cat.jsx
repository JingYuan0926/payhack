import React, { useState, useEffect } from 'react';

const WalkingCat = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth * 0.75,
    height: window.innerHeight * 0.75
  });

  const SPRITE_WIDTH = 32;
  const SPRITE_HEIGHT = 32;
  const TOTAL_FRAMES = 8;
  const ANIMATION_SPEED = 100;
  const MOVEMENT_SPEED = 3;
  const DIRECTION_CHANGE_INTERVAL = 4000;
  const SPRITE_ROW = 5;
  const SCALE_FACTOR = 5;

  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        
        const maxX = windowSize.width - SPRITE_WIDTH * SCALE_FACTOR;
        const maxY = windowSize.height - SPRITE_HEIGHT * SCALE_FACTOR;
        
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
    }, 16);

    return () => clearInterval(moveInterval);
  }, [direction, windowSize]);

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

  const containerStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75%',
    height: '75%',
    border: '2px solid #eee',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  };

  const spriteStyles = {
    width: `${SPRITE_WIDTH}px`,
    height: `${SPRITE_HEIGHT}px`,
    backgroundImage: 'url("/cat-sprite.png")',
    imageRendering: 'pixelated',
    backgroundPosition: `-${currentFrame * SPRITE_WIDTH}px -${SPRITE_ROW * SPRITE_HEIGHT}px`,
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `scaleX(${facingLeft ? -1 : 1}) scale(${SCALE_FACTOR})`,
    transition: 'transform 0.1s ease-in-out',
    zIndex: 50
  };

  return (
    <>
      <div style={containerStyles}>
        <div style={spriteStyles} />
      </div>
      <div className="fixed bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-sm text-gray-600 z-50">
      </div>
    </>
  );
};

export default WalkingCat;