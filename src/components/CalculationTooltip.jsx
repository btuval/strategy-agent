"use client";

import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Wraps content and shows a hover bubble with calculation logic when calculationLogic is provided.
 * Use on any card or value that displays calculated data. Works across all pages.
 */
export function CalculationTooltip({ calculationLogic, children, className = "", asChild = true }) {
  if (!calculationLogic || typeof calculationLogic !== "string" || !calculationLogic.trim()) {
    return <>{children}</>;
  }
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild={asChild}>
        <span className={cn("inline-flex items-center cursor-help", className)}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="max-w-xs bg-slate-800 border border-white/10 text-slate-200 text-xs font-normal p-3 shadow-xl"
      >
        <p className="text-[10px] uppercase font-bold text-blue-400 mb-1.5 tracking-wider">Calculation</p>
        <p className="leading-relaxed whitespace-pre-wrap">{calculationLogic.trim()}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default CalculationTooltip;
