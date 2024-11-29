import React, { useState } from 'react';


const Rewards = ({ onClose, onFeedCat, rewardsContent = {
  food: [{ name: "Premium Cat Food", quantity: 1 }],

  vouchers: [{ name: "TNG Cashback RM3 Voucher", code: "TNGRM3-123456", id: 1 }]
}, setRewardsContent }) => {
  const [showVoucher, setShowVoucher] = useState(false);
  const [showFood, setShowFood] = useState(false);
  const [showCatVideo, setShowCatVideo] = useState(false);
  const [videoFading, setVideoFading] = useState(false);
  const [showRedeemMessage, setShowRedeemMessage] = useState(false);
  const [showSelfFeedVideo, setShowSelfFeedVideo] = useState(false);
  const [selfFeedFading, setSelfFeedFading] = useState(false);

  const foodItems = rewardsContent?.food || [];
  const hasFood = foodItems.length > 0 && foodItems[0].quantity > 0;

  const handleFeedCat = () => {
    // Update food quantity - only consume one food item
    setRewardsContent(prev => ({
      ...prev,
      food: prev.food.map((item, index) => {
        // Find the first food item with quantity > 0
        if (item.quantity > 0 && prev.food.slice(0, index).every(f => f.quantity === 0)) {
          return {
            ...item,
            quantity: item.quantity - 1
          };
        }
        return item;
      })
    }));

    // Call the onFeedCat prop to update the progress bar
    if (onFeedCat) {
      console.log('Calling onFeedCat');
      onFeedCat();
    }

    // Show cat video
    setShowCatVideo(true);
    setTimeout(() => {
      setVideoFading(true);
    }, 50);
    
    setTimeout(() => {
      setVideoFading(false);
      setTimeout(() => {
        setShowCatVideo(false);
      }, 1000);
    }, 3000);
  };

  const handleFeedSelf = () => {
    // Helper function to generate random voucher
    const generateRandomVoucher = () => {
      const voucherTypes = [
        { amount: 2, name: "TNG Cashback RM2 Voucher" },
        { amount: 3, name: "TNG Cashback RM3 Voucher" },
        { amount: 5, name: "TNG Cashback RM5 Voucher" }
      ];
      
      const randomType = voucherTypes[Math.floor(Math.random() * voucherTypes.length)];
      return {
        name: randomType.name,
        code: `TNGRM${randomType.amount}-${Math.random().toString(36).substr(2, 6)}`,
        id: Date.now()
      };
    };

    // Update food quantity - only consume one food item
    setRewardsContent(prev => ({
      ...prev,
      food: prev.food.map((item, index) => {
        // Find the first food item with quantity > 0
        if (item.quantity > 0 && prev.food.slice(0, index).every(f => f.quantity === 0)) {
          return {
            ...item,
            quantity: item.quantity - 1
          };
        }
        return item;
      }),
      vouchers: [
        ...prev.vouchers,
        generateRandomVoucher()  // Add random voucher
      ]
    }));

    // Show message and video
    setShowSelfFeedVideo(true);
    setTimeout(() => {
      setSelfFeedFading(true);
    }, 50);
    
    setTimeout(() => {
      setSelfFeedFading(false);
      setTimeout(() => {
        setShowSelfFeedVideo(false);
      }, 1000);
    }, 3000);

    // Call onFeedCat with negative value to decrease progress
    if (onFeedCat) {
      console.log('Decreasing progress');
      onFeedCat(-5);
    }
  };

  const handleRedeemVoucher = (voucherId) => {
    // Check if setRewardsContent exists before using it
    if (setRewardsContent) {
      setRewardsContent(prev => ({
        ...prev,
        vouchers: prev.vouchers.filter(voucher => voucher.id !== voucherId)
      }));

      // Show redemption message
      setShowRedeemMessage(true);
      setTimeout(() => {
        setShowRedeemMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="rewards" style={{
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "10px",
      width: "370px",
    }}>
      <h3 className="font-bold mb-4">My Rewards</h3>
      
      {/* Food Section */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700">Cat Food</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="my-2">
              {foodItems.some(item => item.quantity > 0) ? (
                <div className="flex flex-col gap-2">
                  {foodItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <p>{item.name} x{item.quantity}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  Oops, no food here!
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={handleFeedCat}
                className="px-3 py-1 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors w-full"
                disabled={!foodItems.some(item => item.quantity > 0)}
              >
                Feed My Cat
              </button>
              <button
                onClick={handleFeedSelf}
                className="px-2 py-1 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors w-full"
                disabled={!foodItems.some(item => item.quantity > 0)}
              >
                Feed voucher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers Section */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700">Vouchers</h4>
        {(rewardsContent?.vouchers || []).map((voucher) => (
          <div key={voucher.id} className="my-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  {voucher.name.includes("RM5") ? "TNG RM5 Cashback Voucher" : "TNG RM3 Cashback Voucher"}
                </p>
                <p className="text-xs text-gray-500">Valid until 7 Dec 2024</p>
              </div>
              <button
                onClick={() => handleRedeemVoucher(voucher.id)}
                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        style={{
          padding: "8px 16px",
          backgroundColor: "#ff5733",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Close
      </button>

      {/* Cat Video Popup */}
      {showCatVideo && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
            opacity: videoFading ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        >
          <div
            className="video-container"
            style={{
              position: "relative",
              width: "400px",
              borderRadius: "10px",
              opacity: videoFading ? 1 : 0,
              transform: `scale(${videoFading ? 1 : 0.95})`,
              transition: "all 1s ease-in-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-40px",
                left: "0",
                width: "100%",
                textAlign: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                opacity: videoFading ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
            >
              10hp is added, your cat is happy!
            </div>
            <video
              autoPlay
              style={{
                width: "100%",
                borderRadius: "8px",
                display: "block",
              }}
              onEnded={() => {
                setVideoFading(false);
                setTimeout(() => {
                  setShowCatVideo(false);
                }, 1000);
              }}
            >
              <source src="/catNom.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Self Feed Message and Video Popup */}
      {showSelfFeedVideo && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
            opacity: selfFeedFading ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        >
          <div
            className="video-container"
            style={{
              position: "relative",
              width: "400px",
              borderRadius: "10px",
              opacity: selfFeedFading ? 1 : 0,
              transform: `scale(${selfFeedFading ? 1 : 0.95})`,
              transition: "all 1s ease-in-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-80px",
                left: "0",
                width: "100%",
                textAlign: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                opacity: selfFeedFading ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
            >
              <div>You received new cash vouchers!</div>
              <div style={{ color: '#ff4444', marginTop: '10px' }}>
                But your cat is really hungry, too! -10 hp
              </div>
            </div>
            <img
              src="/cryCat.gif"
              alt="Crying Cat"
              style={{
                width: "100%",
                borderRadius: "8px",
                display: "block",
              }}
              onLoad={() => {
                // Simulate video duration for GIF
                setTimeout(() => {
                  setSelfFeedFading(false);
                  setTimeout(() => {
                    setShowSelfFeedVideo(false);
                  }, 1000);
                }, 3000);
              }}
            />
          </div>
        </div>
      )}

      {/* Redemption Message Popup */}
      {showRedeemMessage && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
        >
          <div
            className="message-container"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              animation: "fadeInOut 3s forwards"
            }}
          >
            <p className="text-lg font-bold mb-4">You redeemed one voucher!</p>
            <button
              onClick={() => setShowRedeemMessage(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;