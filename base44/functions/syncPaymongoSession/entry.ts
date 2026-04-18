import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Admin utility: given a paymongo_session_id, fetch its status from PayMongo
 * and update matching orders if paid.
 * Usage: invoke with { sessionId: "cs_xxx" } or { orderNumber: "CP-XXX-YYY" }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && user.role !== 'user')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, orderNumber } = await req.json();

    let targetSessionId = sessionId;

    // Look up session ID from order number if provided
    if (!targetSessionId && orderNumber) {
      const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });
      if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
      targetSessionId = orders[0].paymongo_session_id;
    }

    if (!targetSessionId) {
      return Response.json({ error: 'sessionId or orderNumber required' }, { status: 400 });
    }

    // Fetch session from PayMongo
    const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
    const authHeader = 'Basic ' + btoa(secretKey + ':');
    const pmRes = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${targetSessionId}`, {
      headers: { Authorization: authHeader },
    });
    const pmData = await pmRes.json();

    if (!pmRes.ok) {
      console.error('PayMongo error:', JSON.stringify(pmData));
      return Response.json({ error: pmData.errors?.[0]?.detail || 'PayMongo error' }, { status: 400 });
    }

    const attrs = pmData.data?.attributes;
    const pmStatus = attrs?.status; // 'active', 'expired', 'paid'
    const rawMethod = attrs?.payment_method_used || '';
    const paymentMethodLabel = rawMethod === 'gcash' ? 'GCash'
      : rawMethod === 'paymaya' ? 'Maya'
      : rawMethod === 'grab_pay' ? 'GrabPay'
      : rawMethod === 'qrph' ? 'QRPh'
      : rawMethod === 'card' ? 'Card'
      : rawMethod || 'QRPh';

    console.log(`Session ${targetSessionId} status: ${pmStatus}, method: ${rawMethod}`);

    if (pmStatus !== 'paid') {
      return Response.json({ synced: false, session_status: pmStatus, message: 'Session is not paid yet' });
    }

    // Update matching orders
    const orders = await base44.asServiceRole.entities.Order.filter({ paymongo_session_id: targetSessionId });
    for (const order of orders) {
      await base44.asServiceRole.entities.Order.update(order.id, {
        payment_status: 'Paid',
        payment_method: paymentMethodLabel,
        paymongo_payment_method: paymentMethodLabel,
        status: order.status === 'Pending' ? 'Processing' : order.status,
      });
      console.log(`Synced order ${order.order_number} → Paid`);
    }

    return Response.json({ synced: true, orders_updated: orders.length, session_status: pmStatus, payment_method: paymentMethodLabel });
  } catch (error) {
    console.error('syncPaymongoSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});