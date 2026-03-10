import React, { useMemo } from "react";
import { jsonrepair } from "jsonrepair";
import { getFallbackStrategyResponse } from "@/api/fallbackStrategy";
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Zap, 
  AlertCircle, 
  BarChart3, 
  PlayCircle, 
  Activity,
  Loader2,
  ChevronDown,
  ChevronRight,
  Brain
} from "lucide-react";
import { useChatContext } from "@/components/ChatContext";
import SuggestedPrompts from "@/components/chat/SuggestedPrompts";
import { CalculationTooltip } from "@/components/CalculationTooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// --- 1. Visual Canvas Sub-Components ---

const StrategicBriefing = ({ data }) => {
  const text = data?.executiveSummary || data?.briefing || data?.chatResponse || "Awaiting strategic input from the Assistant. Execute a pricing or segment query to begin analysis.";
  const bullets = Array.isArray(data?.executiveSummaryBullets) && data.executiveSummaryBullets.length > 0
    ? data.executiveSummaryBullets
    : typeof text === "string"
      ? text.split(/(?<=[.!])\s+/).filter(Boolean).map(s => s.trim())
      : [String(text)];
  return (
    <div className="bg-slate-900/40 border border-blue-500/20 rounded-xl p-4 mb-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-500/20 rounded-lg">
          <Target className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Strategic Briefing</h3>
      </div>
      <ul className="text-slate-200 text-sm font-medium leading-relaxed space-y-1.5 list-disc list-outside pl-6 marker:text-blue-400">
        {bullets.map((item, i) => (
          <li key={i} className="pl-1">{item}</li>
        ))}
      </ul>
    </div>
  );
};

/** Renders structured rationale (topics > sub-topics > bullets) when user asks for "your thinking" / "how you calculated" / rationale. */
const AnalysisRationale = ({ rationale }) => {
  if (!rationale || !rationale.topics || !Array.isArray(rationale.topics) || rationale.topics.length === 0) return null;
  const title = rationale.title || "Analysis rationale";
  return (
    <div className="bg-slate-900/40 border border-amber-500/20 rounded-xl p-4 mb-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-amber-500/20 rounded-lg">
          <Brain className="w-4 h-4 text-amber-400" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">{title}</h3>
      </div>
      <div className="space-y-4">
        {rationale.topics.map((topic, i) => (
          <div key={i}>
            <h4 className="text-sm font-bold text-white mb-2">{topic.title}</h4>
            {topic.subTopics && topic.subTopics.length > 0 ? (
              <div className="space-y-3 pl-2 border-l-2 border-white/10">
                {topic.subTopics.map((sub, j) => (
                  <div key={j}>
                    <h5 className="text-xs font-semibold text-slate-300 mb-1.5">{sub.title}</h5>
                    {sub.bullets && sub.bullets.length > 0 && (
                      <ul className="text-slate-200 text-xs leading-relaxed space-y-0.5 list-disc list-outside pl-5 marker:text-amber-500">
                        {sub.bullets.map((bullet, k) => (
                          <li key={k} className="pl-1">{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : topic.bullets && topic.bullets.length > 0 ? (
              <ul className="text-slate-200 text-xs leading-relaxed space-y-0.5 list-disc list-outside pl-5 marker:text-amber-500">
                {topic.bullets.map((bullet, k) => (
                  <li key={k} className="pl-1">{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const ImpactCard = ({ icon: Icon, label, value, colorClass, calculationLogic }) => (
  <CalculationTooltip calculationLogic={calculationLogic} className="block w-full">
    <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl flex items-center gap-3 transition-all hover:border-white/10 hover:bg-slate-900/80 shadow-md w-full">
      <div className={`p-2.5 rounded-xl ${colorClass.bg}`}>
        <Icon className={`w-4 h-4 ${colorClass.text}`} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-tighter text-slate-500 mb-0.5">{label}</p>
        <p className={`text-lg font-bold font-mono ${colorClass.text}`}>{value}</p>
      </div>
    </div>
  </CalculationTooltip>
);

const RecommendationsList = ({ recommendations }) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) return null;
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 mb-4 overflow-hidden shadow-xl backdrop-blur-md">
      <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-400" /> Strategic Recommendations
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <div key={i} className="border border-white/5 rounded-lg p-4 bg-slate-900/30 hover:border-white/10 transition-colors">
            <h4 className="text-sm font-bold text-white mb-1.5">{rec.title || `Recommendation ${i + 1}`}</h4>
            {rec.value && <p className="text-slate-300 text-xs mb-2">{rec.value}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">What it achieves</p>
                <p className="text-slate-300">{rec.achieves ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-500 mb-1">What it doesn't achieve</p>
                <p className="text-slate-300">{rec.doesNotAchieve ?? "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChurnModelTable = ({ data, title = "Price Increase & Churn Model — Impact by Segment", rowKey = "segment", dataKey = "tableData" }) => {
  const Th = ({ label, logic = null }) => logic ? (
    <th className="pb-2 px-2"><CalculationTooltip calculationLogic={logic} className="inline"><span className="cursor-help border-b border-dotted border-slate-500">{label}</span></CalculationTooltip></th>
  ) : (
    <th className="pb-2 px-2">{label}</th>
  );
  return (
  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 mb-4 overflow-hidden shadow-xl backdrop-blur-md">
    <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
      <Activity className="w-4 h-4 text-slate-400" /> {title}
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-slate-500 border-b border-white/5 uppercase tracking-tighter font-bold">
          <tr>
            <Th label={rowKey === "package" ? "Package" : "Segment"} />
            <Th label="Size (M)" />
            <Th label="Current ARPU" />
            <Th label="Proposed Increase" logic="Dollar or % increase applied to this segment. Drives New ARPU and sub loss." />
            <Th label="New ARPU" logic="New ARPU = Current ARPU + Proposed Increase (or × (1 + %))." />
            <Th label="Price Elasticity" logic="Elasticity = % change in quantity / % change in price. Higher = more churn for same price increase." />
            <Th label="Projected Sub Loss" logic="Projected Sub Loss = Segment size (subs) × Projected churn % for this segment." />
          </tr>
        </thead>
          <tbody className="text-slate-300 divide-y divide-white/5 font-mono">
          {(data?.[dataKey] || (rowKey === "package" ? [] : [
            { segment: "Legacy Satellite Loyalists", size: "0.60", curArpu: "$145.00", inc: "+$10.00", newArpu: "$155.00", elast: "0.05", loss: "-2,070" },
            { segment: "Suburban Hybrid Families", size: "0.70", curArpu: "$115.00", inc: "+$7.00", newArpu: "$122.00", elast: "0.10", loss: "-4,270" },
            { segment: "Urban Cord-Cutters", size: "0.40", curArpu: "$80.00", inc: "+$4.00", newArpu: "$84.00", elast: "0.18", loss: "-3,600" }
          ])).map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-2 font-sans font-medium text-white">{row[rowKey] ?? row.segment}</td>
              <td className="py-2.5 px-2">{row.size}</td>
              <td className="py-2.5 px-2">{row.curArpu}</td>
              <td className="py-2.5 px-2 text-blue-400">{row.inc}</td>
              <td className="py-2.5 px-2 text-emerald-400 font-bold">{row.newArpu}</td>
              <td className="py-2.5 px-2">{row.elast}</td>
              <td className="py-2.5 px-2 text-rose-400">{row.loss}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

/** Price Increase & Churn Model — Impact by Package. Package names and current prices are FIXED; all other fields are dynamic from API (or placeholders). Total Sat + Stream = 2,194,783. */
const FIXED_PACKAGES = [
  { package: "Base", currentPrice: "$75" },
  { package: "Standard", currentPrice: "$125" },
  { package: "Premium", currentPrice: "$195" },
  { package: "Ultimate", currentPrice: "$275" },
];

/** Placeholder when LLM omits a package field; avoids showing hardcoded scenario-specific numbers. */
const DEFAULT_PACKAGE_DYNAMICS = [
  { satCust: "—", streamCust: "—", proposedIncreasePct: "—", newPrice: "—", projectedChurnPct: "—", projectedCustLoss: "—" },
  { satCust: "—", streamCust: "—", proposedIncreasePct: "—", newPrice: "—", projectedChurnPct: "—", projectedCustLoss: "—" },
  { satCust: "—", streamCust: "—", proposedIncreasePct: "—", newPrice: "—", projectedChurnPct: "—", projectedCustLoss: "—" },
  { satCust: "—", streamCust: "—", proposedIncreasePct: "—", newPrice: "—", projectedChurnPct: "—", projectedCustLoss: "—" },
];

const ChurnModelPackageTable = ({ data }) => {
  const apiRows = Array.isArray(data?.packageTableData) ? data.packageTableData : [];
  const rows = FIXED_PACKAGES.map((fixed, i) => {
    const api = apiRows[i];
    const def = DEFAULT_PACKAGE_DYNAMICS[i];
    return {
      ...fixed,
      satCust: api?.satCust ?? def?.satCust ?? "—",
      streamCust: api?.streamCust ?? def?.streamCust ?? "—",
      proposedIncreasePct: api?.proposedIncreasePct ?? def?.proposedIncreasePct ?? "—",
      newPrice: api?.newPrice ?? def?.newPrice ?? "—",
      projectedChurnPct: api?.projectedChurnPct ?? def?.projectedChurnPct ?? "—",
      projectedCustLoss: api?.projectedCustLoss ?? def?.projectedCustLoss ?? "—",
    };
  });
  const thWithTooltip = (label, logic) => logic ? (
    <th className="pb-2 px-2"><CalculationTooltip calculationLogic={logic} className="inline"><span className="cursor-help border-b border-dotted border-slate-500">{label}</span></CalculationTooltip></th>
  ) : (
    <th className="pb-2 px-2">{label}</th>
  );
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 mb-4 overflow-hidden shadow-xl backdrop-blur-md">
      <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-slate-400" /> Price Increase & Churn Model — Impact by Package
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 border-b border-white/5 uppercase tracking-tighter font-bold">
            <tr>
              <th className="pb-2 px-2">Package</th>
              <th className="pb-2 px-2">Sat. Cust.</th>
              <th className="pb-2 px-2">Stream Cust.</th>
              <th className="pb-2 px-2">Current Price</th>
              {thWithTooltip("Proposed Increase (%)", "Proposed increase % applied to current price. Drives New Price and churn impact.")}
              {thWithTooltip("New Price", "New Price = Current Price × (1 + Proposed Increase %).")}
              {thWithTooltip("Projected Churn (%)", "Estimated churn % for this package after the price change (from elasticity and segment mix).")}
              {thWithTooltip("Projected Cust. Loss", "Projected Cust. Loss = (Sat. Cust. + Stream Cust.) × Projected Churn %.")}
            </tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-white/5 font-mono">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-2 font-sans font-medium text-white">{row.package}</td>
                <td className="py-2.5 px-2">{row.satCust}</td>
                <td className="py-2.5 px-2">{row.streamCust}</td>
                <td className="py-2.5 px-2">{row.currentPrice}</td>
                <td className="py-2.5 px-2 text-blue-400">{row.proposedIncreasePct}</td>
                <td className="py-2.5 px-2 text-emerald-400 font-bold">{row.newPrice}</td>
                <td className="py-2.5 px-2">{row.projectedChurnPct}</td>
                <td className="py-2.5 px-2 text-rose-400">{row.projectedCustLoss}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** Renders a table from agent-provided title, columns, and rows. Same card styling as ChurnModelTable. */
const DynamicTable = ({ title, columns = [], rows = [] }) => {
  if (!title || !Array.isArray(columns) || columns.length === 0) return null;
  const colList = columns.map((c) => (typeof c === "string" ? { key: c, label: c } : { key: c.key || c.label, label: c.label || c.key }));
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 mb-4 overflow-hidden shadow-xl backdrop-blur-md">
      <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-slate-400" /> {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 border-b border-white/5 uppercase tracking-tighter font-bold">
            <tr>
              {colList.map((col, i) => (
                <th key={i} className="pb-2 px-2">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-white/5 font-mono">
            {(Array.isArray(rows) ? rows : []).map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                {colList.map((col, j) => (
                  <td key={j} className="py-2.5 px-2">
                    {row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScenarioCard = ({ scenario, index }) => (
  <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full group hover:border-blue-500/30 transition-all duration-300 shadow-2xl relative z-10">
    <div className="p-4 border-b border-white/5 bg-slate-900/30">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">Option {index + 1}</span>
        <div className="p-1.5 bg-blue-500/10 rounded group-hover:bg-blue-500/20 transition-colors">
          <Zap className="w-3 h-3 text-blue-400" />
        </div>
      </div>
      <h4 className="text-base font-bold text-white mb-1.5 leading-tight">{scenario.title}</h4>
      <p className="text-xs text-slate-400 line-clamp-2">{scenario.description}</p>
    </div>

    <div className="p-4 flex-1 space-y-4 bg-[#1e293b]/20">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[9px] uppercase font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" /> Upside
          </p>
          <ul className="text-[11px] text-slate-300 space-y-1.5">
            {(scenario.pros || scenario.upsides || []).map((u, i) => (
              <li key={i} className="flex gap-2 leading-tight items-start">
                <span className="text-emerald-500/50">•</span>{u}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-[9px] uppercase font-bold text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> Risk
          </p>
          <ul className="text-[11px] text-slate-300 space-y-1.5">
            {(scenario.cons || scenario.risks || []).map((r, i) => (
              <li key={i} className="flex gap-2 leading-tight items-start">
                <span className="text-rose-500/50">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
      <PlayCircle className="w-4 h-4" /> Simulate Execution
    </button>
  </div>
);

/** Dynamic scenario comparison: table of parameters × options. Uses scenarioComparisonTitle and comparisonParamOrder from parsedData when provided. */
const ScenarioComparison = ({ scenarios, comparisonTitle, comparisonParamOrder }) => {
  const hasParams = scenarios.some((s) => s.parameters && typeof s.parameters === "object" && Object.keys(s.parameters).length > 0);
  const paramOrder = Array.isArray(comparisonParamOrder) && comparisonParamOrder.length > 0
    ? comparisonParamOrder
    : (scenarios[0]?.parameters && typeof scenarios[0].parameters === "object")
      ? Object.keys(scenarios[0].parameters)
      : [];
  if (!hasParams || paramOrder.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-slate-900/30">
        <p className="text-xs text-slate-500">
          Comparison of the most relevant recommendations
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-2.5 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-900/50">Parameter</th>
              {scenarios.map((s, idx) => (
                <th key={idx} className="py-2.5 px-3 text-xs font-bold text-white bg-slate-900/30 min-w-[140px]">
                  <span className="text-blue-400">Option {idx + 1}</span>
                  <div className="text-[11px] font-normal text-slate-400 mt-0.5 line-clamp-2">{s.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-white/5">
            {paramOrder.map((paramKey) => (
              <tr key={paramKey} className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 font-medium text-slate-400 capitalize">
                  {paramKey.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                </td>
                {scenarios.map((s, idx) => (
                  <td key={idx} className="py-2 px-3">
                    {s.parameters && s.parameters[paramKey] != null ? String(s.parameters[paramKey]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-white/5 bg-slate-900/20 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {scenarios.map((s, idx) => (
          <div key={idx} className="rounded-lg border border-white/5 p-3 bg-slate-900/40">
            <h4 className="text-xs font-bold text-blue-400 mb-1.5">Option {idx + 1}: {s.title}</h4>
            {s.description && <p className="text-xs text-slate-400 mb-2">{s.description}</p>}
            <div className="flex flex-wrap gap-2">
              {(s.pros || []).slice(0, 2).map((pro, i) => (
                <span key={i} className="text-[10px] text-emerald-400/90">↑ {pro}</span>
              ))}
              {(s.cons || []).slice(0, 2).map((con, i) => (
                <span key={i} className="text-[10px] text-rose-400/90">↓ {con}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VisualCanvas = ({ parsedData, isThinking }) => {
  if (isThinking && !parsedData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 bg-slate-950/50">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-300 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold uppercase tracking-[0.2em] text-xs">Strategy Engine Core</p>
          <p className="text-slate-500 text-sm italic">Analyzing elasticity curves and competitor pricing...</p>
        </div>
      </div>
    );
  }

  const defaultKpis = [
    { label: "Projected Net Revenue Lift", value: parsedData?.impact?.revLift ?? "—", trend: "up", calculationLogic: "Revenue lift = (New ARPU × retained subs) − (Current ARPU × current subs); churn applied by segment." },
    { label: "Projected Revenue Growth", value: parsedData?.impact?.growth ?? "—", trend: "up", calculationLogic: "Growth % = (New revenue − Current revenue) / Current revenue × 100." },
    { label: "Projected Net Subscriber Loss", value: parsedData?.impact?.subLoss ?? "—", trend: "down", calculationLogic: "Sub loss = Σ (segment size × projected churn %) across all segments." },
    { label: "New Blended ARPU", value: parsedData?.impact?.newArpu ?? "—", trend: "up", calculationLogic: "Blended ARPU = Total revenue after change / Total retained subscribers." },
  ];
  const kpis = Array.isArray(parsedData?.kpis) && parsedData.kpis.length > 0 ? parsedData.kpis : defaultKpis;

  return (
    <div className="max-w-7xl mx-auto p-5 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 relative">
      <StrategicBriefing data={parsedData} />
      <AnalysisRationale rationale={parsedData?.rationale} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => {
          const isUp = kpi.trend === 'up';
          const isDown = kpi.trend === 'down';
          return (
            <ImpactCard 
              key={idx}
              icon={isDown ? TrendingDown : TrendingUp} 
              label={kpi.label} 
              value={kpi.value} 
              calculationLogic={kpi.calculationLogic}
              colorClass={
                isDown ? { bg: 'bg-rose-500/10', text: 'text-rose-400' } :
                { bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
              } 
            />
          );
        })}
      </div>

      <RecommendationsList recommendations={parsedData?.recommendations} />

      {Array.isArray(parsedData?.packageTableData) && parsedData.packageTableData.length > 0 && (
        <>
          <ChurnModelPackageTable data={parsedData} />
          <ChurnModelTable data={parsedData} title="Price Increase & Churn Model — Impact by Segment" rowKey="segment" dataKey="tableData" />
        </>
      )}

      {Array.isArray(parsedData?.tables) && parsedData.tables.length > 0 && parsedData.tables
        .filter((t) => t && (t.title || (Array.isArray(t.columns) && t.columns.length > 0)))
        .map((t, idx) => (
          <DynamicTable
            key={idx}
            title={t.title || "Data"}
            columns={Array.isArray(t.columns) ? t.columns : []}
            rows={Array.isArray(t.rows) ? t.rows : []}
          />
        ))}

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5"></div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
              {parsedData?.scenarioComparisonTitle || "Scenario comparison"}
            </h3>
          </div>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>

        {(() => {
          const scenarios = Array.isArray(parsedData?.scenarios) && parsedData.scenarios.length > 0
            ? parsedData.scenarios
            : [
                {
                  title: "No scenario comparison in this response",
                  description: "The analysis did not include scenario options. Ask for a comparison of strategic options, or for price increase / competitive scenarios, to see options here.",
                  pros: [],
                  cons: [],
                  parameters: {}
                }
              ];
          const useComparisonTable = scenarios.some((s) => s.parameters && typeof s.parameters === "object" && Object.keys(s.parameters).length > 0);
          if (useComparisonTable) {
            return (
              <ScenarioComparison
                scenarios={scenarios}
                comparisonTitle={parsedData?.scenarioComparisonTitle}
                comparisonParamOrder={parsedData?.comparisonParamOrder}
              />
            );
          }
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {scenarios.map((s, idx) => (
                <ScenarioCard key={idx} scenario={s} index={idx} />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// --- Main Page Component ---

/** Remove trailing commas before ] or } only when outside string literals (so we don't corrupt content inside strings). */
function safeRemoveTrailingCommas(str) {
  let out = "";
  let i = 0;
  let inString = false;
  let escape = false;
  while (i < str.length) {
    const c = str[i];
    if (escape) {
      out += c;
      escape = false;
      i++;
      continue;
    }
    if (inString) {
      if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      out += c;
      i++;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      i++;
      continue;
    }
    if (c === "]" || c === "}") {
      let trim = out.length;
      while (trim > 0 && /[\s\n\r\t]/.test(out[trim - 1])) trim--;
      if (trim > 0 && out[trim - 1] === ",") {
        out = out.slice(0, trim - 1);
      }
    }
    out += c;
    i++;
  }
  return out;
}

/** Try to parse assistant message content as JSON for the canvas. Handles markdown-wrapped, prose-wrapped, and slightly malformed JSON. */
function parseAssistantContent(content) {
  if (content == null) return null;
  if (typeof content === "object" && !Array.isArray(content) && content !== null) {
    return content.chatResponse !== undefined || content.recommendations || content.executiveSummary ? content : null;
  }
  if (typeof content !== "string") return null;
  let raw = content.trim();
  if (!raw) return null;
  raw = raw.replace(/^\uFEFF/, "").trim();
  raw = raw.replace(/^\uFEFF/, "").trim();

  const tryParse = (str) => {
    if (str == null || typeof str !== "string") return null;
    try {
      return JSON.parse(str);
    } catch (_) {
      return null;
    }
  };

  // 1. Try jsonrepair on full content first (handles prose + JSON and truncated output)
  try {
    const repaired = jsonrepair(raw);
    const result = typeof repaired === "string" ? tryParse(repaired) : repaired;
    if (result && typeof result === "object" && (result.chatResponse !== undefined || result.recommendations || result.executiveSummary)) return result;
  } catch (_) {}

  // 2. Same normalization as Layout's cleanLLMResponse
  let normalized = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```\s*$/, "").trim();
  if (normalized.startsWith("['json'") || normalized.startsWith('["json"')) {
    const firstB = normalized.indexOf('{');
    const lastB = normalized.lastIndexOf('}');
    if (firstB !== -1 && lastB !== -1) normalized = normalized.substring(firstB, lastB + 1).replace(/\\"/g, '"');
  }
  let extracted = normalized;
  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    // Prefer balanced-brace extraction so we don't cut at a } inside a string
    extracted = extractBalancedJson(normalized, firstBrace);
    if (!extracted) extracted = normalized.substring(firstBrace, lastBrace + 1);
  }

  let result = tryParse(extracted);
  if (result) return result;
  result = tryParse(safeRemoveTrailingCommas(extracted));
  if (result) return result;
  try {
    result = JSON.parse(jsonrepair(extracted));
    if (result) return result;
  } catch (_) {}
  try {
    result = JSON.parse(jsonrepair(safeRemoveTrailingCommas(extracted)));
    if (result) return result;
  } catch (_) {}
  try {
    result = tryParse(safeRemoveTrailingCommas(jsonrepair(extracted)));
    if (result) return result;
  } catch (_) {}
  // Last resort: jsonrepair on normalized (before brace extraction)
  try {
    result = JSON.parse(jsonrepair(normalized));
    if (result) return result;
  } catch (_) {}

  return getFallbackStrategyResponse(raw.length > 0 ? raw : "");
}

/** Extract the JSON object starting at startIndex by matching braces (ignoring braces inside strings). */
function extractBalancedJson(str, startIndex) {
  if (str[startIndex] !== '{') return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  let quote = null;
  for (let i = startIndex; i < str.length; i++) {
    const c = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === '\\') escape = true;
      else if (c === quote) inString = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      quote = c;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return str.substring(startIndex, i + 1);
    }
  }
  return null;
}

const HomeContent = () => {
  const { messages, isLoading, setChatInputValue, canvasTitle, expandedTurnIndex, setExpandedTurnIndex } = useChatContext();

  const turns = useMemo(() => {
    const result = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        result.push({ query: msg.content, userMsg: msg, assistantMsgs: [] });
      } else if (msg.role === "assistant" && result.length > 0) {
        result[result.length - 1].assistantMsgs.push(msg);
      }
    }
    return result;
  }, [messages]);

  const turnParsedData = useMemo(() => {
    return turns.map((turn) => {
      const lastAssistant = turn.assistantMsgs.length > 0 ? turn.assistantMsgs[turn.assistantMsgs.length - 1] : null;
      return lastAssistant ? parseAssistantContent(lastAssistant.content) : null;
    });
  }, [turns]);

  const showSuggestedPrompts = turns.length === 0 && !canvasTitle;

  const handlePrompt = (q) => {
    setChatInputValue(q);
    setTimeout(() => document.querySelector('textarea')?.focus(), 0);
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-[#0f172a] h-full scrollbar-thin scrollbar-thumb-slate-800">
      <div className="absolute inset-0 overflow-y-auto">
        {showSuggestedPrompts ? (
          <div className="min-h-full flex flex-col items-center pt-8 pb-8 px-8 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[10s]" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8s]" />
            <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
              <h1 className="text-7xl font-bold tracking-tight mb-8" style={{ color: "#00A8E0" }}>Marketing Strategy Agent</h1>
              <SuggestedPrompts onSelect={handlePrompt} />
            </div>
          </div>
        ) : turns.length === 0 ? (
          <div className="min-h-full flex flex-col items-center justify-center p-8">
            <div className="relative z-10 w-full max-w-5xl mx-auto">
              {(canvasTitle || "Strategy") && (
                <h1 className="text-2xl font-bold tracking-tight text-center mb-6" style={{ color: "#00A8E0" }}>
                  {canvasTitle || "Strategy"}
                </h1>
              )}
              <SuggestedPrompts onSelect={handlePrompt} />
            </div>
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/5 px-5 py-4 mb-3">
              <h1 className="text-2xl font-bold tracking-tight text-center" style={{ color: "#00A8E0" }}>
                {canvasTitle || "Strategy"}
              </h1>
            </div>
            <div className="max-w-7xl mx-auto px-5 pb-5 space-y-2">
              {turns.map((turn, turnIndex) => {
                const isExpanded = expandedTurnIndex === turnIndex;
                const label = typeof turn.query === "string" && turn.query.trim()
                  ? (turn.query.trim().length > 56 ? turn.query.trim().slice(0, 56) + "…" : turn.query.trim())
                  : "Query";
                const parsedData = turnParsedData[turnIndex];
                const hasAssistant = turn.assistantMsgs.length > 0;
                const isWaiting = turnIndex === turns.length - 1 && !hasAssistant && isLoading;
                const parseFailed = hasAssistant && !parsedData;
                return (
                  <Collapsible
                    key={turnIndex}
                    open={isExpanded}
                    onOpenChange={(open) => {
                      if (open) setExpandedTurnIndex(turnIndex);
                      else setExpandedTurnIndex((prev) => (prev === turnIndex ? null : prev));
                    }}
                  >
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 overflow-hidden">
                      <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-slate-200 truncate flex-1">{label}</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t border-white/10 p-4 pt-3">
                          {isWaiting && (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                              <p className="text-slate-400 text-sm">Marketing Strategy in Action...</p>
                            </div>
                          )}
                          {parseFailed && !isWaiting && (
                            <div className="flex flex-col items-center justify-center py-16 p-8 text-center">
                              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                              <p className="text-slate-400 text-sm">This response could not be parsed as strategy data. View the reply in the chat.</p>
                            </div>
                          )}
                          {parsedData && !isWaiting && (
                            <VisualCanvas parsedData={parsedData} isThinking={false} />
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return <HomeContent />;
}