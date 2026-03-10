import React, { createContext, useContext, useState, useEffect } from 'react';
import { agentClient } from '@/api/agentClient';

const ChatContext = createContext(undefined);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInputValue, setChatInputValue] = useState("");
  const [canvasTitle, setCanvasTitle] = useState(null);
  const [expandedTurnIndex, setExpandedTurnIndex] = useState(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedConvoId = sessionStorage.getItem('activeConversationId');
    const savedMessages = sessionStorage.getItem('chatMessages');
    const savedCanvasTitle = sessionStorage.getItem('canvasTitle');

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved messages');
      }
    }
    if (savedCanvasTitle) {
      setCanvasTitle(savedCanvasTitle);
    }

    if (savedConvoId) {
      loadSavedConversation(savedConvoId);
    }
  }, []);

  // Save to sessionStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Persist canvas title when it changes
  useEffect(() => {
    if (canvasTitle) {
      sessionStorage.setItem('canvasTitle', canvasTitle);
    } else {
      sessionStorage.removeItem('canvasTitle');
    }
  }, [canvasTitle]);

  // Clear canvas title when messages are cleared (new chat)
  useEffect(() => {
    if (messages.length === 0) {
      setCanvasTitle(null);
    }
  }, [messages.length]);

  const loadSavedConversation = async (convoId) => {
    try {
      const convo = await agentClient.agents.getConversation(convoId);
      setActiveConversation(convo);
      setMessages(convo?.messages || []);
    } catch (error) {
      console.error('Failed to load saved conversation:', error);
      sessionStorage.removeItem('activeConversationId');
    }
  };

  const clearHistory = () => {
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    setCanvasTitle(null);
    setExpandedTurnIndex(null);
    setIsLoading(false);
    sessionStorage.removeItem('activeConversationId');
    sessionStorage.removeItem('chatMessages');
    sessionStorage.removeItem('canvasTitle');
  };

  const value = {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    chatInputValue,
    setChatInputValue,
    canvasTitle,
    setCanvasTitle,
    expandedTurnIndex,
    setExpandedTurnIndex,
    clearHistory
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}