import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { useState } from "react";
import { Input } from "@nextui-org/react";

const CatModal = ({ isOpen, onOpenChange }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setChatHistory([...chatHistory, userMessage, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory([
        ...chatHistory, 
        userMessage,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center gap-1">
              <p>Hey there! 👋</p>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 h-[300px] overflow-y-auto">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`p-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                  } max-w-[80%]`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  color="primary"
                  isLoading={isLoading}
                  onPress={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                className="w-full"
                color="primary"
                onPress={onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CatModal; 