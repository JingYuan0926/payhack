import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SpinWheel from '../components/SpinWheel';

// Add these scale factors at the top of the file
export const PREVIEW_SCALE = 1.5; // Scale for furniture in the menu
export const PLACED_SCALE = 2.5;  // Scale for furniture on the map

// Add this helper function at the top of the file
const STORAGE_KEY = 'placedFurniture';
const STORAGE_KEY_INVENTORY = 'furnitureInventory';

const saveToStorage = (furniture) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(furniture));
};

const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveToInventory = (furniture) => {
  localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(furniture));
};

const loadFromInventory = () => {
  const saved = localStorage.getItem(STORAGE_KEY_INVENTORY);
  return saved ? JSON.parse(saved) : [];
};

// DraggableFurniture Component
const DraggableFurniture = ({ furniture, position, onRemove }) => {
  const [dimensions, setDimensions] = useState({
    // Use placedWidth/Height if available, otherwise calculate using PLACED_SCALE
    width: furniture.placedWidth || (furniture.originalWidth ? furniture.originalWidth * PLACED_SCALE : 0),
    height: furniture.placedHeight || (furniture.originalHeight ? furniture.originalHeight * PLACED_SCALE : 0)
  });
  
  useEffect(() => {
    // Only calculate dimensions if we don't have originalWidth/Height
    if (!furniture.originalWidth || !furniture.originalHeight) {
      const img = new Image();
      img.src = furniture.src;
      img.onload = () => {
        setDimensions({
          width: img.width * PLACED_SCALE,
          height: img.height * PLACED_SCALE
        });
      };
    }
  }, [furniture]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'furniture',
    item: { id: furniture.id, position },
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        onRemove(furniture.id);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={furniture.src}
      alt={furniture.name}
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        width: dimensions.width || 0,
        height: dimensions.height || 0,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    />
  );
};

// Map Component
const Map = ({ furniture, onDrop, onRemove }) => {
  const [, drop] = useDrop(() => ({
    accept: 'furniture',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const mapRect = document.getElementById('map').getBoundingClientRect();
        if (
          offset.x >= mapRect.left &&
          offset.x <= mapRect.right &&
          offset.y >= mapRect.top &&
          offset.y <= mapRect.bottom
        ) {
          const x = offset.x - mapRect.left;
          const y = offset.y - mapRect.top;
          onDrop(item.id, { x, y });
        }
      }
    },
  }));

  return (
    <div
      id="map"
      ref={drop}
      style={{
        width: '500px',
        height: '500px',
        border: '2px dashed #00aaff',
        position: 'relative',
        margin: '20px auto',
      }}
    >
      {furniture.map((item) => (
        <DraggableFurniture
          key={item.id}
          furniture={item}
          position={item.position}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Popup Menu Component
const MenuPopup = ({ onClose, onSelect }) => {
    const [furnitureData, setFurnitureData] = useState(() => loadFromInventory());
    const [dimensions, setDimensions] = useState({});
    
    // Add this useEffect to reload inventory when MenuPopup is opened
    useEffect(() => {
      setFurnitureData(loadFromInventory());
    }, []);
  
    // Load dimensions for all furniture items
    useEffect(() => {
      furnitureData.forEach(furniture => {
        const img = new Image();
        img.src = furniture.src;
        img.onload = () => {
          setDimensions(prev => ({
            ...prev,
            [furniture.id]: {
              width: img.width * PREVIEW_SCALE,
              height: img.height * PREVIEW_SCALE
            }
          }));
        };
      });
    }, [furnitureData]);
  
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        padding: '20px',
        background: '#fff',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        zIndex: 1000,
        maxHeight: '400px',
        overflowY: 'scroll',
      }}>
        <h2 className="text-xl font-bold">Select Furniture</h2>
        <h2>----------------</h2>
        {furnitureData.map((furniture) => (
          <div
            key={furniture.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '10px',
              flexDirection: 'column',
              textAlign: 'center'
            }}
            onClick={() => {
              onSelect({ ...furniture, position: { x: 0, y: 0 } });
              onClose();
            }}
          >
            <img
              src={furniture.src}
              alt={furniture.name}
              style={{
                width: furniture.previewWidth || dimensions[furniture.id]?.width || 50,
                height: furniture.previewHeight || dimensions[furniture.id]?.height || 50
              }}
            />
            <span style={{ fontSize: '20px'}}>{furniture.name}</span>
            <span style={{ fontSize: '20px', color: '#555' }}>{furniture.price}</span>
          </div>
        ))}
        <button
          onClick={onClose}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            background: '#00aaff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    );
  };
  
// Main Component
const FurnitureMap = () => {
  const [furniture, setFurniture] = useState(() => loadFromStorage());
  const [showMenu, setShowMenu] = useState(false);
  const [menuKey, setMenuKey] = useState(0);

  const handleDrop = (id, position) => {
    setFurniture((prev) => {
      const updated = prev.map((item) => 
        item.id === id ? { ...item, position } : item
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const handleAddFurniture = (newItem) => {
    setFurniture((prev) => {
      const updated = [...prev, { ...newItem, position: { x: 0, y: 0 } }];
      saveToStorage(updated);
      return updated;
    });
  };

  const handleRemove = (id) => {
    setFurniture((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const handleRewardClaimed = (reward) => {
    const inventory = loadFromInventory();
    const updatedInventory = [...inventory, {
      id: `${reward.id}-${Date.now()}`, // Add timestamp to make ID unique
      name: reward.name,
      src: reward.src,
      price: reward.rarity.toUpperCase() // Optional: you can add price based on rarity
    }];
    saveToInventory(updatedInventory);
    setMenuKey(prev => prev + 1);
    setShowMenu(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1>Furniture Placement Map</h1>
        <SpinWheel onRewardClaimed={handleRewardClaimed} />
        <button
          onClick={() => setShowMenu(true)}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            background: '#00aaff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Open Furniture Menu
        </button>
        {showMenu && (
          <MenuPopup
            onClose={() => setShowMenu(false)}
            onSelect={handleAddFurniture}
          />
        )}
        <Map
          furniture={furniture}
          onDrop={handleDrop}
          onRemove={handleRemove}
        />
      </div>
    </DndProvider>
  );
};

export default FurnitureMap;

// Export MenuPopup component
export { MenuPopup };