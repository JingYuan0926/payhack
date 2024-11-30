import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import CatModal from './CatModal';

const WalkingCat = ({ emotion: parentEmotion, message }) => {
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
  const [currentAction, setCurrentAction] = useState('walk');

  const SPRITE_WIDTH = 32;
  const SPRITE_HEIGHT = 32;
  const TOTAL_FRAMES = 8;
  const ANIMATION_SPEED = 100;
  const MOVEMENT_SPEED = 3;
  const DIRECTION_CHANGE_INTERVAL = 4000;
  const SPRITE_ROW = 4;
  const SCALE_FACTOR = 5;

  const ACTIONS = {
    walk: { frames: 8, row: 4 },
    action1: { frames: 8, row: 9},
    action2: { frames: 4, row: 2 },
    action3: { frames: 7, row: 8 },
    action4: { frames: 4, row: 6 },
  };

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

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        const maxFrames = ACTIONS[currentAction].frames;
        return (prevFrame + 1) % maxFrames;
      });
    }, ANIMATION_SPEED);

    return () => clearInterval(animationInterval);
  }, [currentAction]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
          const action = `action${e.key}`;
          setCurrentAction(action);
          break;
        case '0':
          setCurrentAction('walk');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (currentAction !== 'walk') return;

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
  }, [direction, windowSize, currentAction]);

  useEffect(() => {
    if (currentAction !== 'walk') return;

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
  }, [currentAction]);

  useEffect(() => {
    if (parentEmotion) {
      setEmotion(parentEmotion);
    }
  }, [parentEmotion]);

  const handleEmotionChange = (e) => {
    const input = e.target.value.toLowerCase();
    if (['happy', 'angry', 'love', 'sad', 'surprise', 'neutral'].includes(input)) {
      setEmotion(input);
    }
  };

  const handleContainerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const catCenterX = position.x + (SPRITE_WIDTH * SCALE_FACTOR) / 2;
    const catCenterY = position.y + (SPRITE_HEIGHT * SCALE_FACTOR) / 2;
    
    const CLICK_RADIUS = SPRITE_WIDTH * SCALE_FACTOR;
    
    const distance = Math.sqrt(
      Math.pow(clickX - catCenterX, 2) + 
      Math.pow(clickY - catCenterY, 2)
    );
    
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
    backgroundPosition: `-${currentFrame * SPRITE_WIDTH}px -${ACTIONS[currentAction].row * SPRITE_HEIGHT}px`,
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
      case 'neutral': return '😐';
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
      
      <CatModal isOpen={isOpen} onOpenChange={onOpenChange} initialMessage={message} />
    </>
  );
};

export default WalkingCat;