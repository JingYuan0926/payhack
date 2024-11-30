import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { Input } from "@nextui-org/react";

const CatModal = ({ isOpen, onOpenChange, initialMessage, isCase5 }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialMessage) {
      setChatHistory([{ role: 'assistant', content: initialMessage }]);
    }
  }, [initialMessage]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    
    try {
      const apiEndpoint = isCase5 ? '/api/case5' : '/api/chat';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('JSON Parse Error:', e);
        setChatHistory([
          ...chatHistory,
          userMessage,
          { role: 'assistant', content: isCase5 
            ? "Purr... I'm having trouble understanding the response. Please try again! 😺"
            : "I'm having trouble processing the response. Please try again."
          }
        ]);
        return;
      }
      
      setChatHistory([...chatHistory, userMessage, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory([
        ...chatHistory, 
        userMessage,
        { role: 'assistant', content: isCase5 
          ? "Meow... I'm having some technical difficulties. Please try again in a moment! 😺"
          : "I'm experiencing technical difficulties. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 999999999999 
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 flex flex-col"
        style={{ zIndex: 999999999999, height: '500px' }}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Hey there! 👋</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg mb-2 ${
                msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              } max-w-[80%]`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4">
          <div className="bg-gray-100 rounded-full p-2 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent outline-none px-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-4">
          <button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatModal; 