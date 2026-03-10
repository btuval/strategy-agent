import React, { useState, useMemo } from "react";
import { 
  Users, TrendingUp, DollarSign, ShieldAlert, Target, 
  Filter, Info, Calculator, Zap, Layers, MapPin, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * STRATEGIC AUDIENCE SEGMENTS
 * Baseline: 2,194,783 Customers
 * Terminology: "Package" instead of "Plan"
 */

const DMA_OPTIONS = ['Atlanta', 'Boston', 'Chicago', 'Dallas', 'Denver', 'Detroit', 'Houston', 'Los Angeles', 'Miami', 'Minneapolis', 'New York', 'Philadelphia', 'Phoenix', 'San Francisco', 'Seattle', 'Washington DC'];

const TOTAL_CUSTOMERS = 2194783;

export default function Customers() {
  const navigate = useNavigate();
  const [selectedCalc, setSelectedCalc] = useState(null);
  
  // Filtering States - Synchronized with cohort metadata
  const [filters, setFilters] = useState({
    packages: ['Ultimate', 'Premium', 'Standard', 'Basic'],
    lob: ['Satellite', 'Stream'],
    risk: ['Critical', 'High', 'Medium', 'Low'],
    dma: []
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
        dmas: ['New York', 'Chicago', 'Philadelphia', 'Dallas', 'Atlanta', 'Houston'],
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
        dmas: ['Los Angeles', 'San Francisco', 'Miami', 'Washington DC', 'Boston'],
        calculation: {
          arr: `Calculation: (261k Customers × $168.45 ARPU × 12 Months) × 10.8% Churn Probability`,
          risk: "Risk Composition: 75% Competitive offer gap (Sports Bundles), 15% Macro-tightening."
        }
      },
      {
        id: "suburban_hybrid",
        name: "Suburban Hybrid Families",
        description: "Satellite + streaming bundle users. Strong retention but sensitive to price and content.",
        color: "amber",
        icon: Layers,
        population: Math.round(TOTAL_CUSTOMERS * 0.0891),
        avgArpu: 132.20,
        riskScore: 38,
        riskLevel: 'Medium',
        arrAtRisk: 12400000,
        lob: 'Satellite',
        packages: ['Premium', 'Standard'],
        dmas: ['Detroit', 'Phoenix', 'Minneapolis', 'Denver', 'Seattle'],
        calculation: {
          arr: `Calculation: (195k Customers × $132.20 ARPU × 12 Months) × 4.1% Blended Churn`,
          risk: "Risk Composition: 50% Bundle price sensitivity, 50% Content overlap with stream-only."
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
        dmas: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'],
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
        dmas: ['Dallas', 'Atlanta', 'Miami', 'Washington DC', 'Boston', 'San Francisco'],
        calculation: {
          arr: `Calculation: (221k Customers × $62.85 ARPU × 12 Months) × 3.2% Revenue Leakage`,
          risk: "Risk Composition: 90% Under-monetized engagement, 10% Churn risk."
        }
      },
      {
        id: "cord_cutter_urban",
        name: "Urban Cord-Cutters",
        description: "Stream-only, price-sensitive. High churn risk but large growth potential with right content.",
        color: "rose",
        icon: Zap,
        population: Math.round(TOTAL_CUSTOMERS * 0.0119),
        avgArpu: 58.40,
        riskScore: 61,
        riskLevel: 'High',
        arrAtRisk: 4200000,
        lob: 'Stream',
        packages: ['Basic'],
        dmas: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Seattle', 'Boston'],
        calculation: {
          arr: `Calculation: (26k Customers × $58.40 ARPU × 12 Months) × 18% Urban Churn`,
          risk: "Risk Composition: 70% Competition from vMVPDs, 30% Price sensitivity."
        }
      }
    ];

    return allSegments.filter(s => {
      const lobMatch = filters.lob.includes(s.lob);
      const packageMatch = s.packages.some(p => filters.packages.includes(p));
      const riskMatch = filters.risk.includes(s.riskLevel);
      const dmaMatch = !filters.dma || filters.dma.length === 0 || (s.dmas && s.dmas.some(d => filters.dma.includes(d)));
      return lobMatch && packageMatch && riskMatch && dmaMatch;
    });
  }, [filters]);

  const toggleFilter = (/** @type {string} */ type, /** @type {string} */ value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter((/** @type {string} */ v) => v !== value)
        : [...prev[type], value]
    }));
  };

  const handleModelCampaign = (/** @type {string} */ segmentName) => {
    toast.info(`Initializing Strategic Model: ${segmentName}`);
    // Navigate to Marketing Canvas with context
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
          <Separator className="bg-white/5" />
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DMA</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-9 text-xs font-normal bg-[#0f172a] border-white/10 text-slate-200 hover:bg-white/5 hover:text-white"
                >
                  <span className="truncate">
                    {filters.dma.length === 0 ? 'All DMAs' : `${filters.dma.length} DMA${filters.dma.length === 1 ? '' : 's'} selected`}
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
                </Button>
              </PopoverTrigger>
              {/* @ts-expect-error PopoverContent accepts children */}
              <PopoverContent align="start" className="w-64 p-0 bg-[#1e293b] border-white/10 text-white">
                <div>
                <div className="p-2 border-b border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select DMAs</p>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-2 space-y-1">
                    {DMA_OPTIONS.map(dma => (
                      <div
                        key={dma}
                        className="flex items-center space-x-2 rounded-md px-2 py-1.5 hover:bg-white/5 cursor-pointer"
                        onClick={() => toggleFilter('dma', dma)}
                      >
                        <Checkbox
                          id={`dma-${dma}`}
                          checked={filters.dma.includes(dma)}
                          onCheckedChange={() => toggleFilter('dma', dma)}
                          onClick={(e) => e.stopPropagation()}
                          className="data-[state=checked]:bg-blue-600 border-slate-600"
                        />
                        <Label htmlFor={`dma-${dma}`} className="text-sm text-slate-300 cursor-pointer flex-1 truncate">{dma}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {filters.dma.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-slate-400 hover:text-white"
                      onClick={() => setFilters(prev => ({ ...prev, dma: [] }))}
                    >
                      Clear selection
                    </Button>
                  </div>
                )}
                </div>
              </PopoverContent>
            </Popover>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {segments.map((segment) => {
              const Icon = segment.icon;
              return (
                <div key={segment.id} className="bg-[#1e293b] border border-white/5 rounded-xl p-4 shadow-lg hover:border-white/10 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider shrink-0",
                              segment.lob === 'Satellite' ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            )}
                          >
                            {segment.lob}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate" title={segment.name}>{segment.name}</h3>
                      </div>
                      <div className={cn("p-1.5 rounded-lg shrink-0", segment.lob === 'Satellite' ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400")}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed line-clamp-2 min-h-[32px]">{segment.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5 text-center">
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Customers</p>
                        <p className="text-sm font-mono text-white">{formatPop(segment.population)}</p>
                      </div>
                      <div 
                        onClick={() => setSelectedCalc({ title: 'ARR Risk Logic Detail', description: segment.calculation.arr, value: `$${(segment.arrAtRisk/1000000).toFixed(1)}M` })}
                        className="bg-slate-900/60 p-2 rounded-lg border border-white/5 text-center cursor-pointer hover:bg-blue-900/20 transition-colors"
                      >
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5 flex items-center justify-center gap-0.5">ARR at Risk <Calculator className="w-2 h-2"/></p>
                        <p className="text-sm font-mono text-white">${(segment.arrAtRisk/1000000).toFixed(1)}M</p>
                      </div>
                      <div 
                        onClick={() => setSelectedCalc({ title: 'Risk Index Composition', description: segment.calculation.risk, value: `${segment.riskScore}/100` })}
                        className="bg-slate-900/60 p-2 rounded-lg border border-white/5 text-center cursor-pointer hover:bg-rose-900/20 transition-colors"
                      >
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-0.5 flex items-center justify-center gap-0.5">Risk <Info className="w-2 h-2"/></p>
                        <p className={cn("text-sm font-mono", segment.riskScore > 60 ? "text-rose-400" : "text-emerald-400")}>{segment.riskScore}/100</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-[10px] text-slate-500">ARPU: <strong className="text-white font-mono">${segment.avgArpu}</strong></span>
                    <Button 
                      onClick={() => handleModelCampaign(segment.name)}
                      size="sm" 
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-500 gap-1.5 shadow-lg shadow-blue-500/10"
                    >
                      <Zap className="w-3 h-3" /> Model
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
            <Button variant="ghost" onClick={() => setFilters({ packages: ['Ultimate', 'Premium', 'Standard', 'Basic'], lob: ['Satellite', 'Stream'], risk: ['Critical', 'High', 'Medium', 'Low'], dma: [] })} className="mt-4 text-blue-400">Reset Filters</Button>
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