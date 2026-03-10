/**
 * Strategy Agent API client.
 * All answers come from the configured LLM; no hardcoded responses.
 * When no LLM is configured or the API fails, returns a short fallback message.
 */

import { STRATEGY_AGENT_SYSTEM_PROMPT } from './strategyAgentDefinition';
import { completeWithLLM } from './llm';

const conversations = new Map();
let nextId = 1;

const LLM_UNAVAILABLE_MESSAGE =
  "I couldn't generate a response. Please ensure an API key (Gemini) is set in .env and try again.";

function generateId() {
  return `conv-${Date.now()}-${nextId++}`;
}

function createConversation({ agent_name, metadata = {} }) {
  const convo = {
    id: generateId(),
    app_id: '',
    agent_name: agent_name || 'strategy_agent',
    created_by_id: '',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    messages: [],
    metadata,
  };
  conversations.set(convo.id, convo);
  return Promise.resolve(convo);
}

function getConversation(conversationId) {
  const convo = conversations.get(conversationId);
  return Promise.resolve(convo ? { ...convo, messages: [...(convo.messages || [])] } : undefined);
}

function addMessage(conversation, message) {
  const convo = conversations.get(conversation.id);
  if (!convo) return Promise.reject(new Error('Conversation not found'));

  const userMsg = {
    id: `msg-${Date.now()}-u`,
    role: 'user',
    content: message.content,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  };
  convo.messages = [...(convo.messages || []), userMsg];
  convo.updated_date = new Date().toISOString();

  return (async () => {
    const llmContent = await completeWithLLM(convo.messages);
    const content = llmContent !== null ? llmContent : LLM_UNAVAILABLE_MESSAGE;

    const assistantMsg = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    convo.messages = [...convo.messages, assistantMsg];
    convo.updated_date = new Date().toISOString();
    conversations.set(convo.id, convo);

    (convo._subscribers || []).forEach((cb) => cb(convo));

    return assistantMsg;
  })();
}

function subscribeToConversation(conversationId, onUpdate) {
  const convo = conversations.get(conversationId);
  if (!convo) return () => {};
  if (!convo._subscribers) convo._subscribers = [];
  convo._subscribers.push(onUpdate);
  return () => {
    convo._subscribers = (convo._subscribers || []).filter((c) => c !== onUpdate);
  };
}

// Mock entities and functions for pages that used Base44
const entities = {
  Customer: {
    /** @param {string} [sort] @param {number} [limit] @returns {Promise<any[]>} */
    list: (sort, limit) => Promise.resolve([]),
    /** @param {object} [query] @param {string} [sort] @param {number} [limit] @returns {Promise<any[]>} */
    filter: (query, sort, limit) => Promise.resolve([]),
  },
};

const functions = {
  /** @param {string} [name] @param {object} [args] @returns {Promise<{ data: object }>} */
  invoke: (name, args) => Promise.resolve({ data: { success: false, error: 'Connect your own backend' } }),
};

const appLogs = {
  logUserInApp: () => Promise.resolve(),
};

const auth = {
  me: () => Promise.resolve(null),
  logout: () => {},
  redirectToLogin: () => {},
};

export const agentClient = {
  agents: {
    createConversation,
    getConversation,
    addMessage,
    subscribeToConversation,
  },
  entities,
  functions,
  appLogs,
  auth,
};

export { STRATEGY_AGENT_SYSTEM_PROMPT };
