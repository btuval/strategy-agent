import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper to generate random customer data
function generateCustomer(index, isSatellite) {
  const customerId = `CUS${String(index).padStart(8, '0')}`;
  const activationDate = new Date(2020, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1);
  const tenureMonths = Math.floor((new Date() - activationDate) / (1000 * 60 * 60 * 24 * 30));
  
  const states = ['CA', 'TX', 'FL', 'NY', 'GA', 'IL', 'PA', 'OH', 'NC', 'MI'];
  const dmas = ['Los Angeles', 'New York', 'Chicago', 'Atlanta', 'Miami', 'Dallas', 'Houston', 'Phoenix', 'Philadelphia', 'Detroit'];
  const plans = ['Basic', 'Standard', 'Premium', 'Ultimate'];
  
  const state = states[Math.floor(Math.random() * states.length)];
  const dma = dmas[Math.floor(Math.random() * dmas.length)];
  const planTier = plans[Math.floor(Math.random() * plans.length)];
  
  const basePrices = { Basic: 65, Standard: 95, Premium: 125, Ultimate: 155 };
  const basePrice = basePrices[planTier];
  const billAmount = basePrice + Math.random() * 30;
  const monthlyDiscount = Math.random() < 0.3 ? Math.random() * 20 : 0;
  
  const primaryHardware = isSatellite 
    ? 'Satellite Dish & DVR'
    : ['Proprietary Streaming Box', 'BYOD (Smart TV / Apple TV / Roku)', 'Mobile App Only'][Math.floor(Math.random() * 3)];
  
  const clv = billAmount * tenureMonths * (1 - Math.random() * 0.3);
  const failedPayments = Math.floor(Math.random() * 3);
  const inCollection = failedPayments > 1 && Math.random() < 0.15;
  const autopay = Math.random() < 0.65;
  
  const hasSvod = Math.random() < 0.4;
  const svodOptions = ['Max', 'Paramount+', 'Showtime', 'Starz'];
  const svodServices = hasSvod ? svodOptions.filter(() => Math.random() < 0.5) : [];
  
  const monthlyWatchHours = 40 + Math.random() * 120;
  const repeatedCalls = Math.floor(Math.random() * 8);
  
  const promoStatuses = ['active', 'rolling_off_soon', 'expired', 'none'];
  const promoStatus = promoStatuses[Math.floor(Math.random() * promoStatuses.length)];
  
  const competitionIntensity = 1 + Math.floor(Math.random() * 5);
  
  // Calculate churn score
  let churnScore = 0;
  churnScore += failedPayments * 15;
  churnScore += inCollection ? 20 : 0;
  churnScore += autopay ? -10 : 5;
  churnScore += repeatedCalls * 3;
  churnScore += promoStatus === 'rolling_off_soon' ? 15 : 0;
  churnScore += competitionIntensity * 5;
  churnScore += tenureMonths < 6 ? 20 : 0;
  churnScore += monthlyWatchHours < 60 ? 10 : -5;
  churnScore = Math.max(0, Math.min(100, churnScore + Math.random() * 20));
  
  const churnRisk = churnScore > 70 ? 'Critical' : churnScore > 50 ? 'High' : churnScore > 30 ? 'Medium' : 'Low';
  
  const recommendations = [
    'Offer $10 loyalty credit',
    'Upgrade to Premium tier promotion',
    'Add SVOD bundle discount',
    'Retention call campaign',
    'Do not engage - negative CLV',
    'Autopay enrollment incentive'
  ];
  const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
  
  return {
    customer_id: customerId,
    activation_date: activationDate.toISOString().split('T')[0],
    tenure_months: tenureMonths,
    primary_hardware: primaryHardware,
    state,
    dma,
    plan_tier: planTier,
    bill_amount: Math.round(billAmount * 100) / 100,
    monthly_discount_amount: Math.round(monthlyDiscount * 100) / 100,
    clv: Math.round(clv),
    failed_payments: failedPayments,
    in_collection: inCollection,
    autopay,
    has_svod: hasSvod,
    svod_services: svodServices,
    monthly_watch_hours: Math.round(monthlyWatchHours),
    repeated_calls: repeatedCalls,
    promo_status: promoStatus,
    competition_intensity: competitionIntensity,
    churn_score: Math.round(churnScore),
    churn_risk: churnRisk,
    recommendation
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    const { targetCount = 2000000, batchSize = 1000 } = await req.json().catch(() => ({}));
    
    // Count existing customers
    const existingCustomers = await base44.asServiceRole.entities.Customer.list();
    const currentCount = existingCustomers.length;
    
    if (currentCount >= targetCount) {
      return Response.json({ 
        message: 'Customer data already at target',
        currentCount,
        targetCount
      });
    }
    
    const needed = targetCount - currentCount;
    const satelliteNeeded = Math.floor(needed * 0.6); // 60% satellite
    const streamNeeded = needed - satelliteNeeded; // 40% stream
    
    let created = 0;
    let batch = [];
    
    // Generate satellite customers
    for (let i = 0; i < satelliteNeeded; i++) {
      batch.push(generateCustomer(currentCount + created, true));
      created++;
      
      if (batch.length >= batchSize) {
        await base44.asServiceRole.entities.Customer.bulkCreate(batch);
        batch = [];
      }
    }
    
    // Generate stream customers
    for (let i = 0; i < streamNeeded; i++) {
      batch.push(generateCustomer(currentCount + created, false));
      created++;
      
      if (batch.length >= batchSize) {
        await base44.asServiceRole.entities.Customer.bulkCreate(batch);
        batch = [];
      }
    }
    
    // Insert remaining
    if (batch.length > 0) {
      await base44.asServiceRole.entities.Customer.bulkCreate(batch);
    }
    
    return Response.json({ 
      success: true,
      generated: created,
      totalCustomers: currentCount + created,
      satelliteCount: Math.floor((currentCount + created) * 0.6),
      streamCount: Math.floor((currentCount + created) * 0.4)
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});