import { useState } from "react";
import Rewards from './Rewards';

const WeeklyChallengeBar = ({ onChallengeComplete, onFeedCat }) => {
  const currentDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  // Define generateRandomVoucher function at the top of the component
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

  const [showAllChallenges, setShowAllChallenges] = useState(false); // Track visibility of all challenges
  const [showRewardsModal, setShowRewardsModal] = useState(false); // Track the modal visibility
  const [challenges, setChallenges] = useState([
    { id: 1, text: "Eat RM20 today!", completed: false, date: "2024-11-25" },
    { id: 2, text: " Cook at home", completed: false, date: "2024-11-26" },
    { id: 3, text: " Skip unnecessary spending", completed: false, date: "2024-11-27" },
    { id: 4, text: " No fast food", completed: false, date: "2024-11-28" },
    { id: 5, text: " Use public transport", completed: false, date: "2024-11-29" },
    { id: 6, text: " Spend under RM10 on lunch", completed: false, date: "2024-11-30" },
    { id: 7, text: " No online shopping", completed: false, date: "2024-12-01" },
    { id: 8, text: " Save RM50 for the week", completed: false, date: "2024-12-02" },
  ]);

  const [showRewardPopup, setShowRewardPopup] = useState(false);

  const [rewards, setRewards] = useState({
    food: [
      { name: "Premium Cat Food", quantity: 1 }
    ],
    vouchers: [
      { name: "TNG Cashback RM3 Voucher", code: "TNGRM3-123456", id: 1 }
    ]
  });

  const [showCatVideo, setShowCatVideo] = useState(false);
  const [videoFading, setVideoFading] = useState(false);

  const [progress, setProgress] = useState(0);

  const handleCheckboxChange = (id) => {
    setChallenges((prevChallenges) =>
      prevChallenges.map((challenge) => {
        if (challenge.id === id) {
          const willBeCompleted = !challenge.completed;
          const newLoveLevel = onChallengeComplete(willBeCompleted);
          
          if (newLoveLevel >= 95) {
            setShowRewardPopup(true);
            setRewards(prev => ({
              food: [
                { name: "Premium Cat Food", quantity: prev.food[0].quantity + 1 }
              ],
              vouchers: [
                ...prev.vouchers,
                generateRandomVoucher()
              ]
            }));
          }
          
          return { ...challenge, completed: willBeCompleted };
        }
        return challenge;
      })
    );
  };

  const handleRewardsClick = () => {
    setShowRewardsModal(true);
  };

  const handleCloseRewardsModal = () => {
    setShowRewardsModal(false);
  };

  const handleCloseRewardPopup = () => {
    setShowRewardPopup(false);
  };

  const handleFeedCat = () => {
    setRewards(prev => ({
      ...prev,
      food: prev.food.map(item => ({
        ...item,
        quantity: 0
      }))
    }));

    onFeedCat && onFeedCat();

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

  const handleProgressUpdate = (value) => {
    setProgress(prev => {
      const newProgress = prev + value;
      
      if (newProgress >= 100) {
        setRewards(prevRewards => ({
          food: [
            { name: "Premium Cat Food", quantity: prevRewards.food[0].quantity + 1 }
          ],
          vouchers: [
            ...prevRewards.vouchers,
            { 
              name: "TNG Cashback RM5 Voucher",
              code: `TNGRM5-${Math.random().toString(36).substr(2, 6)}`,
              id: Date.now()
            }
          ]
        }));

        return 0;
      }

      return Math.min(newProgress, 100);
    });
  };

  return (
    <div
      className="weekly-challenge-bar flex items-start gap-4"
      style={{
        position: "relative",
        width: "100%",
        padding: "10px",
        justifyContent: "flex-start",
      }}
    >
      {/* Left Column */}
      <div
        style={{
          width: "220px",
          position: "relative",
          flexShrink: 0,
          marginTop: "40px"
          
        }}
      >
        <h2
          className="text-xl font-bold mb-2 text-blue-600 cursor-pointer"
          style={{
            paddingTop: "15px",
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f0f0f0",
            color: "#000000",
          }}
          onClick={() => setShowAllChallenges(!showAllChallenges)}
        >
          Today&apos;s Challenge:
        </h2>
      </div>

      {/* Right Column */}
      <div
        style={{
          width: "400px",
          position: "relative",
          marginTop: "40px"
        }}
      >
        <div className="flex items-start gap-2">
          {/* Today's Challenge */}
          <div
            className="today-challenge-item flex items-center p-4 rounded-lg bg-green-200"
            style={{
              borderRadius: "12px",
              width: "350px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* Text */}
            <span className="text-sm flex-grow pr-4">
              {challenges.find((ch) => ch.date === currentDate)?.text || ""}
            </span>

            {/* Checkbox */}
            <div className="flex items-center" style={{ minWidth: "40px" }}>
              <input
                type="checkbox"
                checked={challenges.find((ch) => ch.date === currentDate)?.completed}
                onChange={() =>
                  handleCheckboxChange(
                    challenges.find((ch) => ch.date === currentDate)?.id
                  )
                }
                className="scale-125"
                style={{
                  width: "20px",
                  height: "25px",
                  borderRadius: "50%",
                  border: "2px solid #ccc",
                  marginLeft: "auto"
                }}
              />
            </div>
          </div>

          {/* Rewards Button - Adjusted alignment */}
          <button
            onClick={handleRewardsClick}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ffcc00",
              borderRadius: "8px",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              height: "56px",
              alignSelf: "stretch"
            }}
          >
            Rewards
          </button>
        </div>

        {/* All Challenges */}
        {showAllChallenges && (
          <div
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              width: "300px",
              marginTop: "10px"
            }}
          >
            <h3 className="font-bold text-lg mb-3">All Challenges:</h3>
            <ul className="space-y-2">
              {challenges.map((challenge) => (
                <li
                  key={challenge.id}
                  className={`flex items-center p-3 rounded-lg ${
                    challenge.completed ? "bg-green-200" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={challenge.completed}
                      onChange={() => handleCheckboxChange(challenge.id)}
                      className="w-5 h-5 mr-3"
                      style={{
                        borderRadius: "50%",
                      }}
                    />
                    <span className="text-base font-medium">
                      {challenge.text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Show the Rewards component as a modal */}
      {showRewardsModal && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Rewards 
            onClose={() => setShowRewardsModal(false)}
            onFeedCat={onFeedCat}
            rewardsContent={rewards}
            setRewardsContent={setRewards}
          />
        </div>
      )}

      {/* Modified Reward Popup with close button */}
      {showRewardPopup && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            zIndex: 9999,
            textAlign: "center"
          }}
        >
          <h3 className="font-bold mb-2">Congratulations! 🎉</h3>
          <p>You got meow food and TNG cashback vouchers!</p>
          <button
            onClick={handleCloseRewardPopup}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      )}

      {/* Modified Cat Video Popup without dark borders */}
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
    </div>
  );
};

export default WeeklyChallengeBar;