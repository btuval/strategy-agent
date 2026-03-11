import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, BarChart, Users, 
  Globe, Zap, AlertTriangle, MessageSquare, Send, Loader2,
  ShieldAlert, TrendingDown, Target, User, ChevronDown, ChevronRight
} from "lucide-react";
import { ChatProvider, useChatContext } from "@/components/ChatContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { agentClient } from "@/api/agentClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { completeWithLLM } from "@/api/llm";
import { getFallbackStrategyResponse } from "@/api/fallbackStrategy";
import { jsonrepair } from "jsonrepair";
import { prompts as suggestedPrompts } from "@/components/chat/SuggestedPrompts";

function deriveCanvasTitle(message) {
  if (!message || typeof message !== "string") return "Strategy";
  const trimmed = message.trim();
  if (!trimmed) return "Strategy";
  const found = suggestedPrompts.find(
    (p) =>
      trimmed.includes(p.prompt.trim().slice(0, 40)) ||
      p.prompt.trim().includes(trimmed.slice(0, 50))
  );
  return found ? found.title : "Custom Strategy";
}

const cleanLLMResponse = (content) => {
  if (typeof content !== 'string') return content;
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  if (cleaned.startsWith("['json'") || cleaned.startsWith('["json"')) {
    try {
      const firstBracket = cleaned.indexOf('{');
      const lastBracket = cleaned.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
        cleaned = cleaned.replace(/\\"/g, '"'); 
      }
    } catch (e) {
      console.error("Failed to extract JSON from array format", e);
    }
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
};

function ChatSidebar() {
  // FIX 1: We pull clearHistory from the context
  const { messages, setMessages, isLoading, setIsLoading, chatInputValue, setChatInputValue, setCanvasTitle, expandedTurnIndex, setExpandedTurnIndex, clearHistory } = useChatContext();
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const location = useLocation();

  const turns = React.useMemo(() => {
    const result = [];
    const list = Array.isArray(messages) ? messages : [];
    for (let i = 0; i < list.length; i++) {
      const msg = list[i];
      if (msg && msg.role === "user") {
        result.push({ query: msg.content, userMsg: msg, assistantMsgs: [] });
      } else if (msg && msg.role === "assistant" && result.length > 0) {
        result[result.length - 1].assistantMsgs.push(msg);
      }
    }
    return result;
  }, [messages]);

  useEffect(() => {
    if (turns.length === 0) {
      setExpandedTurnIndex(null);
    } else {
      setExpandedTurnIndex(turns.length - 1);
    }
  }, [turns.length]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const h = el.scrollHeight;
    const max = 480;
    el.style.height = (h <= max ? h : max) + "px";
    el.style.overflowY = h <= max ? "hidden" : "auto";
  }, [chatInputValue]);

  const handleSend = async () => {
    if (!(chatInputValue || '').trim() || isLoading) return;
    
    const pageContext = `Current Screen: ${location.pathname}. `;
    const userMsg = { id: Date.now(), role: "user", content: chatInputValue };
    
    const isFirstMessage = messages.length === 0;
    setMessages(prev => [...prev, userMsg]);
    if (isFirstMessage) setCanvasTitle(deriveCanvasTitle(chatInputValue));
    setChatInputValue("");
    setIsLoading(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const rawResponse = await completeWithLLM([...messages, { ...userMsg, content: pageContext + chatInputValue }]);
      
      let cleanedResponse = cleanLLMResponse(rawResponse);
      if (cleanedResponse && typeof cleanedResponse === "string" && cleanedResponse.trim().startsWith("{")) {
        try {
          JSON.parse(cleanedResponse);
        } catch (_) {
          try {
            const repaired = jsonrepair(cleanedResponse);
            const parsed = typeof repaired === "string" ? JSON.parse(repaired) : repaired;
            if (parsed && typeof parsed === "object") cleanedResponse = JSON.stringify(parsed);
          } catch (__) {}
        }
      }
      let parsed = null;
      try {
        parsed = typeof cleanedResponse === "string" ? JSON.parse(cleanedResponse) : cleanedResponse;
      } catch (_) {}
      const contentToStore =
        parsed && typeof parsed === "object"
          ? (typeof cleanedResponse === "string" ? cleanedResponse : JSON.stringify(parsed))
          : JSON.stringify(getFallbackStrategyResponse(chatInputValue));
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: contentToStore }]);
      try {
        const finalParsed = typeof contentToStore === "string" ? JSON.parse(contentToStore) : null;
        if (finalParsed && typeof finalParsed.strategyTitle === "string" && finalParsed.strategyTitle.trim()) {
          setCanvasTitle(prev => (prev ? prev : finalParsed.strategyTitle.trim()));
        }
      } catch (_) {}
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: "assistant", 
        content: JSON.stringify(getFallbackStrategyResponse(chatInputValue)) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[400px] min-w-[400px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0f172a] h-full overflow-hidden z-20" dir="ltr">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-white">Strategic Assistant</h2>
        </div>
        <button
          type="button"
          onClick={clearHistory} // FIX 2: We use clearHistory to purge session storage completely
          className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ask questions about the data on this screen or model new strategic scenarios.
            </p>
          </div>
        )}
        {turns.map((turn, turnIndex) => {
          const isExpanded = expandedTurnIndex === turnIndex;
          const label = typeof turn.query === "string" && turn.query.trim()
            ? (turn.query.trim().length > 56 ? turn.query.trim().slice(0, 56) + "…" : turn.query.trim())
            : "Query";
          return (
            <Collapsible
              key={turnIndex}
              open={isExpanded}
              onOpenChange={(open) => {
                if (open) setExpandedTurnIndex(turnIndex);
                else setExpandedTurnIndex((prev) => (prev === turnIndex ? null : prev));
              }}
            >
              <div className="rounded-lg border border-white/10 bg-slate-900/50 overflow-hidden">
                <CollapsibleTrigger className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-slate-300 truncate flex-1">{label}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-0 space-y-3 border-t border-white/5">
                    <div className="flex flex-col items-end pt-2">
                      <div className="max-w-[85%] p-3 rounded-2xl rounded-br-none bg-blue-600 text-white text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                        {turn.query}
                      </div>
                    </div>
                    {(turn.assistantMsgs || []).map((msg, j) => {
                      let content = msg.content;
                      try {
                        const parsed = JSON.parse(msg.content || "{}");
                        content = parsed.chatResponse || "Analysis generated.";
                      } catch (e) {
                        const cleanAttempt = cleanLLMResponse(msg.content);
                        content = (cleanAttempt && cleanAttempt.length < 200) ? cleanAttempt : "Detailed Strategy Generated (View Dashboard)";
                      }
                      return (
                        <div key={j} className="flex flex-col items-start">
                          <div className="max-w-[85%] p-3 rounded-2xl rounded-bl-none bg-slate-800 text-slate-200 border border-white/5 text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                            {content}
                          </div>
                        </div>
                      );
                    })}
                    {isLoading && turnIndex === turns.length - 1 && (turn.assistantMsgs || []).length === 0 && (
                      <div className="flex gap-1 items-center p-2">
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Processing...</span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
        {isLoading && turns.length > 0 && turns[turns.length - 1].assistantMsgs.length > 0 && (
          <div className="flex gap-1 items-center p-2">
            <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Processing...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-white/5">
        <div className="relative" dir="ltr">
          <textarea
            ref={textareaRef}
            dir="ltr"
            value={chatInputValue || ''}
            onChange={(e) => setChatInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type a strategic query..."
            rows={1}
            className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-4 pr-12 pt-3 pb-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[44px] overflow-hidden text-left"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || !(chatInputValue || '').trim()}
            className="absolute right-2 bottom-2 h-8 w-8 bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { name: "Marketing Canvas", page: "Home", icon: Home },
  { name: "Executive Pulse", page: "Dashboard", icon: BarChart },
  { name: "Audience Segments", page: "Customers", icon: Users },
];

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await agentClient.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  return (
    <ChatProvider>
      <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-[#0f172a] flex flex-col font-sans text-slate-200 overflow-hidden">
        
        {/* 1. STRATEGIC COMPETITOR TICKER */}
        <div className="bg-slate-950 border-b border-white/5 py-1.5 px-6 flex justify-between items-center text-[10px] uppercase tracking-widest font-mono z-50">
          <div className="flex gap-10 overflow-hidden whitespace-nowrap items-center">
            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              COMPETITOR INTEL:
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <AlertTriangle className="w-3 h-3 animate-pulse" />
              <span className="text-slate-500">YouTube TV:</span> High-Aggression Q3 Promo ($49.99 Entry) in Tier 1 DMAs
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 border-l border-white/10 pl-10">
              <TrendingDown className="w-3 h-3" />
              <span className="text-slate-500">Hulu + Live:</span> Disney+ Bundle integration driving 4.2% Switch Intent
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 border-l border-white/10 pl-10">
              <Target className="w-3 h-3" />
              <span className="text-slate-500">Fubo:</span> Regional Sports Rights Acquisition finalized in SE Territory
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-6 text-slate-500">
            <span className="text-blue-500 font-bold italic">Strategy_Agent_v2</span>
            <span className="opacity-50">// Live_Intel_Stream</span>
          </div>
        </div>

        {/* 2. MAIN NAVIGATION */}
        <nav className="bg-[#1e293b] border-b border-white/10 shadow-sm z-40 relative">
          <div className="max-w-full mx-auto px-6">
            <div className="flex justify-between h-14 items-center">
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center flex-shrink-0 py-1 pr-3 rounded-lg -ml-1 hover:bg-white/5 transition-colors" aria-label="IMAGINE TV Home">
                  <span className="text-xl font-bold tracking-tight" style={{ color: '#00A8E0' }}>IMAGINE TV</span>
                </Link>
                {navItems.map((item) => {
                  const path = `/${item.page}`;
                  const isActive = location.pathname === path || (item.page === 'Home' && location.pathname === '/');
                  return (
                    <Link
                      key={item.page}
                      to={path}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                        isActive ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span className="text-slate-500 text-xs">Welcome Back</span>
                  <span className="font-medium text-slate-200">Tuval</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* 3. MAIN BODY */}
        <div className="flex flex-1 overflow-hidden">
          
          <ChatSidebar />
          
          <main id="main-scroll-container" className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col bg-slate-950/20 scroll-smooth">            {children}
          </main>

        </div>
      </div>
      </TooltipProvider>
    </ChatProvider>
  );
}