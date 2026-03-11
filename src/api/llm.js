/**
 * LLM client for Strategy Agent.
 * Exclusively supports Google Gemini (VITE_GOOGLE_API_KEY).
 */

import { STRATEGY_AGENT_SYSTEM_PROMPT } from './strategyAgentDefinition';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGoogleKey() {
  return import.meta.env.VITE_GOOGLE_API_KEY || '';
}

export async function completeWithGemini(conversationMessages) {
  const apiKey = getGoogleKey();
  if (!apiKey) {
    console.error("❌ No Google API Key found in environment variables.");
    return null;
  }

  const PRIMARY_MODEL = 'gemini-2.5-pro';
  const FALLBACK_MODEL_1 = 'gemini-2.5-flash';
  const FALLBACK_MODEL_2 = 'gemini-2.0-flash';

  const history = conversationMessages.filter(
    (m) => m.role === 'user' || m.role === 'assistant'
  );

  // FIX: WIPE OLD JSON MEMORY. 
  // If we leave the massive tables in history, the AI gets lazy and copies them.
  // This forces it to recalculate the math for EVERY prompt.
  const cleanedContents = history.map((m) => {
    let textStr = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
    
    // Scrub massive JSON blocks from the assistant's memory
    if (m.role === 'assistant' && textStr.includes('{') && textStr.length > 300) {
      textStr = '{"chatResponse": "Previous scenario successfully modeled. I will generate completely fresh data for the next query."}';
    }
    
    return {
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: textStr }],
    };
  });

  const payload = {
    systemInstruction: { parts: [{ text: STRATEGY_AGENT_SYSTEM_PROMPT }] },
    contents: cleanedContents,
    // Turn the temperature up slightly to force creative variance in the numbers
    generationConfig: { maxOutputTokens: 8192, temperature: 0.4 },
  };

  const fetchModel = async (modelName) => {
    const url = `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  try {
    let res = await fetchModel(PRIMARY_MODEL);

    if (!res.ok && [429, 404, 500, 502, 503, 504].includes(res.status)) {
      console.warn(`⚠️ ${PRIMARY_MODEL} failed (${res.status}). Switching to ${FALLBACK_MODEL_1}...`);
      if (res.status === 503 || res.status === 429) await sleep(1000); 
      res = await fetchModel(FALLBACK_MODEL_1);

      if (!res.ok && [429, 404, 500, 502, 503, 504].includes(res.status)) {
        console.warn(`⚠️ ${FALLBACK_MODEL_1} failed (${res.status}). Switching to ${FALLBACK_MODEL_2}...`);
        if (res.status === 503 || res.status === 429) await sleep(1000); 
        res = await fetchModel(FALLBACK_MODEL_2);
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`❌ Gemini Final Error (${res.status}):`, err);
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

export async function completeWithLLM(conversationMessages) {
  return completeWithGemini(conversationMessages);
}

export function isLLMConfigured() {
  return !!getGoogleKey();
}