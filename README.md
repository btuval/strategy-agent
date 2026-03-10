# Strategy Agent

AI-powered strategic analysis for your business.

## Run locally

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`

### Use a real LLM (recommended)

To have the chat process prompts with an actual LLM (OpenAI) and return answers that follow the strategy agent rules:

1. Copy `.env.example` to `.env`.
2. Set `VITE_OPENAI_API_KEY` to your OpenAI API key.
3. Restart the dev server.

The app uses the strategy agent system prompt (same as the cursor rules in `entities/.cursorrules`) so the LLM follows guardrails, campaign format, and multi-LOB analysis. If no key is set, the app uses in-app mock responses.

## Project structure

- **src/api/agentClient.js** – Agent conversation API; calls the LLM when `VITE_OPENAI_API_KEY` is set.
- **src/api/llm.js** – OpenAI Chat Completions client; uses `STRATEGY_AGENT_SYSTEM_PROMPT` from `strategyAgentDefinition.js`.
- **src/api/strategyAgentDefinition.js** – System prompt (cursor rules) for the Strategy Agent.
- **src/pages/Home.jsx** – Main Strategy Agent chat and canvas (with thinking animation while the LLM runs).
- **src/components/dashboard/VisualCanvas.jsx** – Strategy canvas and thinking state.

## Build

`npm run build`

## Preview

`npm run preview`
