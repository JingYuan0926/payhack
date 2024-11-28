import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expensesData, setExpensesData] = useState(null);

  // Fetch expenses data when component mounts
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/getExpenses');
        const data = await response.json();
        setExpensesData(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };
    fetchExpenses();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          expenses: expensesData // Send expenses data to API
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to sanitize markdown content
  const sanitizeMarkdown = (content) => {
    // Remove any potential markdown formatting that should be hidden
    return content.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button - Updated with cat sprite */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-lg border-2 border-gray-200"
      >
        <img
          src="/cat-sprite1.png"  // Changed from chatbot.png to cat-sprite1.png
          alt="Chat"
          className="w-10 h-10 object-contain"  // Adjusted size and added object-contain
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header - Updated with cat theme */}
          <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="/cat-sprite1.png"
                alt="Cat Assistant"
                className="w-6 h-6 mr-2 object-contain"
              />
              <h3 className="font-semibold">Cat Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {/* Updated Messages section with ReactMarkdown */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {sanitizeMarkdown(message.content)}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
