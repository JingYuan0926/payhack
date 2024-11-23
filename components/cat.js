import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import CatModal from './CatModal';

const WalkingCat = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });
  const [emotion, setEmotion] = useState('love');
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

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
      const container = document.querySelector('[class*="w-[80%]"]');
      if (container) {
        setWindowSize({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    handleResize();
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

  // Add input field and handler
  const handleEmotionChange = (e) => {
    const input = e.target.value.toLowerCase();
    if (['happy', 'angry', 'love', 'sad', 'surprise'].includes(input)) {
      setEmotion(input);
    }
  };

  // Add click handler with position check
  const handleContainerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Calculate cat's center position
    const catCenterX = position.x + (SPRITE_WIDTH * SCALE_FACTOR) / 2;
    const catCenterY = position.y + (SPRITE_HEIGHT * SCALE_FACTOR) / 2;
    
    // Define click detection radius (adjust this value to change the clickable area)
    const CLICK_RADIUS = SPRITE_WIDTH * SCALE_FACTOR;
    
    // Calculate distance between click and cat center
    const distance = Math.sqrt(
      Math.pow(clickX - catCenterX, 2) + 
      Math.pow(clickY - catCenterY, 2)
    );
    
    // Only open modal if click is within radius
    if (distance <= CLICK_RADIUS) {
      onOpen();
    }
  };

  const containerStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent'
  };

  const spriteStyles = {
    width: `${SPRITE_WIDTH}px`,
    height: `${SPRITE_HEIGHT}px`,
    backgroundImage: 'url("/cat-sprite.png")',
    imageRendering: 'pixelated',
    backgroundPosition: `-${currentFrame * SPRITE_WIDTH}px -${SPRITE_ROW * SPRITE_HEIGHT}px`,
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `scaleX(${facingLeft ? -1 : 1}) scale(${SCALE_FACTOR})`,
    transition: 'transform 0.1s ease-in-out',
    zIndex: 50,
    cursor: 'pointer'
  };

  const emotionBubbleStyles = {
    position: 'absolute',
    left: `${position.x + (SPRITE_WIDTH * SCALE_FACTOR) / 2}px`,
    top: `${position.y}px`,
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '8px',
    border: '2px solid #333',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '32px',
    minHeight: '32px',
    fontSize: '20px',
    cursor: 'pointer'
  };

  const getEmotionEmoji = () => {
    switch(emotion) {
      case 'happy': return '😊';
      case 'angry': return '😠';
      case 'love': return '❤️';
      case 'sad': return '😢';
      case 'surprise': return '❗';
      default: return '😊';
    }
  };

  return (
    <>
      <div style={containerStyles} onClick={handleContainerClick}>
        <div style={emotionBubbleStyles}>
          {getEmotionEmoji()}
        </div>
        <div style={spriteStyles} />
      </div>
      
      <CatModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default WalkingCat;