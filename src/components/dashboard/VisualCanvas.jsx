import React from "react";
import { TrendingUp, Target, Zap, PlayCircle, BarChart3, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { CalculationTooltip } from "@/components/CalculationTooltip";

export default function VisualCanvas({ parsedData, isThinking }) {
  
  if (isThinking && !parsedData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950">
         <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
         <h3 className="text-xl font-semibold text-white">Aggregating Market Data</h3>
         <p className="text-slate-400 mt-2">Calculating price elasticity and competitive risks...</p>
      </div>
    );
  }

  if (!parsedData) return null;

  const { executiveSummary, detailedAnalysis, kpis, scenarios } = parsedData;
  const hasContent = executiveSummary || detailedAnalysis || (kpis && kpis.length > 0) || (scenarios && scenarios.length > 0);

  if (!hasContent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 p-8">
        <div className="text-center max-w-md">
           <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-50" />
           <p className="text-slate-400">Response registered in chat. Ask a strategic question to generate a full canvas briefing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#0f172a] p-8 lg:p-12 space-y-8">
      
      {/* 1. EXECUTIVE BRIEFING */}
      {executiveSummary && (
        <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" /> Strategic Briefing
          </h2>
          <p className="text-slate-200 text-lg leading-relaxed font-medium relative z-10">
            {executiveSummary}
          </p>
          
          {/* Projected KPI Impact Pills */}
          {kpis && kpis.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Projected Business Impact</h3>
              <div className="flex flex-wrap gap-4">
                {kpis.map((kpi, idx) => {
                  const isPositive = kpi.trend === "up";
                  const isFlat = kpi.trend === "flat";
                  const colorClass = isFlat ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                  const pill = (
                    <div key={idx} className={`border px-4 py-2.5 rounded-lg flex items-center gap-3 ${colorClass}`}>
                      <TrendingUp className={`w-4 h-4 ${!isPositive && !isFlat ? 'transform rotate-180' : ''}`} />
                      <span className="text-sm text-slate-200">
                        {kpi.label}: <strong className={`font-mono text-base ${isFlat ? 'text-amber-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{kpi.value}</strong>
                      </span>
                    </div>
                  );
                  return kpi.calculationLogic ? (
                    <CalculationTooltip key={idx} calculationLogic={kpi.calculationLogic} className="inline-flex">{pill}</CalculationTooltip>
                  ) : (
                    pill
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DETAILED ANALYSIS (Flexible Markdown Section) */}
      {detailedAnalysis && (
        <div className="bg-[#1e293b]/80 border border-white/5 rounded-2xl p-8 shadow-xl">
          <div className="prose prose-invert max-w-none text-slate-300 prose-headings:text-indigo-400 prose-a:text-blue-400 prose-strong:text-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {detailedAnalysis}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 3. SCENARIO MODELING (Side-by-Side Comparison) */}
      {scenarios && scenarios.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Scenario Models
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scenarios.map((scenario, idx) => (
              <div key={idx} className="bg-[#1e293b] border border-white/5 rounded-2xl flex flex-col hover:border-indigo-500/30 transition-all duration-300 shadow-xl group overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-white/5 bg-slate-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Scenario {idx + 1}</span>
                    <div className="p-1.5 bg-indigo-500/10 rounded-md">
                      <Zap className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{scenario.title}</h3>
                  <p className="text-sm text-slate-400">{scenario.description}</p>
                </div>

                {/* Pros/Cons Grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5">
                   <div className="bg-[#1e293b] p-5">
                     <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Upside</h4>
                     <ul className="space-y-2">
                       {scenario.pros?.map((pro, i) => (
                         <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                           <span className="text-emerald-500 mt-0.5">•</span> {pro}
                         </li>
                       ))}
                     </ul>
                   </div>
                   <div className="bg-[#1e293b] p-5">
                     <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">Risk</h4>
                     <ul className="space-y-2">
                       {scenario.cons?.map((con, i) => (
                         <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                           <span className="text-rose-500 mt-0.5">•</span> {con}
                         </li>
                       ))}
                     </ul>
                   </div>
                </div>

                {/* Card Action */}
                <div className="p-6 pt-4 mt-auto border-t border-white/5">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-all">
                    <PlayCircle className="w-4 h-4" /> Simulate Execution
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}