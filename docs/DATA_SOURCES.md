# Data That Drives Answers and Calculations

This document lists **all** data sources in the Strategy Agent app. There is **no traditional database** (no Supabase, Prisma, or SQLite). Data comes from **hardcoded constants**, **LLM-generated responses**, and **protocols** the LLM follows when generating answers.

---

## 1. Dashboard fallback data (hardcoded in `src/pages/Dashboard.jsx`)

Used when the dashboard has not yet received an LLM response, or when the parsed response has no KPIs/charts. This is the only “DB-like” static data in the app.

### KPI_TOP (top KPI cards)
```javascript
[
  { label: 'Total Subscribers', value: '2.0M', prev: '1.98M', change: '+1.0%', trend: 'up', icon: Users },
  { label: 'Baseline Revenue', value: '$24.2M', prev: '$23.1M', change: '+4.8%', trend: 'up', icon: DollarSign },
  { label: 'Avg. ARPU', value: '$121', prev: '$117', change: '+3.4%', trend: 'up', icon: TrendingUp },
]
```

### REVENUE_LINE_DATA (Revenue by LOB area chart)
```javascript
[
  { month: 'Jan 25', satellite: 4200, stream: 2800 },
  { month: 'Feb 25', satellite: 4100, stream: 3200 },
  { month: 'Mar 25', satellite: 3980, stream: 3500 },
  { month: 'Apr 25', satellite: 3900, stream: 4100 },
  { month: 'May 25', satellite: 3850, stream: 4400 },
  { month: 'Jun 25', satellite: 3800, stream: 4600 },
]
```

### BURN_REVENUE_DATA (Burn + Revenue bar chart)
```javascript
[
  { month: 'Jan 25', satellite: 14.2, stream: 8.4 },
  { month: 'Feb 25', satellite: 13.8, stream: 9.1 },
  { month: 'Mar 25', satellite: 13.2, stream: 10.2 },
  { month: 'Apr 25', satellite: 12.9, stream: 11.5 },
  { month: 'May 25', satellite: 12.5, stream: 12.8 },
  { month: 'Jun 25', satellite: 12.1, stream: 14.2 },
]
```

### LOB_MIX_DATA (Customer base pie chart)
```javascript
[
  { name: 'Satellite', value: 60, color: '#6366f1' },
  { name: 'Stream', value: 40, color: '#10b981' },
]
```

### ACQUISITION_TREND_DATA (defined but not rendered in current UI)
```javascript
[
  { month: 'Jul', acquired: 7200 }, { month: 'Aug', acquired: 8100 },
  { month: 'Sep', acquired: 9800 }, { month: 'Oct', acquired: 9200 },
  { month: 'Nov', acquired: 9500 }, { month: 'Dec', acquired: 8400 },
]
```

### Default banner text
- **bannerTitle:** `'Strategy Executive Dashboard'` (or from parsed LLM response)
- **bannerSummary:** `'Real-time view across Satellite & Stream LOBs. Ask a question below to update the dashboard.'` (or from parsed LLM response)

### Default recommendations (in Recommendations card when none from LLM)
- Risk: Early churn 8.2% on Ultimate campaign; Fubo TV 4K sports at $79.99 pressuring retention.
- Opportunity: Deploy contract buyout counter-offer in NFL geos; shift 20% CTV to mid-funnel retargeting.

### Default Active Campaigns table (when no tables from LLM)
- Ultimate Stream Acquisition: Live, 35,950 acquired, $158.60 CPA, -18.1% vs pace
- Premium Stream Acquisition: Completed, 52,200 acquired, $86.20 CPA, -13% miss

### Default Campaign Pulse card
- Ultimate Acquired: 35,950, -18.1% vs target
- CPA: $158.60, Target $130
- Early Churn (Ultimate): 8.2%, Target 5.0%

---

## 2. Entity layer (“database”) in `src/api/agentClient.js`

**There is no real database.** The client exposes mock entities that return empty data:

- **Customer.list(sort, limit)** → `Promise.resolve([])`
- **Customer.filter(query, sort, limit)** → `Promise.resolve([])`

So **Customers** and **CustomerDetail** pages currently show no rows; they are wired to this mock. Any real customer data would need to be added by implementing these functions against a real API or DB.

---

## 3. Data the LLM uses to drive answers (`src/api/dataCreationProtocols.js`)

The LLM does **not** read from a DB. It is given **protocols** that describe how to generate realistic data when the user asks about something that “doesn’t exist in the database.” So the “data” that drives answers is:

- **Rules and benchmarks** in the protocols (e.g. ARPU ranges, churn %, competitor names, plan tiers).
- **Generated content** produced by the LLM per conversation (KPIs, charts, tables, recommendations).

### Key context embedded in the protocols (used as “global” assumptions)

- **Customer base:** ~2M subscribers across US states and DMAs.
- **Plan tiers:** Basic ($75/mo), Standard ($125/mo), Premium ($195/mo), Ultimate ($275/mo).
- **Churn:** Current annual churn 13% (±3% is critical).
- **Operations:** 15% in collections, 5% suspended; 50% autopay, 50% e-bill, 50% SVOD attach.
- **Competition:** Intensity 1–5 by market.

### Protocol “entity” types the LLM can generate (no actual DB tables)

1. **AudienceSegment** – segments, ARPU/churn/CAC benchmarks, size_in_millions.
2. **CompetitorBenchmark** – e.g. Netflix, YouTube TV, Hulu, Charter, Comcast, Dish/Sling, Fubo, Paramount+, Max, Disney+; market share, YoY growth, pricing.
3. **Campaign** – budget, CPA, conversion, ROI, ai_generated_strategy.
4. **CompetitorOffer** – offer types, promotional pricing, arr_at_risk, recommended_counter_play.
5. **Customer** – churn_risk, CLV, bill_amount, plan_tier, state/DMA, etc. (Protocol 5).
6. **ExecutiveKPI** – 5–10 KPIs with variance_pct, status (Critical / Warning / On Track / Overperforming).
7. **MarketData** – broadband_penetration, competitive_intensity, strategic posture by geography.
8. **PriceHistory** – past price changes, churn_spike, recovery months.
9. **StrategicRoadmap** – Q1–Q4 2026 initiatives, budget ranges.
10. **StrategyAnalysis** – recommendations, metrics, action_plan, analysis_type, confidence, priority.

All of this is **generated in the LLM response** when the user asks; it is not stored in a database.

---

## 4. Dashboard data from the LLM (`src/lib/parseDashboardResponse.js`)

When the user asks a question on the Dashboard, the app calls the LLM and then parses the **markdown** response into:

- **title** – from first `# ...` heading.
- **summary** – from the line after the title (italic).
- **kpis** – from lines like `* Label: value +1.2% ▲` (up to 8).
- **charts** – from ` ```json` or ` ```chart` blocks with `chartType`, `series`, `data` (and optional `xAxisKey`, `title`).
- **tables** – from markdown tables (`| ... |`).
- **recommendations** – from “Recommendations” / “Suggested Deep Dives” / “Next Steps” sections (bullets).

So **all dashboard numbers and charts** after a query come from this parsed LLM output, not from a DB. The hardcoded data in section 1 is only used as **fallback** when there is no or insufficient parsed data.

---

## 5. System prompt (`src/api/strategyAgentDefinition.js`)

The system prompt adds:

- **Security/guardrails** – read-only, no modifying customer/billing data.
- **Professional conduct** – tone, no recommending competitors, no role-play.
- **Executive response format** – Executive Summary, Impact (Execute vs. Not Execute), Recommended Approaches with deep dives and charts/tables.
- **Chart format** – JSON shape for bar/line/area/pie so the Dashboard can render them.

So the **structure** of answers and the **chart/title/summary/KPI/table/recommendation** shapes are defined here and in `parseDashboardResponse.js`; the **values** come from the LLM (and from the protocols when the LLM generates “missing” data).

---

## Summary table

| Source | Location | What it drives |
|--------|----------|----------------|
| Hardcoded KPIs, charts, tables, banner, recommendations | `src/pages/Dashboard.jsx` | Dashboard when no/insufficient LLM response |
| Mock Customer list/filter (empty) | `src/api/agentClient.js` | Customers & CustomerDetail pages (empty list) |
| Data creation protocols + key context | `src/api/dataCreationProtocols.js` | LLM-generated “data” and benchmarks in answers |
| System prompt + response format | `src/api/strategyAgentDefinition.js` | Structure and format of all LLM answers |
| Parsed LLM markdown | `src/lib/parseDashboardResponse.js` | Dashboard title, summary, KPIs, charts, tables, recommendations after each query |

**Bottom line:** The only persistent “data” in the app is the **hardcoded Dashboard fallback** in `Dashboard.jsx`. Everything else is either **empty** (Customer entity) or **generated by the LLM** using the protocols and system prompt, then parsed for the Dashboard or shown as markdown on Home.
