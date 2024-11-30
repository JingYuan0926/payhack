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
  const inventory = loadFromInventory();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-[500px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-bold pixel-text-blue">Inventory</h2>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="bg-blue-50 p-3 rounded-lg flex items-center justify-between hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h3 className="text-xl font-bold text-blue-600">{item.name}</h3>
                  <p className="text-gray-600">{item.price}</p>
                </div>
              </div>
              <button
                onClick={() => onSelect(item)}
                className="text-blue-500 hover:text-blue-600 font-bold"
              >
                Place
              </button>
            </div>
          ))}
        </div>

        {/* Footer with Cancel Button */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
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

// Single export statement at the end
export { FurnitureMap as default, MenuPopup };
