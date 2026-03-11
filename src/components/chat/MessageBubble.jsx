import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
// Import the flexible chart component we created
import { FlexibleChart } from '@/components/dashboard/FlexibleChart';

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || "Function";
  const status = toolCall?.status || "pending";
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try { return typeof results === "string" ? JSON.parse(results) : results; } 
    catch { return results; }
  })();

  const isError = results && (
    (typeof results === "string" && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: "text-slate-400", text: "Querying data..." },
    running: { icon: Loader2, color: "text-indigo-500", text: "Analyzing...", spin: true },
    in_progress: { icon: Loader2, color: "text-indigo-500", text: "Processing...", spin: true },
    completed: isError
      ? { icon: AlertCircle, color: "text-red-500", text: "Failed" }
      : { icon: CheckCircle2, color: "text-emerald-500", text: "Done" },
    success: { icon: CheckCircle2, color: "text-emerald-500", text: "Done" },
    failed: { icon: AlertCircle, color: "text-red-500", text: "Failed" },
    error: { icon: AlertCircle, color: "text-red-500", text: "Failed" },
  }[status] || { icon: Zap, color: "text-slate-400", text: "" };

  const Icon = statusConfig.icon;
  const formattedName = name.replace(/\./g, " › ").toLowerCase();

  return (
    <div className="mt-2 text-xs font-medium">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
          "bg-[#1e293b] hover:bg-white/5 border-white/10",
          expanded && "bg-white/5 border-white/20 shadow-sm"
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-slate-300">{formattedName}</span>
        {statusConfig.text && (
          <span className={cn("text-slate-400", isError && "text-red-400")}>• {statusConfig.text}</span>
        )}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={cn("h-3.5 w-3.5 text-slate-400 transition-transform ml-auto", expanded && "rotate-90")} />
        )}
      </button>
      {expanded && !statusConfig.spin && (
        <div className="mt-1.5 ml-3 pl-3 border-l-2 border-white/10 space-y-2">
          {parsedResults && (
            <pre className="bg-[#0f172a] border border-white/10 rounded-lg p-3 text-[11px] text-slate-300 whitespace-pre-wrap max-h-48 overflow-auto">
              {typeof parsedResults === "object" ? JSON.stringify(parsedResults, null, 2) : parsedResults}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  const content = message.content || '';
  // Logic to strip Executive Summary for special display, keeping the rest
  const executiveSummaryMatch = content.match(/## 📋 EXECUTIVE SUMMARY\n\n([\s\S]*?)(?=\n##|$)/);
  const hasExecutiveSummary = executiveSummaryMatch && executiveSummaryMatch[1];
  const remainingContent = hasExecutiveSummary 
    ? content.replace(executiveSummaryMatch[0], '').trim()
    : content;

  return (
    <div className={cn("flex gap-4 max-w-4xl mx-auto mb-6", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mt-1 flex-shrink-0 shadow-sm">
          <Zap className="h-4 w-4 text-indigo-400" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        
        {/* Special Executive Summary Card */}
        {!isUser && hasExecutiveSummary && (
          <div className="mb-4 rounded-2xl px-6 py-5 bg-[#1e293b] border border-white/10 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Executive Summary</h3>
            </div>
            <ReactMarkdown 
              className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              remarkPlugins={[remarkGfm]}
            >
              {executiveSummaryMatch[1]}
            </ReactMarkdown>
          </div>
        )}

        {/* Main Message Content */}
        {(message.content || remainingContent) && (
          <div className={cn(
            "rounded-2xl px-5 py-4 shadow-lg",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-[#1e293b] border border-white/10 text-white"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                remarkPlugins={[remarkGfm]}
                components={{
                  // 🔥 CUSTOM RENDERER FOR CHARTS & IMAGES 🔥
                  code: (/** @type {React.ComponentProps<'code'> & { inline?: boolean }} */ { inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";
                    
                    // 1. DETECT FLEXIBLE CHART JSON
                    // If the AI outputs a code block marked as json or chart, we try to parse it
                    if (!inline && (language === "json" || language === "chart")) {
                      try {
                        const contentStr = String(children).replace(/\n$/, "");
                        const parsedConfig = JSON.parse(contentStr);
                        
                        // Check if it matches our "Universal Chart Protocol" schema
                        if (parsedConfig.chartType && parsedConfig.series && parsedConfig.data) {
                          return <FlexibleChart config={parsedConfig} />;
                        }
                      } catch (e) {
                        // If parsing fails, fall through to render as normal code block
                      }
                    }

                    // 2. NORMAL CODE BLOCK RENDERER
                    return !inline && match ? (
                      <div className="relative group/code mt-4 mb-4">
                        <pre className="bg-[#0f172a] border border-white/10 text-slate-300 rounded-xl p-4 overflow-x-auto shadow-sm">
                          <code className={className} {...props}>{children}</code>
                        </pre>
                        <Button
                          size="icon" variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/code:opacity-100 bg-[#1e293b] hover:bg-white/10 rounded-lg transition-all"
                          onClick={() => { navigator.clipboard.writeText(String(children).replace(/\n$/, "")); toast.success("Copied to clipboard"); }}
                        >
                          <Copy className="h-4 w-4 text-slate-300" />
                        </Button>
                      </div>
                    ) : (
                      <code className="px-1.5 py-0.5 rounded-md bg-white/5 text-indigo-400 text-xs font-mono">{children}</code>
                    );
                  },

                  // BEAUTIFIED IMAGES
                  img: ({ src, alt }) => (
                    <div className="my-5 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                      <img src={src} alt={alt} className="w-full h-auto object-cover" />
                      {alt && <p className="text-center text-xs text-slate-400 py-2 bg-[#0f172a] border-t border-white/10">{alt}</p>}
                    </div>
                  ),
                  
                  // BEAUTIFIED TABLES
                  table: ({ children }) => <div className="overflow-x-auto my-5 shadow-sm rounded-xl border border-white/10"><table className="min-w-full text-sm text-left bg-[#1e293b] overflow-hidden">{children}</table></div>,
                  thead: ({ children }) => <thead className="bg-[#0f172a] border-b border-white/10">{children}</thead>,
                  th: ({ children }) => <th className="px-4 py-3 text-slate-300 font-semibold">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-3 text-slate-300 border-b border-white/5">{children}</td>,
                  
                  // STANDARD TYPOGRAPHY
                  a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">{children}</a>,
                  p: ({ children }) => <p className="my-3 leading-relaxed text-slate-300">{children}</p>,
                  ul: ({ children }) => <ul className="my-3 ml-5 list-disc text-slate-300 marker:text-slate-400">{children}</ul>,
                  ol: ({ children }) => <ol className="my-3 ml-5 list-decimal text-slate-300 marker:text-slate-400">{children}</ol>,
                  li: ({ children }) => <li className="my-1.5 pl-1 leading-relaxed text-slate-300">{children}</li>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-4 text-white tracking-tight">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-3 text-white tracking-tight">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 text-white">{children}</h3>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-500 bg-white/5 pl-4 py-2 pr-4 rounded-r-lg my-4 text-slate-300 italic">{children}</blockquote>,
                }}
              >
                {hasExecutiveSummary ? remainingContent : message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        
        {/* Tool/Function Calls */}
        {message.tool_calls?.length > 0 && (
          <div className="space-y-2 mt-2 w-full">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}