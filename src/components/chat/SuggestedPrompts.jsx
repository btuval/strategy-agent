import { TrendingUp, ShieldAlert, PackagePlus, Swords, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const prompts = [
  {
    icon: TrendingUp,
    title: "Price Increase Strategy",
    subtitle: "5% revenue uplift across all plan tiers",
    prompt: "Build a price increase strategy to achieve a 5% revenue increase. Distribute across all plan tiers, model projected churn by segment.",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: PackagePlus,
    title: "New Package Design",
    subtitle: "Sports + streaming bundle opportunity",
    prompt: "Design a new package bundle that combines live sports content with streaming services. Analyze which customer segments would be most receptive and project the revenue impact.",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Swords,
    title: "Competitive Response",
    subtitle: "React to competitor's new offer",
    prompt: "YouTube TV just launched a new national sports package 'Sports Plus'. I need you to generate detailed comparison with our existing packages.",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: ShieldAlert,
    title: "Churn Risk Analysis",
    subtitle: "High-risk segment deep dive",
    prompt: "Analyze the churn risk segments by tenure, package tier, competition intensity, and payment history.",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    icon: BarChart3,
    title: "ARPU Optimization",
    subtitle: "Revenue per user improvement plan",
    prompt: "Analyze current ARPU across all segments and identify opportunities to increase it. Consider upsell potential, add-on adoption rates, and SVOD attachment strategies.",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

export { prompts };
export default function SuggestedPrompts({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {prompts.map((p, i) => (
        <button
          key={i}
          onClick={() => onSelect(p.prompt)}
          className="text-left p-5 rounded-xl border border-white/10 bg-[#1e293b] transition-all duration-200 shadow-sm hover:scale-[1.02] hover:shadow-lg hover:border-white/20"
        >
          <p.icon className={cn("w-6 h-6 mb-3", p.iconColor)} />
          <p className="text-sm font-semibold text-white mb-1">{p.title}</p>
          <p className="text-xs text-slate-300">{p.subtitle}</p>
        </button>
      ))}
    </div>
  );
}