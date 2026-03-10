/**
 * LLM client for Strategy Agent.
 * Supports Google Gemini (VITE_GOOGLE_API_KEY)
 * If Gemini key is set, it is used; otherwise returns fallback strategy JSON.
 */

import { STRATEGY_AGENT_SYSTEM_PROMPT } from './strategyAgentDefinition';
import { getFallbackStrategyResponse } from './fallbackStrategy';
import { jsonrepair } from 'jsonrepair';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const GEMINI_RATE_LIMIT_MESSAGE =
  "The API is temporarily rate-limiting requests. Please wait a minute and try again.";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGoogleKey() {
  return import.meta.env.VITE_GOOGLE_API_KEY || '';
}

/**
 * Build messages for the API: system + conversation history (user/assistant only).
 */
function buildMessages(conversationMessages) {
  const messages = [
    { role: 'system', content: STRATEGY_AGENT_SYSTEM_PROMPT },
  ];
  conversationMessages.forEach((m) => {
    const role = m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : null;
    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content || '');
    if (role && content) messages.push({ role, content });
  });
  return messages;
}

/**
 * Call Google Gemini.
 * STRATEGY: Tries gemini-2.5-flash first (better availability), then Pro, then 2.0-flash on 429/404/503.
 */
export async function completeWithGemini(conversationMessages) {
    const apiKey = getGoogleKey();
  if (!apiKey) return null;

  const history = conversationMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant');

  const contents = history.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
  }));

  const body = {
    systemInstruction: { parts: [{ text: STRATEGY_AGENT_SYSTEM_PROMPT }] },
    contents: contents,
    generationConfig: { maxOutputTokens: 4096, temperature: 0 },
  };

  // Try Flash first (better availability, fewer 503s), then Pro, then 2.0-flash as last resort
  const MODEL_ORDER = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
  const PRIMARY_MODEL = MODEL_ORDER[0];
  const FALLBACK_MODEL = MODEL_ORDER[1];

  // Helper function to perform the fetch
  const fetchModel = async (modelName) => {
    const url = `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  try {
    // -------------------------------------------------------
    // ATTEMPT 1: Try the Pro Model
    // -------------------------------------------------------
    let res = await fetchModel(PRIMARY_MODEL);

    // ADDED 500, 502, 503, 504 to the catch block for server overloads
    if (!res.ok && [429, 404, 500, 502, 503, 504].includes(res.status)) {
      console.warn(`⚠️ ${PRIMARY_MODEL} failed (${res.status}). Switching to ${FALLBACK_MODEL}...`);
      
      // Give the overloaded server a 1-second breather before hitting it again
      if (res.status === 503 || res.status === 429) {
        await sleep(1000); 
      }
      
      // -------------------------------------------------------
      // ATTEMPT 2: Fallback to Flash Model
      // -------------------------------------------------------
      res = await fetchModel(FALLBACK_MODEL);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`❌ Gemini Error (${res.status}):`, err);
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === 'string' ? text.trim() : null;

  } catch (e) {
    console.error('❌ Gemini Network Exception:', e);
    return null;
  }
}

/**
 * Call configured LLM. Returns Gemini response string when successful, or valid fallback JSON string when not.
 */
export async function completeWithLLM(conversationMessages) {
  let out = null;
  if (getGoogleKey()) {
    out = await completeWithGemini(conversationMessages);
  }
  if (out != null && typeof out === "string" && out.trim().length > 0) {
    const raw = out.trim().replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
    try {
      const repaired = jsonrepair(raw);
      const parsed = typeof repaired === "string" ? JSON.parse(repaired) : repaired;
      if (parsed && typeof parsed === "object" && parsed.chatResponse != null) {
        return JSON.stringify(parsed);
      }
    } catch (_) {}
    return raw;
  }
  const list = Array.isArray(conversationMessages) ? conversationMessages : [];
  let lastUserContent = "";
  for (let i = list.length - 1; i >= 0; i--) {
    const m = list[i];
    if (m && m.role === "user" && m.content != null) {
      lastUserContent = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      break;
    }
  }
  return JSON.stringify(getFallbackStrategyResponse(lastUserContent));
}

export function isLLMConfigured() {
  return !!getGoogleKey();
}
