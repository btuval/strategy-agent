import React, { useMemo, useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Target, Zap, AlertCircle, 
  BarChart3, PlayCircle, Activity, Globe, Loader2, ShieldAlert, Crosshair,
  CheckCircle2, ChevronDown, ChevronRight, Users, Clock, Monitor,
  FileText
} from "lucide-react";

import { useChatContext } from "@/components/ChatContext"; 
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// --- 1. Dashboard Sub-Components ---

const StrategicBriefing = ({ data }) => {
  const bullets = useMemo(() => {
    if (Array.isArray(data?.executiveSummary)) return data.executiveSummary;
    if (typeof data?.executiveSummary === 'string') return [data.executiveSummary];
    return ["Strategic analysis finalized. Reviewing modeled impact below."];
  }, [data]);

  return (
    <div className="relative bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-md overflow-hidden mb-8">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-blue-400"></div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Executive Summary</h2>
      </div>
      <ul className="space-y-3">
        {bullets.map((point, i) => (
          <li key={i} className="text-slate-200 text-sm font-medium flex gap-3 items-start leading-relaxed">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ImpactCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-slate-900/40 border border-white/5 p-5 rounded-xl flex items-center gap-5 shadow-md">
    <div className={`p-3 rounded-xl ${colorClass.bg}`}><Icon className={`w-5 h-5 ${colorClass.text}`} /></div>
    <div>
      <p className="text-[10px] uppercase font-bold tracking-tighter text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${colorClass.text}`}>{value}</p>
    </div>
  </div>
);

const PackageModelTable = ({ data }) => {
  if (!data?.packageTableData) return null;
  return (
    <div className="bg-slate-900/20 border border-white/5 rounded-xl p-6 overflow-hidden">
      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Target className="w-4 h-4" /> Package Analysis</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 border-b border-white/5 uppercase font-bold">
            <tr><th className="pb-4 px-2">Tier</th><th className="pb-4 px-2">Baseline</th><th className="pb-4 px-2">Delta</th><th className="pb-4 px-2">Target</th><th className="pb-4 px-2">Sub Loss</th></tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-white/5 font-mono">
            {data.packageTableData.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-2 font-sans font-medium text-white">{row.package}</td><td className="py-4 px-2">{row.currentPrice}</td><td className="py-4 px-2 text-blue-400">{row.proposedIncrease}</td><td className="py-4 px-2 text-emerald-400 font-bold">{row.newPrice}</td><td className="py-4 px-2 text-rose-400">{row.subLoss}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ChurnModelTable = ({ data }) => {
  const segments = data?.segmentTableData || data?.tableData;
  if (!segments) return null;
  return (
    <div className="bg-slate-900/20 border border-white/5 rounded-xl p-6 overflow-hidden">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Activity className="w-4 h-4" /> Segment Impact</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 border-b border-white/5 uppercase font-bold">
            <tr><th className="pb-4 px-2">Cohort</th><th className="pb-4 px-2">Size</th><th className="pb-4 px-2">ARPU</th><th className="pb-4 px-2">Increase</th><th className="pb-4 px-2">Sub Loss</th></tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-white/5 font-mono">
            {segments.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-2 font-sans font-medium text-white">{row.segment}</td><td className="py-4 px-2">{row.size}</td><td className="py-4 px-2">{row.curArpu}</td><td className="py-4 px-2 text-blue-400">{row.inc}</td><td className="py-4 px-2 text-rose-400">{row.loss}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScenarioComparisonTable = ({ data }) => {
  if (!data?.scenarioComparison) return null;
  return (
    <div className="bg-slate-900/20 border border-white/5 rounded-xl p-6 overflow-hidden">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Scenario Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 border-b border-white/5 uppercase font-bold">
            <tr><th className="pb-4 px-3">Strategy</th><th className="pb-4 px-3">Rev Lift</th><th className="pb-4 px-3">Churn</th><th className="pb-4 px-3">Risk</th></tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-white/5 font-mono">
            {data.scenarioComparison.map((row, i) => (
              <tr key={i} className={`${row.isRecommended ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}>
                <td className="py-4 px-3 font-sans text-white font-medium">{row.scenarioName}</td><td className="py-4 px-3 text-emerald-400 font-bold">{row.revenueLift}</td><td className="py-4 px-3 text-rose-400 font-bold">{row.churn}</td><td className="py-4 px-3 uppercase text-[10px] tracking-widest">{row.riskLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RecommendationCards = ({ data }) => {
  if (!data?.scenarios || data.scenarios.length === 0) return null;
  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Strategic Recommendations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.scenarios.map((scenario, idx) => {
          const isRecommended = scenario.title.toLowerCase().includes("recommend");
          return (
            <div key={idx} className={`bg-slate-900/60 border rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 shadow-2xl ${isRecommended ? 'border-blue-500 shadow-blue-500/20 ring-1 ring-blue-500/50' : 'border-white/5 hover:border-blue-500/30'}`}>
              <div className={`p-6 border-b ${isRecommended ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/5 bg-slate-900/30'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] uppercase font-black tracking-widest ${isRecommended ? 'text-emerald-400' : 'text-blue-500'}`}>
                    {isRecommended ? '★ Recommended Approach' : `Scenario ${idx + 1}`}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 leading-tight">{scenario.title.replace(/\(Recommended\)/i, '').replace(/Recommended:/i, '').trim()}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{scenario.description}</p>
              </div>
              <div className="p-6 flex-1 space-y-6 bg-[#1e293b]/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase font-bold text-emerald-500 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> Upside</p>
                    <ul className="text-[11px] text-slate-300 space-y-1.5">
                      {(scenario.pros || []).map((u, i) => (
                        <li key={i} className="flex gap-2 leading-tight items-start"><span className="text-emerald-500/50">•</span>{u}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> Risk</p>
                    <ul className="text-[11px] text-slate-300 space-y-1.5">
                      {(scenario.cons || []).map((r, i) => (
                        <li key={i} className="flex gap-2 leading-tight items-start"><span className="text-rose-500/50">•</span>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- 2. Individual Strategy Stack Item ---

const StrategyResultItem = ({ item, isOpen, onToggle }) => {
  const kpis = item.data?.kpis || [];

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-5 bg-slate-900/80 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all group">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-blue-600' : 'bg-slate-800'}`}><Crosshair className="w-5 h-5 text-white" /></div>
            <span className="text-sm font-black text-white uppercase tracking-[0.1em] text-left">{item.queryTitle}</span>
          </div>
          {isOpen ? <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-8 space-y-10">
          <StrategicBriefing data={item.data} />
          
          {kpis.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, idx) => (
                <ImpactCard key={idx} icon={kpi.trend === 'down' ? TrendingDown : TrendingUp} label={kpi.label} value={kpi.value} colorClass={kpi.trend === 'down' ? { bg: 'bg-rose-500/10', text: 'text-rose-400' } : { bg: 'bg-emerald-500/10', text: 'text-emerald-400' }} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <PackageModelTable data={item.data} />
            <ChurnModelTable data={item.data} />
          </div>

          <ScenarioComparisonTable data={item.data} />
          <RecommendationCards data={item.data} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// --- 3. Main Dashboard Controller ---

const HomeContent = () => {
  const { messages, isLoading, setChatInputValue } = useChatContext();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const resultsHistory = useMemo(() => {
    const history = [];
    let lastUserQuery = "";
    messages.forEach((msg) => {
      if (msg.role === "user") lastUserQuery = msg.content;
      else if (msg.role === "assistant") {
        try {
          let content = msg.content;
          content = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
          const first = content.indexOf("{");
          const last = content.lastIndexOf("}");
          if (first !== -1 && last !== -1) {
            // FIX: unshift adds to the START of the array. Newest query is always at the top!
            history.unshift({ 
              id: msg.id || Math.random(),
              queryTitle: lastUserQuery, 
              data: JSON.parse(content.substring(first, last + 1)) 
            });
          }
        } catch (e) { }
      }
    });
    return history;
  }, [messages]);
  
  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    
    if (isLoading) {
      setExpandedIndex(null);
      // Immediately snap to the top when sending a new query
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else if (resultsHistory.length > 0) {
      // The newest item is always at index 0 now
      setExpandedIndex(0);
    }
  }, [isLoading, resultsHistory.length]);

  const promptCards = [
    { icon: Target, title: "Revenue Lift Strategy", prompt: "Build a price increase strategy to achieve a $10M revenue lift." },
    { icon: Activity, title: "Churn Modeling", prompt: "Model churn impact of a $2 increase on urban segments." },
    { icon: ShieldAlert, title: "Competitive Defense", prompt: "How should we respond to YouTube TV's $49.99 promo?" },
    { icon: TrendingUp, title: "Premium Upsell", prompt: "Identify the best segments for a premium package upsell." },
    { icon: Crosshair, title: "Segment Deep Dive", prompt: "Perform a deep dive analysis on the Legacy Satellite Loyalists segment." }
  ];

  return (
    <div className="w-full h-full pb-20">
      <div className="max-w-7xl mx-auto p-10 relative">
        {resultsHistory.length === 0 && !isLoading && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-20 py-20 animate-in fade-in duration-1000">
            <div className="text-center space-y-6">
              <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">MARKETING STRATEGY AGENT</h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">Select a strategic objective to begin cohort modeling.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
              {promptCards.map((card, idx) => (
                <button key={idx} onClick={() => setChatInputValue(card.prompt)} className="bg-slate-900/40 border border-white/10 p-8 rounded-[2.5rem] hover:bg-slate-800 hover:border-blue-500/50 transition-all text-left group">
                  <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><card.icon className="w-6 h-6 text-blue-400" /></div>
                  <h4 className="text-white font-bold text-lg mb-3">{card.title}</h4>
                  <p className="text-sm text-slate-500 italic">"{card.prompt}"</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Loader now appears at the TOP of the screen! */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 bg-blue-500/5 rounded-3xl border border-dashed border-blue-500/20">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-blue-400 text-xs font-black uppercase tracking-[0.4em] animate-pulse">Strategizing...</p>
            </div>
          )}
          
          {/* Results are rendered newest first (top to bottom) */}
          {resultsHistory.map((item, idx) => (
            <StrategyResultItem 
              key={item.id} 
              item={item} 
              isOpen={expandedIndex === idx} 
              onToggle={() => setExpandedIndex(expandedIndex === idx ? null : idx)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() { return <HomeContent />; }