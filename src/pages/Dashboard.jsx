import { useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Users, DollarSign, PieChart as PieIcon, 
  ChevronRight, Target, Clock, BarChart2, MousePointer2, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent as DialogContentBase, DialogHeader, DialogTitle as DialogTitleBase, DialogDescription as DialogDescriptionBase } from '@/components/ui/dialog';

/** @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} */
const DialogContent = DialogContentBase;
/** @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>} */
const DialogTitle = DialogTitleBase;
/** @type {React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>} */
const DialogDescription = DialogDescriptionBase;
import { Badge } from '@/components/ui/badge';
import { CalculationTooltip } from '@/components/CalculationTooltip';

/**
 * EXECUTIVE PULSE DASHBOARD
 * Baseline: 2,194,783 Customers
 * Monthly Revenue: $265,568,743 ($265.5M)
 * Blended ARPU: $121.00
 */

const KPI_CONFIG = [
  { 
    label: 'Total Customers', 
    value: '2,194,783', 
    trend: '+1.2%', 
    icon: Users,
    split: { sat: '1.32M', stream: '0.87M' },
    calculationLogic: 'Total customers = Satellite subscribers + Streaming subscribers. Baseline from current base (2.19M).'
  },
  { 
    label: 'Monthly Baseline Revenue', 
    value: '$265.5M', 
    trend: '+5.1%', 
    icon: DollarSign,
    split: { sat: '$190.9M', stream: '$74.6M' },
    calculationLogic: 'Monthly revenue = (Satellite subs × Sat ARPU) + (Stream subs × Stream ARPU). $265.5M = $190.9M + $74.6M.'
  },
  { 
    label: 'Avg. ARPU (Blended)', 
    value: '$121.00', 
    trend: '+3.4%', 
    icon: TrendingUp,
    split: { sat: '$144.60', stream: '$85.70' },
    calculationLogic: 'Blended ARPU = Total monthly revenue / Total customers. Satellite ARPU $144.60, Stream ARPU $85.70.'
  },
];

const CAMPAIGNS = [
  {
    name: "Q3 Sports Retention",
    status: "Live",
    target: "150k Legacy Satellite Users",
    budget: 4500000,
    spend: 2100000,
    duration: "90 Days",
    remaining: "42 Days",
    newAdds: 12400,
    performance: "108% vs Exp.",
    color: "#3b82f6"
  },
  {
    name: "Stream Switcher Upsell",
    status: "Active",
    target: "500k Basic Stream Users",
    budget: 2000000,
    spend: 1800000,
    duration: "60 Days",
    remaining: "5 Days",
    newAdds: 45000,
    performance: "94% vs Exp.",
    color: "#10b981"
  },
  {
    name: "Winback: ATL/MIA DMAs",
    status: "Paused",
    target: "Churned Q2 Cohort",
    budget: 800000,
    spend: 150000,
    duration: "30 Days",
    remaining: "28 Days",
    newAdds: 1200,
    performance: "In Review",
    color: "#f59e0b"
  }
];

const REVENUE_TRENDS = [
  { month: 'Oct 25', satellite: 205.2, stream: 58.1 },
  { month: 'Nov 25', satellite: 199.8, stream: 61.4 },
  { month: 'Dec 25', satellite: 195.1, stream: 65.2 },
  { month: 'Jan 26', satellite: 192.2, stream: 70.0 },
  { month: 'Feb 26', satellite: 190.9, stream: 74.6 },
];

const CUSTOMER_PIE = [
  { 
    name: 'Satellite', 
    value: 1316870, 
    color: '#3b82f6', 
    packageSplit: "72% Premium Package / 28% Basic Package", 
    packages: [
      { name: 'Premium', pct: 72, customers: 948146 },
      { name: 'Standard', pct: 18, customers: 237037 },
      { name: 'Base', pct: 10, customers: 131687 },
    ],
    avgPrice: "$144.60", 
    churn: "8.2%", 
    adds: "14k" 
  },
  { 
    name: 'Stream', 
    value: 877913, 
    color: '#10b981', 
    packageSplit: "44% Premium Package / 56% Basic Package", 
    packages: [
      { name: 'Premium', pct: 44, customers: 386484 },
      { name: 'Standard', pct: 28, customers: 245816 },
      { name: 'Base', pct: 28, customers: 245613 },
    ],
    avgPrice: "$85.70", 
    churn: "21.5%", 
    adds: "48k" 
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          {label || payload[0].name}
        </p>
        {payload.map((/** @type {{ name?: string; value?: number | string; color?: string; fill?: string; unit?: string }} */ entry, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color || entry.fill }}
            ></div>
            <span className="text-sm font-medium text-slate-200">{entry.name}:</span>
            <span className="text-sm font-mono font-bold text-white ml-auto">
              {typeof entry.value === 'number' && entry.value >= 10 
                ? `${entry.value.toFixed(1)}M` 
                : entry.value}
              {entry.unit || ''}
            </span>
          </div>
        ))}
        <p className="mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-500 italic flex items-center gap-1">
          <MousePointer2 className="w-2 h-2" /> Click for strategic drill-down
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedLOB, setSelectedLOB] = useState(null);
  const [showDistributionByPackage, setShowDistributionByPackage] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. EXECUTIVE KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KPI_CONFIG.map((kpi, idx) => (
          <CalculationTooltip key={idx} calculationLogic={kpi.calculationLogic} className="block w-full">
          <Card className="bg-[#1e293b] border-white/5 p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all w-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <kpi.icon className="w-5 h-5 text-blue-400" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {kpi.trend}
              </Badge>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</h3>
              <p className="text-3xl font-bold text-white tracking-tight">{kpi.value}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Satellite
                 </p>
                 <p className="text-sm font-mono text-slate-200">{kpi.split.sat}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Stream
                 </p>
                 <p className="text-sm font-mono text-slate-200">{kpi.split.stream}</p>
               </div>
            </div>
          </Card>
          </CalculationTooltip>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. REVENUE BY LOB */}
        <Card className="lg:col-span-2 bg-[#1e293b] border-white/5 p-8 shadow-xl overflow-hidden relative z-0">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Revenue Growth by LOB
            </h2>
            <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Satellite</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Stream</span>
            </div>
          </div>
          <div className="h-[350px] w-full overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TRENDS}>
                <defs>
                  <linearGradient id="colorSat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} unit="M" />
                <Tooltip content={CustomTooltip} />
                <Area name="Satellite" type="monotone" dataKey="satellite" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSat)" />
                <Area name="Stream" type="monotone" dataKey="stream" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorStream)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. CUSTOMER BASE PIE */}
        <Card className="bg-[#1e293b] border-white/5 p-8 shadow-xl flex flex-col items-center">
          <h2 className="text-xl font-bold text-white self-start flex items-center gap-2 mb-8">
            <PieIcon className="w-5 h-5 text-blue-400" /> Market Mix
          </h2>
          <div 
            className="h-[280px] w-full cursor-pointer"
            onClick={() => setShowDistributionByPackage(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowDistributionByPackage(true)}
            aria-label="View distribution by package"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CUSTOMER_PIE}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {CUSTOMER_PIE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="outline-none hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-6 space-y-3">
             {CUSTOMER_PIE.map((lob) => (
               <div key={lob.name} onClick={() => setSelectedLOB(lob)} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lob.color }}></div>
                    <span className="text-sm font-bold text-slate-200">{lob.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-white">{(lob.value/1000000).toFixed(2)}M</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Customers</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>

      {/* 4. CAMPAIGN PULSE */}
      <Card className="bg-[#1e293b] border-white/5 p-8 shadow-xl overflow-hidden relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-amber-400" /> Campaign Pulse
            </h2>
            <p className="text-slate-400 text-sm mt-1">Real-time performance of active market initiatives.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAMPAIGNS.map((camp, idx) => (
            <div key={idx} onClick={() => setSelectedCampaign(camp)} className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: camp.color }}></div>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">{camp.name}</h3>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{camp.target}</p>
                 </div>
                 <Badge variant="default" className={`${camp.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border-none' : 'bg-amber-500/10 text-amber-400 border-none'}`}>
                   {camp.status}
                 </Badge>
               </div>

               <div className="space-y-4">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-500">Spend vs Budget</span>
                   <span className="text-slate-200 font-mono">${(camp.spend/1000000).toFixed(1)}M / ${(camp.budget/1000000).toFixed(1)}M</span>
                 </div>
                 <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 transition-all" style={{ width: `${(camp.spend/camp.budget)*100}%` }}></div>
                 </div>
                 <div className="flex justify-between items-end pt-2">
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">Efficiency</p>
                     <p className="text-sm font-bold text-emerald-400">{camp.performance}</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </Card>

      {/* DRILL-DOWN DIALOGS */}
      
      {/* Campaign Drill-down */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-2xl">
          <DialogHeader className="">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg"><Activity className="w-5 h-5 text-amber-400" /></div>
              <DialogTitle className="text-2xl font-bold">{selectedCampaign?.name}</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400">Detailed campaign analytics and budget utilization.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 mt-4">
             <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Target className="w-3 h-3"/> Core Metrics</p>
                <div className="space-y-4">
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Net New Adds</span><span className="font-mono text-emerald-400">+{selectedCampaign?.newAdds?.toLocaleString()}</span></div>
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Expectation</span><span className="font-mono text-white">{selectedCampaign?.performance}</span></div>
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Duration</span><span className="font-mono text-white">{selectedCampaign?.duration}</span></div>
                </div>
             </div>
             <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><DollarSign className="w-3 h-3"/> Budget Ledger</p>
                <div className="space-y-4">
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Allocated</span><span className="font-mono">${(selectedCampaign?.budget/1000000).toFixed(2)}M</span></div>
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Actual Spend</span><span className="font-mono text-rose-400">-${(selectedCampaign?.spend/1000000).toFixed(2)}M</span></div>
                   <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-sm font-bold">Remaining</span><span className="font-mono text-white">${((selectedCampaign?.budget - (selectedCampaign?.spend || 0))/1000000).toFixed(2)}M</span></div>
                </div>
             </div>
             <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5 col-span-2 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remaining Time</p>
                    <p className="text-lg font-bold text-white">{selectedCampaign?.remaining}</p>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500">View Data Export</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LOB Drill-down */}
      <Dialog open={!!selectedLOB} onOpenChange={() => setSelectedLOB(null)}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-2xl">
          <DialogHeader className="">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg"><BarChart2 className="w-5 h-5 text-blue-400" /></div>
              <DialogTitle className="text-2xl font-bold">{selectedLOB?.name} Segment Briefing</DialogTitle>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 mt-4">
             <div className="bg-[#0f172a] p-5 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Unit Economics</p>
                <div className="space-y-4">
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Customers</span><span className="font-mono text-white">{(selectedLOB?.value/1000000).toFixed(2)}M</span></div>
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Segment ARPU</span><span className="font-mono text-white">{selectedLOB?.avgPrice}</span></div>
                </div>
             </div>
             <div className="bg-[#0f172a] p-5 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Operational Status</p>
                <div className="space-y-4">
                   <div className="flex justify-between"><span className="text-sm text-slate-400">Churn Rate</span><span className="font-mono text-rose-400">{selectedLOB?.churn}</span></div>
                   <div className="flex justify-between"><span className="text-sm text-slate-400">New Adds (30d)</span><span className="font-mono text-emerald-400">+{selectedLOB?.adds}</span></div>
                </div>
             </div>
             <div className="col-span-2 bg-[#0f172a] p-5 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Package Distribution</p>
                <p className="text-slate-200 text-sm">{selectedLOB?.packageSplit}</p>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Market Mix - Distribution by Package (click on pie chart) */}
      <Dialog open={showDistributionByPackage} onOpenChange={setShowDistributionByPackage}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg"><PieIcon className="w-5 h-5 text-blue-400" /></div>
              <DialogTitle className="text-2xl font-bold">Distribution of Customers by LOB & Package</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400">Customer count and share by line of business and package tier.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {CUSTOMER_PIE.map((lob) => (
              <div key={lob.name} className="bg-[#0f172a] rounded-xl border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lob.color }} />
                  <h3 className="text-lg font-bold text-white">{lob.name}</h3>
                  <span className="text-sm text-slate-500 font-mono">{(lob.value / 1000000).toFixed(2)}M total</span>
                </div>
                <div className="space-y-3">
                  {(lob.packages || []).map((pkg, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-slate-300">{pkg.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-slate-200">{pkg.customers?.toLocaleString() ?? '—'} customers</span>
                        <span className="text-sm font-mono font-bold text-white w-12 text-right">{pkg.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}