import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatInput({ onSend, isLoading, initialValue = "", placeholder }) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  // Handle auto-resizing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue("");
    
    // Instantly reset height back to 1 row after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative group">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder={placeholder || "Ask about pricing strategy, churn analysis..."}
        rows={1}
        className={cn(
          "w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3.5 pr-14 resize-none text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all max-h-[200px] shadow-inner",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        className={cn(
          "absolute right-2 bottom-2 h-9 w-9 inline-flex items-center justify-center rounded-md transition-all duration-300",
          value.trim() && !isLoading 
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
            : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}