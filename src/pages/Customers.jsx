import React, { useState, useMemo } from "react";
import { 
  Users, TrendingUp, DollarSign, ShieldAlert, Target, 
  Filter, Info, Calculator, Zap, Layers, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * STRATEGIC AUDIENCE SEGMENTS
 * Baseline: 2,194,783 Customers
 * Terminology: "Package" instead of "Plan"
 */

const TOTAL_CUSTOMERS = 2194783;

export default function Customers() {
  const navigate = useNavigate();
  const [selectedCalc, setSelectedCalc] = useState(null);
  
  // Filtering States - Synchronized with cohort metadata
  const [filters, setFilters] = useState({
    packages: ['Ultimate', 'Premium', 'Standard', 'Basic'],
    lob: ['Satellite', 'Stream'],
    risk: ['Critical', 'High', 'Medium', 'Low']
  });

  // Formatting Helper: Scales to Millions if >= 1M
  const formatPop = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
  };

  const segments = useMemo(() => {
    const allSegments = [
      {
        id: "legacy_loyalists",
        name: "Legacy Satellite Loyalists",
        description: "Satellite customers with 36+ month tenure. Core revenue engine with high hardware lock-in.",
        color: "emerald",
        icon: Target,
        population: Math.round(TOTAL_CUSTOMERS * 0.5385),
        avgArpu: 148.62,
        riskScore: 14,
        riskLevel: 'Low',
        arrAtRisk: 18245000,
        lob: 'Satellite',
        packages: ['Standard', 'Premium', 'Ultimate'],
        calculation: {
          arr: `Calculation: (1.18M Customers × $148.62 ARPU × 12 Months) × 1.15% Projected Structural Attrition`,
          risk: "Risk Composition: 40% Pricing fatigue, 30% Competitive fiber expansion, 30% Hardware aging."
        }
      },
      {
        id: "high_risk_premium",
        name: "Flight-Risk Premium",
        description: "Ultimate Package customers with expiring promotional pricing and aggressive competition.",
        color: "rose",
        icon: ShieldAlert,
        population: Math.round(TOTAL_CUSTOMERS * 0.1192),
        avgArpu: 168.45,
        riskScore: 82,
        riskLevel: 'High',
        arrAtRisk: 48920000,
        lob: 'Satellite',
        packages: ['Ultimate'],
        calculation: {
          arr: `Calculation: (261k Customers × $168.45 ARPU × 12 Months) × 10.8% Churn Probability`,
          risk: "Risk Composition: 75% Competitive offer gap (Sports Bundles), 15% Macro-tightening."
        }
      },
      {
        id: "streaming_switchers",
        name: "Streaming Switchers",
        description: "App-only customers on Standard Packages. Highly sensitive to content rollouts and price hikes.",
        color: "amber",
        icon: TrendingUp,
        population: Math.round(TOTAL_CUSTOMERS * 0.2413),
        avgArpu: 82.15,
        riskScore: 48,
        riskLevel: 'Medium',
        arrAtRisk: 31280000,
        lob: 'Stream',
        packages: ['Standard', 'Basic'],
        calculation: {
          arr: `Calculation: (529k Customers × $82.15 ARPU × 12 Months) × 6.2% Content Elasticity`,
          risk: "Risk Composition: 60% Content seasonality, 30% Price sensitivity."
        }
      },
      {
        id: "svod_upsell",
        name: "SVOD Upsell Targets",
        description: "High-engagement Basic Package customers ready for Premium/SVOD bundles. Focus on margin expansion.",
        color: "blue",
        icon: DollarSign,
        population: Math.round(TOTAL_CUSTOMERS * 0.1010),
        avgArpu: 62.85,
        riskScore: 21,
        riskLevel: 'Low',
        arrAtRisk: 4825000,
        lob: 'Stream',
        packages: ['Basic'],
        calculation: {
          arr: `Calculation: (221k Customers × $62.85 ARPU × 12 Months) × 3.2% Revenue Leakage`,
          risk: "Risk Composition: 90% Under-monetized engagement, 10% Churn risk."
        }
      }
    ];

    // UPDATED FILTERING ENGINE
    return allSegments.filter(s => {
      const lobMatch = filters.lob.includes(s.lob);
      const packageMatch = s.packages.some(p => filters.packages.includes(p));
      const riskMatch = filters.risk.includes(s.riskLevel);
      return lobMatch && packageMatch && riskMatch;
    });
  }, [filters]);

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const handleModelCampaign = (segmentName) => {
    toast.info(`Initializing Strategic Model: ${segmentName}`);
    // Navigate to War Room with context
    setTimeout(() => {
      navigate('/Home', { 
        state: { 
          initialPrompt: `Draft a retention campaign for the ${segmentName} segment based on the 2.19M baseline.` 
        } 
      });
    }, 1000);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0f172a]">
      
      {/* LEFT SIDEBAR - FILTERS */}
      <div className="w-64 border-r border-white/5 bg-[#1e293b]/20 flex flex-col">
        <div className="p-4 border-b border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2 text-white">
            <Filter className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-xs uppercase tracking-widest">Filters</h2>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4 space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LOB</p>
            {['Satellite', 'Stream'].map(lob => (
              <div key={lob} className="flex items-center space-x-2">
                <Checkbox 
                  id={`lob-${lob}`} 
                  checked={filters.lob.includes(lob)} 
                  onCheckedChange={() => toggleFilter('lob', lob)} 
                  className="data-[state=checked]:bg-blue-600 border-slate-600"
                />
                <Label htmlFor={`lob-${lob}`} className="text-sm text-slate-300 cursor-pointer">{lob}</Label>
              </div>
            ))}
          </div>
          <Separator className="bg-white/5" />
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Packages</p>
            {['Ultimate', 'Premium', 'Standard', 'Basic'].map(pkg => (
              <div key={pkg} className="flex items-center space-x-2">
                <Checkbox 
                  id={`pkg-${pkg}`} 
                  checked={filters.packages.includes(pkg)} 
                  onCheckedChange={() => toggleFilter('packages', pkg)}
                  className="data-[state=checked]:bg-blue-600 border-slate-600"
                />
                <Label htmlFor={`pkg-${pkg}`} className="text-sm text-slate-300 cursor-pointer">{pkg} Package</Label>
              </div>
            ))}
          </div>
          <Separator className="bg-white/5" />
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Index</p>
            {['Critical', 'High', 'Medium', 'Low'].map(lvl => (
              <div key={lvl} className="flex items-center space-x-2">
                <Checkbox 
                  id={`risk-${lvl}`} 
                  checked={filters.risk.includes(lvl)} 
                  onCheckedChange={() => toggleFilter('risk', lvl)}
                  className="data-[state=checked]:bg-rose-600 border-slate-600"
                />
                <Label htmlFor={`risk-${lvl}`} className="text-sm text-slate-300 cursor-pointer">{lvl}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Audience Segments</h1>
            <p className="text-slate-400 mt-1 text-sm font-medium">Cohort matrix for <span className="text-blue-400">2,194,783</span> customers.</p>
          </div>
        </div>

        {segments.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
            {segments.map((segment) => {
              const Icon = segment.icon;
              return (
                <div key={segment.id} className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 shadow-xl hover:border-white/10 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{segment.name}</h3>
                      <div className={`p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed min-h-[32px]">{segment.description}</p>
                    
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Customers</p>
                        <p className="text-lg font-mono text-white">{formatPop(segment.population)}</p>
                      </div>
                      <div 
                        onClick={() => setSelectedCalc({ title: 'ARR Risk Logic Detail', description: segment.calculation.arr, value: `$${(segment.arrAtRisk/1000000).toFixed(1)}M` })}
                        className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-center cursor-pointer hover:bg-blue-900/20 transition-colors"
                      >
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 flex items-center justify-center gap-1">ARR at Risk <Calculator className="w-2 h-2"/></p>
                        <p className="text-lg font-mono text-white">${(segment.arrAtRisk/1000000).toFixed(1)}M</p>
                      </div>
                      <div 
                        onClick={() => setSelectedCalc({ title: 'Risk Index Composition', description: segment.calculation.risk, value: `${segment.riskScore}/100` })}
                        className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-center cursor-pointer hover:bg-rose-900/20 transition-colors"
                      >
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 flex items-center justify-center gap-1">Risk Index <Info className="w-2 h-2"/></p>
                        <p className={cn("text-lg font-mono", segment.riskScore > 60 ? "text-rose-400" : "text-emerald-400")}>{segment.riskScore}/100</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-xs text-slate-500">Avg. ARPU: <strong className="text-white font-mono">${segment.avgArpu}</strong></span>
                    <Button 
                      onClick={() => handleModelCampaign(segment.name)}
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-500 gap-2 shadow-lg shadow-blue-500/10"
                    >
                      <Zap className="w-3 h-3" /> Model Campaign
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl flex flex-col items-center">
            <Filter className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No segments matching the current filters.</p>
            <Button variant="ghost" onClick={() => setFilters({ packages: ['Ultimate', 'Premium', 'Standard', 'Basic'], lob: ['Satellite', 'Stream'], risk: ['Critical', 'High', 'Medium', 'Low'] })} className="mt-4 text-blue-400">Reset Filters</Button>
          </div>
        )}
      </div>

      {/* STRATEGIC CALCULATION MODAL */}
      <Dialog open={!!selectedCalc} onOpenChange={() => setSelectedCalc(null)}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              {selectedCalc?.title}
            </DialogTitle>
            <DialogDescription className="text-slate-400">Detailed executive breakdown of this metric.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-5 bg-slate-900 rounded-2xl text-sm leading-relaxed italic text-slate-300 border border-white/5 shadow-inner">
              "{selectedCalc?.description}"
            </div>
            <div className="flex justify-between items-center p-5 border border-blue-500/20 bg-blue-500/5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Projected Value</span>
              <span className="text-3xl font-mono text-white font-bold">{selectedCalc?.value}</span>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setSelectedCalc(null)} className="bg-slate-800 hover:bg-slate-700 px-8">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}