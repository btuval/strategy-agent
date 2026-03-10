import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { requiredCount = 100000 } = await req.json().catch(() => ({}));
    
    // Count existing customers
    const existingCustomers = await base44.asServiceRole.entities.Customer.list();
    const currentCount = existingCustomers.length;
    const maxCustomers = 2000000;
    
    if (currentCount >= requiredCount) {
      return Response.json({ 
        message: 'Sufficient customer data exists',
        currentCount,
        requiredCount
      });
    }
    
    // Calculate how many more we can add
    const needed = Math.min(requiredCount - currentCount, maxCustomers - currentCount);
    
    if (needed <= 0) {
      return Response.json({ 
        message: 'At maximum customer limit',
        currentCount,
        maxCustomers
      });
    }
    
    // Call the generate function to add more customers
    const generateResponse = await base44.asServiceRole.functions.invoke('generateCustomerData', {
      targetCount: currentCount + needed,
      batchSize: 1000
    });
    
    return Response.json({
      success: true,
      enriched: true,
      ...generateResponse.data
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});