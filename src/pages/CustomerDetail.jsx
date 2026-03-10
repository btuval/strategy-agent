import React from "react";
import { agentClient } from "@/api/agentClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, User, CreditCard, Shield, TrendingUp, 
  Phone, MapPin, Calendar, AlertTriangle, CheckCircle2,
  XCircle, Tv, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalculationTooltip } from "@/components/CalculationTooltip";

const riskColors = {
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  High: "bg-red-500/10 text-red-400 border-red-500/20",
  Critical: "bg-red-600/10 text-red-500 border-red-600/20",
};

function InfoRow({ icon: Icon, label, value, valueClass = "", calculationLogic = undefined }) {
  const row = (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn("text-sm text-slate-200 mt-0.5", valueClass)}>{value || "—"}</p>
      </div>
    </div>
  );
  if (calculationLogic) {
    return <CalculationTooltip calculationLogic={calculationLogic} className="block">{row}</CalculationTooltip>;
  }
  return row;
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
      <h3 className="text-sm font-medium text-slate-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function CustomerDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get("id");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customer-detail", customerId],
    queryFn: () => agentClient.entities.Customer.filter({ id: customerId }),
    enabled: !!customerId,
  });

  const customer = customers[0];

  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">Loading customer details...</div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Customer not found</p>
        <Link to={createPageUrl("Customers")} className="text-blue-400 text-sm mt-2 inline-block hover:underline">
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={createPageUrl("Customers")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-white font-mono">{customer.customer_id}</h1>
            <Badge variant="outline" className={cn("text-xs", riskColors[customer.churn_risk])}>
              {customer.churn_risk} Risk
            </Badge>
            {customer.suspended && (
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                Suspended
              </Badge>
            )}
            {customer.in_collection && (
              <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/20">
                In Collection
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">{customer.dma} • {customer.state} {customer.zipcode}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Churn Score</p>
          <p className="text-2xl font-bold text-white">{customer.churn_score || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Info */}
        <Section title="Account Information">
          <div className="divide-y divide-white/[0.04]">
            <InfoRow icon={Calendar} label="Activation Date" value={customer.activation_date} />
            <InfoRow icon={TrendingUp} label="Tenure" value={`${customer.tenure_months} months`} calculationLogic="Tenure = months since activation date. Used for retention and LTV analysis." />
            <InfoRow icon={Shield} label="Plan Tier" value={customer.plan_tier} />
            <InfoRow icon={CreditCard} label="Bill Amount" value={`$${customer.bill_amount?.toFixed(2)}`} valueClass="text-white font-medium" calculationLogic="Bill Amount = Plan Price + Add-ons. Total recurring monthly charge." />
            <InfoRow icon={Tag} label="Plan Price" value={customer.plan_price ? `$${customer.plan_price.toFixed(2)}` : "—"} />
            <InfoRow icon={Tag} label="Add-ons" value={customer.addons_amount ? `$${customer.addons_amount.toFixed(2)}` : "—"} />
            <InfoRow icon={Calendar} label="Bill Cycle Day" value={`Day ${customer.bill_cycle_day}`} />
          </div>
        </Section>

        {/* Payment & Status */}
        <Section title="Payment & Status">
          <div className="divide-y divide-white/[0.04]">
            <InfoRow icon={AlertTriangle} label="Failed Payments" value={customer.failed_payments} valueClass={customer.failed_payments > 5 ? "text-red-400" : ""} />
            <InfoRow icon={customer.autopay ? CheckCircle2 : XCircle} label="Autopay" value={customer.autopay ? "Enabled" : "Disabled"} valueClass={customer.autopay ? "text-emerald-400" : "text-slate-400"} />
            <InfoRow icon={customer.ebill ? CheckCircle2 : XCircle} label="E-bill" value={customer.ebill ? "Enabled" : "Disabled"} valueClass={customer.ebill ? "text-emerald-400" : "text-slate-400"} />
            <InfoRow icon={Phone} label="Calls (12mo)" value={customer.repeated_calls} />
            <InfoRow icon={MapPin} label="Geo Event" value={customer.geo_event || "None"} valueClass={customer.geo_event && customer.geo_event !== "None" ? "text-amber-400" : ""} />
            {customer.suspended && (
              <InfoRow icon={XCircle} label="Suspended Reason" value={customer.suspended_reason} valueClass="text-red-400" />
            )}
          </div>
        </Section>

        {/* Promo & Content */}
        <Section title="Promotions & Content">
          <div className="divide-y divide-white/[0.04]">
            <InfoRow icon={Tag} label="Promo Status" value={customer.promo_status} valueClass={customer.promo_status === "active" ? "text-emerald-400" : customer.promo_status === "expired" ? "text-red-400" : ""} />
            <InfoRow icon={Calendar} label="Promo Effective" value={customer.promo_effective_date} />
            <InfoRow icon={Calendar} label="Promo Expiration" value={customer.promo_expiration_date} />
            <InfoRow icon={Tv} label="SVOD Services" value={customer.svod_services || "None"} />
            <InfoRow icon={Tv} label="Most Viewed Genre" value={customer.most_viewed_genre} />
            <InfoRow icon={User} label="Recent Change" value={customer.recent_change || "None"} />
          </div>
        </Section>

        {/* Competition */}
        <Section title="Market & Competition">
          <div className="divide-y divide-white/[0.04]">
            <InfoRow icon={MapPin} label="DMA" value={customer.dma} />
            <InfoRow icon={User} label="Competitors" value={customer.market_competitors} />
            <InfoRow icon={TrendingUp} label="Competitor Count" value={customer.competitor_count} />
            <InfoRow icon={AlertTriangle} label="Competition Intensity" value={`${customer.competition_intensity}/5`} valueClass={customer.competition_intensity >= 4 ? "text-red-400" : customer.competition_intensity >= 3 ? "text-amber-400" : ""} calculationLogic="Competition Intensity = 1–5 scale based on competitor count and market density in the customer's DMA." />
          </div>
        </Section>
      </div>

      {/* Recommendation */}
      {customer.recommendation && (
        <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/15 p-5">
          <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> AI Recommendation
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{customer.recommendation}</p>
        </div>
      )}
    </div>
  );
}