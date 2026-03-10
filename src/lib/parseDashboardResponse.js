/**
 * Parses Strategy Agent markdown response into dashboard-ready data:
 * title, summary, KPIs, chart configs (FlexibleChart format), tables, recommendations.
 */

function extractTitleAndSummary(text) {
  let title = '';
  let summary = '';
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      title = h1[1].trim();
      const next = lines[i + 1];
      if (next && next.trim().startsWith('*') && next.trim().endsWith('*')) {
        summary = next.trim().replace(/^\*+|\*+$/g, '').trim();
      }
      break;
    }
  }
  if (!title && lines[0]) title = lines[0].replace(/^#+\s*/, '').trim();
  return { title, summary };
}

function extractKPIs(text) {
  const kpis = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('|') || t.startsWith('#') || t.startsWith('```')) continue;
    const m = t.match(/^[\*\s]*([^:*]+?):\s*(.+)$/);
    if (m) {
      const label = m[1].replace(/\*\*/g, '').trim();
      const rest = m[2].trim();
      const trendMatch = rest.match(/^(.+?)\s*([+-]\d+(?:\.\d+)?%)\s*([▲▼]?)\s*$/);
      let value = rest;
      let change = '';
      let trend = 'neutral';
      if (trendMatch) {
        value = trendMatch[1].trim();
        change = trendMatch[2];
        trend = trendMatch[3] === '▼' || (change.startsWith('-') && change !== '') ? 'down' : 'up';
      }
      if (label.length < 50 && value.length < 80) {
        kpis.push({ label, value, change, trend });
      }
    }
  }
  return kpis.slice(0, 8);
}

function extractChartConfigs(text) {
  const charts = [];
  const blockRegex = /```(?:json|chart)\s*([\s\S]*?)```/gi;
  let match;
  while ((match = blockRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (parsed.chartType && parsed.series && parsed.data) {
          charts.push({
            chartType: parsed.chartType,
            title: parsed.title || 'Chart',
          xAxisKey: parsed.xAxisKey || (parsed.data && parsed.data[0] && typeof parsed.data[0] === 'object' ? Object.keys(parsed.data[0])[0] : 'name'),
            series: parsed.series,
            data: parsed.data,
          });
        }
      }
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name !== undefined && parsed[0].value !== undefined) {
        charts.push({
          chartType: 'bar',
          title: 'Comparison',
          xAxisKey: 'name',
          series: [{ dataKey: 'value', name: 'Value', color: '#6366f1' }],
          data: parsed,
        });
      }
    } catch (_) {}
  }
  return charts;
}

function extractTables(text) {
  const tables = [];
  const lines = text.split('\n');
  let inTable = false;
  let rows = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        rows = [];
      }
      const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.some((c) => /^:?-+:?$/.test(c))) continue;
      rows.push(cells);
    } else {
      if (inTable && rows.length > 0) {
        tables.push(rows);
        rows = [];
      }
      inTable = false;
    }
  }
  if (inTable && rows.length > 0) tables.push(rows);
  return tables;
}

function extractRecommendations(text) {
  const bullets = [];
  const lines = text.split('\n');
  let inSection = false;
  for (const line of lines) {
    const t = line.trim();
    if (/^#+\s*(Recommendations|Suggested Deep Dives|Next Steps)/i.test(t)) {
      inSection = true;
      continue;
    }
    if (inSection && (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('🔘'))) {
      bullets.push(t.replace(/^[-*]\s*|^🔘\s*/, '').trim());
    }
    if (inSection && t.startsWith('#')) break;
  }
  return bullets;
}

export function parseDashboardResponse(responseText) {
  if (!responseText || typeof responseText !== 'string') {
    return { title: '', summary: '', kpis: [], charts: [], tables: [], recommendations: [] };
  }
  return {
    ...extractTitleAndSummary(responseText),
    kpis: extractKPIs(responseText),
    charts: extractChartConfigs(responseText),
    tables: extractTables(responseText),
    recommendations: extractRecommendations(responseText),
  };
}
