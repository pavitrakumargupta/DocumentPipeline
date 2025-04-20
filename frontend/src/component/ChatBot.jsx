import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GeminiChatbot = ({ initialtext }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Send initialtext only once when component mounts
  useEffect(() => {
    if (initialtext?.trim() && messages.length === 0) {
      sendMessage(initialtext);
    }
  }, [initialtext]);

  const sendMessage = async (myInput = input) => {
    if (!myInput?.trim()) return;

    setInput('');
    setLoading(true);
    setError('');

    try {
      const newMessages = [...messages, { role: 'user', content: myInput }];
      setMessages(newMessages);

      const messageTexts = newMessages.map((msg) => msg.content);

      const baseUrl =  'http://localhost:5000';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageTexts }),
      });

      const data = await response.json();
      const reply = data.reply || 'No reply received.';

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong while chatting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: 'left' }}>
      <h2>🤖 Gemini Chatbot</h2>

      <div
        id="chat-box"
        ref={chatBoxRef}
        style={{ border: '1px solid #ccc', padding: 10, height: 300, overflowY: 'auto', marginBottom: 10 }}
      >
        {messages.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong>{' '}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </p>
        ))}
        {loading && <p><em>Bot is typing...</em></p>}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: '80%', marginRight: 10 }}
      />
      <button onClick={() => sendMessage()}>Send</button>
    </div>
  );
};

export default GeminiChatbot;
