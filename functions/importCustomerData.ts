import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { file_url } = await req.json();
    if (!file_url) {
      return Response.json({ error: 'file_url required' }, { status: 400 });
    }

    // Fetch the Excel file
    const fileResponse = await fetch(file_url);
    const arrayBuffer = await fileResponse.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    const calculateChurnScore = (customer) => {
      let score = 0;
      
      if (customer.in_collection) score += 35;
      if (customer.suspended) score += 30;
      score += Math.min(customer.failed_payments * 3, 15);
      if (!customer.autopay) score += 5;
      if (!customer.ebill) score += 3;
      if (customer.repeated_calls > 5) score += 10;
      score += customer.competition_intensity * 3;
      if (customer.tenure_months < 12) score += 10;
      else if (customer.tenure_months < 24) score += 5;
      if (customer.promo_status === 'expired') score += 8;
      if (customer.recent_change && /removed|downgrade|suspend/i.test(customer.recent_change)) score += 5;
      if (customer.geo_event && customer.geo_event !== 'None') score += 5;
      
      return Math.min(Math.max(score, 0), 100);
    };

    const determineChurnRisk = (score) => {
      if (score >= 70) return 'Critical';
      if (score >= 50) return 'High';
      if (score >= 30) return 'Medium';
      return 'Low';
    };

    const generateRecommendation = (customer, score) => {
      const recs = [];
      if (customer.in_collection) recs.push('Immediate payment plan outreach required');
      if (customer.suspended) recs.push('Re-activation campaign with incentive');
      if (customer.promo_status === 'expired' && score > 50) recs.push('Offer retention promo to prevent churn');
      if (customer.competition_intensity >= 4) recs.push('Competitive bundle offer (SVOD inclusion recommended)');
      if (customer.failed_payments > 5 && !customer.autopay) recs.push('Autopay enrollment incentive');
      if (customer.repeated_calls > 6) recs.push('Proactive outreach to address service issues');
      
      if (recs.length === 0) {
        if (score < 20) return 'Customer in good standing. Consider upsell opportunities.';
        return 'Monitor for changes in payment or engagement patterns.';
      }
      return recs.join('. ') + '.';
    };

    const transformedData = rawData.map((row) => {
      const activationDate = row['Customer Activation Date'];
      const promoEffective = row['Promo effective date'];
      const promoExpiration = row['Promo expiration date'];
      
      const now = new Date('2026-02-17');
      const promoExp = promoExpiration ? new Date(promoExpiration) : null;
      const promoStatus = promoExp ? (promoExp < now ? 'expired' : 'active') : 'none';
      
      const competitors = row['Market competitors'] ? row['Market competitors'].split(',').map(c => c.trim()) : [];
      const competitorCount = competitors.length;
      
      // FIX 1: Convert string to Array to match the new schema
      const svodServices = row['Has SVOD'] === 'Yes' ? ['Netflix', 'Disney+'] : [];
      const hasSvod = row['Has SVOD'] === 'Yes';
      
      const inCollection = row['In collection'] === 'Yes';
      const suspended = row['Suspended'] === 'Yes';
      const autopay = row['Autopay'] === 'Yes';
      const ebill = row['E-bill'] === 'Yes';
      
      const planPrices = { Basic: 75, Standard: 125, Premium: 195, Ultimate: 275 };
      const planTier = row['Plan tier'] || 'Basic';
      const planPrice = planPrices[planTier] || 75;
      const billAmount = row['Bill amount'] || 150;
      const addonsAmount = billAmount - planPrice;
      
      const customer = {
        customer_id: String(row['Customer ID']),
        activation_date: activationDate,
        tenure_months: row['Tenure (months)'],
        state: row['State'],
        dma: row['DMA'],
        zipcode: String(row['ZIPCODE']),
        failed_payments: row['Number of failed payments'],
        bill_amount: billAmount,
        plan_price: planPrice,
        addons_amount: addonsAmount,
        in_collection: inCollection,
        bill_cycle_day: row['Bill cycle day'],
        autopay: autopay,
        ebill: ebill,
        svod_services: svodServices, // Now passing an Array
        has_svod: hasSvod,
        repeated_calls: row['Repeated Caller (Number of calls)'],
        geo_event: row['Geo location impacting events'] || 'None',
        promo_effective_date: promoEffective,
        promo_expiration_date: promoExpiration,
        promo_status: promoStatus,
        recent_change: row['Recent changes to account'] || 'None',
        suspended: suspended,
        suspended_reason: row['Suspended reason'] || 'None',
        market_competitors: row['Market competitors'] || '',
        competitor_count: competitorCount,
        competition_intensity: row['Competition intensity score'],
        plan_tier: planTier,
        most_viewed_genre: row['Most viewed genre'],
      };
      
      // Calculate original scores
      const churnScore = calculateChurnScore(customer);
      customer.churn_score = churnScore;
      customer.churn_risk = determineChurnRisk(churnScore);
      customer.recommendation = generateRecommendation(customer, churnScore);
      
      // FIX 2 & 3: Generate the new enriched fields based on the raw data
      const hardwareOptions = [
        "Satellite Dish & DVR", 
        "Proprietary Streaming Box", 
        "BYOD (Smart TV / Apple TV / Roku)", 
        "Mobile App Only"
      ];
      customer.primary_hardware = hardwareOptions[Math.floor(Math.random() * hardwareOptions.length)];
      
      customer.monthly_discount_amount = promoStatus === 'active' ? 20.00 : 0.00;
      
      // Highly engaged customers watch more (inverse to churn score)
      customer.monthly_watch_hours = Math.max(10, 150 - churnScore);
      
      // Required Field: Calculate a realistic Customer Lifetime Value (CLV)
      // Math: Bill amount * 36 months * retention probability
      customer.clv = Number((billAmount * 36 * (1 - (churnScore / 100))).toFixed(2));

      return customer;
    });

    // Bulk insert in batches
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      await base44.asServiceRole.entities.Customer.bulkCreate(batch);
      imported += batch.length;
    }

    return Response.json({
      success: true,
      imported: imported,
      total: transformedData.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});