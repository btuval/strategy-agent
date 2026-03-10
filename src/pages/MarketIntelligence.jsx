import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Corrected import: removed .js extension which often causes resolution errors in Vite/React environments
import { agentClient } from "../api/agentClient";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ShieldCheck, 
  Globe, 
  Swords, 
  Zap,
  BarChart3
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

// Ground Rules & Competitor Data Fallbacks aligned with 2M customer context
const COMPETITOR_BENCHMARKS = [
  { 
    name: "Netflix", 
    share: 22.5, 
    growth: 4.2, 
    price: 15.49, 
    risk: "Medium",
    radar: { content: 95, price: 60, sports: 10, reach: 98, tech: 90 }
  },
  { 
    name: "YouTube TV", 
    share: 10.2, 
    growth: 12.8, 
    price: 72.99, 
    risk: "High",
    radar: { content: 80, price: 40, sports: 90, reach: 85, tech: 95 }
  },
  { 
    name: "Charter Spectrum", 
    share: 18.7, 
    growth: -3.1, 
    price: 85.00, 
    risk: "Low",
    radar: { content: 85, price: 30, sports: 95, reach: 70, tech: 50 }
  },
  { 
    name: "Fubo TV", 
    share: 1.5, 
    growth: 22.0, 
    price: 79.99, 
    risk: "Critical",
    radar: { content: 60, price: 45, sports: 98, reach: 30, tech: 75 }
  }
];

export default function MarketIntelligence() {
  const { data: rawIntel = [], isLoading } = useQuery({
    queryKey: ["market-intel"],
    queryFn: () => agentClient.entities.CompetitorBenchmark?.list() || Promise.resolve([]),
  });

  const intelData = rawIntel.length > 0 ? rawIntel : COMPETITOR_BENCHMARKS;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Market Intelligence</h1>
          <p className="text-slate-400 mt-2 text-lg">Real-time competitive landscape and threat radar.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm shadow-sm">
             <AlertCircle className="w-4 h-4 text-rose-400" />
             <span className="text-xs text-rose-200 font-bold uppercase tracking-widest">Global Sector Churn: +1.2%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* THREAT RADAR - Visualizing capabilities against the market avg */}
        <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" /> Competitive Capability Radar
            </h2>
            <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Strategy Agent Co</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Market Average</span>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Content Depth', A: 90, B: 85, fullMark: 100 },
                { subject: 'Price Value', A: 40, B: 60, fullMark: 100 },
                { subject: 'Sports Rights', A: 95, B: 65, fullMark: 100 },
                { subject: 'Brand Reach', A: 85, B: 90, fullMark: 100 },
                { subject: 'Tech UX', A: 95, B: 80, fullMark: 100 },
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Strategy Agent Co" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Market Avg" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                   itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* THREAT INDEX PANEL - Tracking aggressive competitors */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 px-2">
             <Swords className="w-5 h-5 text-rose-400" /> Active Threat Index
           </h2>
           {intelData.map((comp) => (
             <div key={comp.name} className="bg-[#1e293b] border border-white/5 rounded-xl p-5 hover:border-white/20 transition-all group cursor-default">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-white text-lg">{comp.name}</h3>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Share: {comp.share}%</p>
                 </div>
                 <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                   comp.risk === 'Critical' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse' :
                   comp.risk === 'High' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                   'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                 }`}>
                   {comp.risk} Risk
                 </div>
               </div>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400 font-medium">Growth Velocity</span>
                   <span className={`font-mono font-bold ${comp.growth > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {comp.growth > 0 ? '+' : ''}{comp.growth}%
                   </span>
                 </div>
                 <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${comp.risk === 'Critical' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.2)]'}`} 
                      style={{ width: `${comp.share * 2}%` }}
                    />
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* MARKET CONTEXT CARDS - High-level takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 hover:bg-indigo-500/10 transition-colors group">
            <div className="p-2 bg-indigo-500/10 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h4 className="text-white font-bold mb-2">Sector Innovation</h4>
            <p className="text-sm text-slate-400 leading-relaxed">GenAI-driven personalization is now a standard tier feature for 80% of top-10 competitors. UX latency remains our core moat.</p>
         </div>
         <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 hover:bg-emerald-500/10 transition-colors group">
            <div className="p-2 bg-emerald-500/10 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-white font-bold mb-2">Regulatory Shift</h4>
            <p className="text-sm text-slate-400 leading-relaxed">Updated FCC 'junk fee' rules impact satellite contract disclosure cycles; 5% Opex headwind projected for Q3 alignment.</p>
         </div>
         <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 hover:bg-amber-500/10 transition-colors group">
            <div className="p-2 bg-amber-500/10 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-white font-bold mb-2">Content Elasticity</h4>
            <p className="text-sm text-slate-400 leading-relaxed">NBA rights renewal speculation is driving a 15% surge in vMVPD 'sports bundle' interest across major metro DMAs.</p>
         </div>
      </div>
    </div>
  );
}