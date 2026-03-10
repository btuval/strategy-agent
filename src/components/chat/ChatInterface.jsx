import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import SuggestedPrompts from './SuggestedPrompts';
import { completeWithGemini } from '../../api/llm'; // Ensure this path matches where you saved llm.js

export function ChatInterface() {
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      role: 'assistant', 
      content: "I am your Strategy Agent. I can model churn scenarios, analyze campaign performance, or simulate price increases. Where should we start?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (/** @type {string} */ text) => {
    // 1. Add User Message
    const userMsg = { id: `user-${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Get AI Response
      // We pass the entire history so the agent has context
      const responseText = await completeWithGemini([...messages, userMsg]);
      
      const aiMsg = { 
        id: `assistant-${Date.now()}`, 
        role: 'assistant', 
        content: (responseText != null && typeof responseText === 'string') ? responseText : "I'm having trouble connecting to the strategy database. Please try again." 
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm ml-4">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150" />
            Analyzing...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        {messages.length < 2 && (
          <div className="mb-4">
            <SuggestedPrompts onSelect={handleSend} />
          </div>
        )}
        <ChatInput onSend={handleSend} isLoading={isLoading} placeholder="Ask about pricing strategy, churn analysis..." />
      </div>
    </div>
  );
}