import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getFurniture, saveFurniture } from '../utils/furnitureStorage';

// DraggableFurniture Component
const DraggableFurniture = ({ furniture, position, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'furniture',
    item: { id: furniture.id, position },
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        onRemove(furniture.id); // Remove if dropped outside
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
        width: '100px',
        height: '100px',
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
    const [furnitureData, setFurnitureData] = useState([]);
  
    useEffect(() => {
      setFurnitureData([
        { id: 1, name: 'Double Sofa', src: '/furniture/doubleSofa.png', price: '$200' },
        { id: 2, name: 'Left Sofa', src: '/furniture/leftSofa.png', price: '$150' },
        { id: 3, name: 'Right Sofa', src: '/furniture/rightSofa.png', price: '$150' },
        { id: 4, name: 'Table', src: '/furniture/table.png', price: '$100' },
        { id: 5, name: 'Bookshelf', src: '/furniture/bookShelf.png', price: '$120' },
        { id: 6, name: 'Double Bed', src: '/furniture/doubleBed.png', price: '$300' },
        { id: 7, name: 'Single Bed', src: '/furniture/singleBed.png', price: '$250' }
      ]);
    }, []);
  
    return (
      <div
        style={{
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
          overflowY: 'scroll', // Scrollable for large data
        }}
      >
        <h2>Select Furniture</h2>
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
              flexDirection: 'column', // Stack name and price vertically
              textAlign: 'center'
            }}
            onClick={() => {
              onSelect({ ...furniture, position: { x: 0, y: 0 } }); // Default position
              onClose();
            }}
          >
            <img
              src={furniture.src}
              alt={furniture.name}
              style={{ width: '50px', height: '50px' }}
            />
            <span>{furniture.name}</span>
            <span style={{ fontSize: '12px', color: '#555' }}>{furniture.price}</span> {/* Price */}
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
  const [furniture, setFurniture] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial furniture data from Firebase
  useEffect(() => {
    const loadFurniture = async () => {
      setIsLoading(true);
      try {
        const data = await getFurniture();
        setFurniture(data);
      } catch (error) {
        console.error('Error loading furniture:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFurniture();
  }, []);

  const handleDrop = async (id, position) => {
    const updated = furniture.map((item) => 
      item.id === id ? { ...item, position } : item
    );
    await saveFurniture(updated);
    setFurniture(updated);
  };

  const handleAddFurniture = async (newItem) => {
    const updated = [
      ...furniture, 
      { ...newItem, position: { x: 0, y: 0 }, id: `${newItem.id}-${Date.now()}` }
    ];
    await saveFurniture(updated);
    setFurniture(updated);
  };

  const handleRemove = async (id) => {
    const updated = furniture.filter((item) => item.id !== id);
    await saveFurniture(updated);
    setFurniture(updated);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1>Furniture Placement Map</h1>
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
