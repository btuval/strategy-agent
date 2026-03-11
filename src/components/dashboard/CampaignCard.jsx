import React, { useState } from "react";
import { ChevronDown, TrendingDown, TrendingUp, Target, DollarSign, Users, AlertTriangle, BookOpen, Zap, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const StatusBadge = ({ status }) => {
  const styles = {
    Live: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Completed: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    Missed: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${styles[status] || styles.Live}`}>
      {status}
    </span>
  );
};

const KPIStat = ({ label, value, target, variance, isPositiveGood = true }) => {
  const varNum = parseFloat(variance);
  const isBad = isPositiveGood ? varNum < 0 : varNum > 0;
  return (
    <div className="bg-[#0f172a]/70 rounded-xl p-4 border border-white/5">
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center gap-2">
        <p className="text-[10px] text-slate-500">Target: {target}</p>
        {variance && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isBad ? 'text-red-400' : 'text-emerald-400'}`}>
            {isBad ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {variance}
          </span>
        )}
      </div>
    </div>
  );
};

export default function CampaignCard({ campaign }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!campaign) return null;

  const {
    name, status, period, plan, targetCustomers, revenueTarget, revenueActual,
    customersActual, variancePct, cpa, cpTarget, conversionRate, conversionTarget,
    earlyChurn, churnTarget, monthlyTrend, rootCauses, lessons, competitiveHeadwinds,
    recoveryActions, crossCampaignInsights
  } = campaign;

  const missColor = variancePct < 0 ? "#ef4444" : "#10b981";

  // Revenue comparison data for bar chart
  const revenueData = [
    { name: "Target", value: revenueTarget, fill: "#3b82f6" },
    { name: "Achieved", value: revenueActual, fill: missColor },
    { name: "Shortfall", value: Math.abs(revenueTarget - revenueActual), fill: "#475569" },
  ];

  // Monthly trend with target line
  const trendData = monthlyTrend || [];

  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {/* ── Header (always visible, clickable) ── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer hover:bg-white/[0.02] transition-all"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BarChart2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h3 className="text-base font-bold text-white">{name}</h3>
                <StatusBadge status={status} />
                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{period}</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{plan}</p>

              {/* Headline metrics row */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-300">
                    <span className="font-bold text-white">{customersActual?.toLocaleString()}</span>
                    <span className="text-slate-500"> / {targetCustomers?.toLocaleString()} target</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-300">
                    <span className="font-bold text-white">${(revenueActual / 1_000_000).toFixed(1)}M</span>
                    <span className="text-slate-500"> / ${(revenueTarget / 1_000_000).toFixed(2)}M target</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${variancePct < 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {variancePct > 0 ? "+" : ""}{variancePct}% vs. target
                  </span>
                </div>
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 mt-1 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* ── Expanded Detail Panel ── */}
      {isExpanded && (
        <div className="border-t border-white/10 px-6 pb-6 pt-5 space-y-8">

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <KPIStat label="Customers Acquired" value={customersActual?.toLocaleString()} target={targetCustomers?.toLocaleString()} variance={`${variancePct}%`} />
            <KPIStat label="Revenue" value={`$${(revenueActual / 1_000_000).toFixed(1)}M`} target={`$${(revenueTarget / 1_000_000).toFixed(2)}M`} variance={`${variancePct}%`} />
            <KPIStat label="Cost Per Acquisition" value={`$${cpa}`} target={`$${cpTarget}`} variance={`+$${(cpa - cpTarget).toFixed(2)}`} isPositiveGood={false} />
            <KPIStat label="Conversion Rate" value={`${conversionRate}%`} target={`${conversionTarget}%`} variance={`${(conversionRate - conversionTarget).toFixed(1)}pp`} />
            <KPIStat label="Early Churn (New Cohort)" value={`${earlyChurn}%`} target={`${churnTarget}%`} variance={`+${(earlyChurn - churnTarget).toFixed(1)}pp`} isPositiveGood={false} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Acquisition Trend — Line Chart */}
            {trendData.length > 0 && (
              <div className="bg-[#0f172a]/60 rounded-xl border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Monthly Acquisition vs. Target</h4>
                </div>
                <div className="flex items-center gap-5 mb-4">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-500 rounded" /><span className="text-xs text-slate-400">Acquired</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-amber-400 rounded" style={{ borderTop: "2px dashed #f59e0b", background: "none" }} /><span className="text-xs text-slate-400">Monthly Target</span></div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                        formatter={(v, n) => [v?.toLocaleString(), n === "value" ? "Acquired" : "Target"]}
                      />
                      <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} name="target" />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="value" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Revenue Gap Bar */}
            <div className="bg-[#0f172a]/60 rounded-xl border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Revenue: Target vs. Achieved vs. Shortfall</h4>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(Number(v)/1_000_000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                      formatter={(v) => [`$${(Number(v) / 1_000_000).toFixed(2)}M`]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={55}>
                      {revenueData.map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3">
                {revenueData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
                    <span className="text-xs text-slate-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Root Causes */}
          {rootCauses && rootCauses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Root Cause Analysis</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rootCauses.map((rc, i) => (
                  <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-400 mb-1.5">{rc.title}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{rc.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Headwinds */}
          {competitiveHeadwinds && competitiveHeadwinds.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Competitive Headwinds</h4>
              </div>
              <div className="space-y-2">
                {competitiveHeadwinds.map((c, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-red-400">{c.competitor}: </span>
                      <span className="text-xs text-slate-300">{c.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Learned OR Recovery Actions */}
          {(lessons || recoveryActions) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lessons ? "Lessons Learned" : "Recovery Actions"}
                </h4>
              </div>
              <div className="space-y-2">
                {(lessons || recoveryActions).map((item, i) => (
                  <div key={i} className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-purple-400 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-Campaign Intelligence */}
          {crossCampaignInsights && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔗</span>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Cross-Campaign Intelligence</h4>
              </div>
              <div className="prose prose-invert prose-sm max-w-none [&_p]:text-slate-300 [&_strong]:text-blue-400 [&_li]:text-slate-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{crossCampaignInsights}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}