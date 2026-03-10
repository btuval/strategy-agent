/**
 * Generates a valid strategy JSON object when the LLM fails or returns invalid data.
 * Ensures the canvas always receives a parseable response with all expected fields.
 *
 * @param {string} [userQuery] - The user's message (for context in the fallback message).
 * @returns {object} Valid strategy object suitable for JSON.stringify and canvas rendering.
 */
export function getFallbackStrategyResponse(userQuery = "") {
  let cleaned = typeof userQuery === "string" ? userQuery.trim() : "";
  cleaned = cleaned.replace(/^Current Screen:\s*[^.]*\.\s*/i, "").trim();
  const querySnippet = cleaned.length > 0
    ? cleaned.slice(0, 80) + (cleaned.length > 80 ? "…" : "")
    : "your request";

  return {
    strategyTitle: "Service Unavailable",
    chatResponse: `Analysis for "${querySnippet}" could not be completed because the AI service is temporarily unavailable. Please try again in a moment.`,
    executiveSummary: "The strategy engine could not generate a response for this query. This is usually temporary; retry shortly or simplify your question.",
    executiveSummaryBullets: [
      "AI service temporarily unavailable.",
      "Your query was received but could not be processed.",
      "Please try again in a moment or check your connection.",
      "If the issue persists, try a shorter or simpler question.",
    ],
    recommendations: [
      { title: "Retry your request", value: "Wait a few seconds and send the same query again.", achieves: "Often resolves transient API issues.", doesNotAchieve: "Does not help if the outage is prolonged." },
      { title: "Check connectivity", value: "Ensure your network is stable and you can reach external services.", achieves: "Rules out local network problems.", doesNotAchieve: "Does not fix server-side outages." },
      { title: "Simplify the query", value: "Try a shorter or more focused question.", achieves: "May succeed with a smaller request.", doesNotAchieve: "You may need the full analysis once service is back." },
      { title: "Use the chat history", value: "Previous responses in this thread remain available in the canvas.", achieves: "Lets you refer to earlier strategy output.", doesNotAchieve: "Does not generate new analysis." },
    ],
    kpis: [
      { label: "Service status", value: "Unavailable", trend: "down", calculationLogic: "Fallback shown when the LLM could not be reached." },
      { label: "Recommendation", value: "Retry shortly", trend: "up", calculationLogic: "Most 503/429 issues resolve within a minute." },
    ],
    rationale: {
      title: "Why you're seeing this",
      topics: [
        { title: "Cause", bullets: ["The AI provider (e.g. Gemini) returned an error or no response.", "Common causes: temporary overload (503), rate limit (429), or network issues."] },
        { title: "What to do", bullets: ["Wait a moment and try again.", "If you had a previous response in this chat, it remains visible above."] },
      ],
    },
    scenarioComparisonTitle: "When service is back",
    comparisonParamOrder: ["Action", "Expected result"],
    scenarios: [
      { title: "Retry same query", description: "Send the same message again after a short wait.", pros: ["No change to your question.", "Often works within 1–2 minutes."], cons: ["May still fail if outage continues."], parameters: { Action: "Retry", "Expected result": "New analysis" } },
      { title: "Simplify and retry", description: "Ask a shorter or more focused question.", pros: ["Smaller requests sometimes succeed during partial outages."], cons: ["You may need to ask follow-ups for full detail."], parameters: { Action: "Simplify", "Expected result": "Partial analysis" } },
    ],
  };
}

/**
 * Returns true if the parsed object looks like valid strategy data (has chatResponse and at least one of recommendations/executiveSummary).
 * @param {any} obj
 * @returns {boolean}
 */
export function isValidStrategyData(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  if (obj.chatResponse == null) return false;
  return Array.isArray(obj.recommendations) || obj.executiveSummary != null || obj.executiveSummaryBullets != null;
}
