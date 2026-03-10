import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { CalculationTooltip } from "@/components/CalculationTooltip";

const iconMap = {
  revenue: DollarSign,
  arpu: DollarSign,
  churn: AlertTriangle,
  subscribers: Users,
  impact: TrendingUp
};

export default function KPICard({ title, value, change, trend, icon, calculationLogic }) {
  const Icon = iconMap[icon] || TrendingUp;

  // Detect negative/positive from value string
  const valueStr = String(value);
  const hasNegativeDollar = valueStr.includes('-') && valueStr.includes('$');
  const hasPositiveDollar = valueStr.includes('+') && valueStr.includes('$');

  const isPositive = trend === 'up' || (change && parseFloat(change) > 0) || hasPositiveDollar;
  const isNegative = trend === 'down' || (change && parseFloat(change) < 0) || hasNegativeDollar;

  const content = (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl border border-white/10 p-5 shadow-lg flex flex-col justify-between group hover:border-blue-500/30 transition-all w-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/10 transition-colors">
          <Icon className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-2">{value}</p>
        {change && (
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold flex items-center ${isNegative ? 'text-rose-400' : isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isNegative ? <ArrowDown className="w-3 h-3 mr-0.5" /> : isPositive ? <ArrowUp className="w-3 h-3 mr-0.5" /> : null}
              {change}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">vs prior</span>
          </div>
        )}
      </div>
    </div>
  );

  return calculationLogic ? (
    <CalculationTooltip calculationLogic={calculationLogic} className="block w-full">{content}</CalculationTooltip>
  ) : (
    content
  );
}


