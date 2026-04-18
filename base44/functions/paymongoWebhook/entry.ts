import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();

    console.log('[Webhook] Received request, method:', req.method);
    console.log('[Webhook] Raw body (first 500 chars):', rawBody.slice(0, 500));

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error('[Webhook] Failed to parse JSON body:', e.message);
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // PayMongo webhook payload structure:
    // body.data.attributes.type = event type
    // body.data.attributes.data = the checkout session or payment object
    const eventType = body?.data?.attributes?.type;
    const eventData = body?.data?.attributes?.data;

    console.log('[Webhook] Event type:', eventType);
    console.log('[Webhook] Event data id:', eventData?.id);
    console.log('[Webhook] Event data attributes keys:', Object.keys(eventData?.attributes || {}));

    const isPaid =
      eventType === 'checkout_session.payment.paid' ||
      eventType === 'payment.paid';

    if (!isPaid) {
      console.log('[Webhook] Ignoring event type:', eventType);
      return Response.json({ received: true, ignored: true });
    }

    // For checkout_session.payment.paid: session id is eventData.id
    // For payment.paid: look for checkout_session_id in metadata or attributes
    let sessionId = null;

    if (eventType === 'checkout_session.payment.paid') {
      sessionId = eventData?.id;
    } else if (eventType === 'payment.paid') {
      // payment object may reference checkout session
      sessionId = eventData?.attributes?.checkout_session_id
        || eventData?.attributes?.metadata?.checkout_session_id
        || null;
    }

    const rawMethod = eventData?.attributes?.payment_method_used || '';
    const paymentMethodLabel =
      rawMethod === 'gcash' ? 'GCash'
      : rawMethod === 'paymaya' ? 'Maya'
      : rawMethod === 'grab_pay' ? 'GrabPay'
      : rawMethod === 'qrph' ? 'QRPh'
      : rawMethod === 'card' ? 'Card'
      : rawMethod || 'QRPh';

    console.log('[Webhook] Session ID resolved:', sessionId);
    console.log('[Webhook] Payment method:', rawMethod, '->', paymentMethodLabel);

    if (!sessionId) {
      console.error('[Webhook] Could not resolve session ID from payload. Full eventData:', JSON.stringify(eventData));
      return Response.json({ received: true, warning: 'no session id found' });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ paymongo_session_id: sessionId });
    console.log(`[Webhook] Found ${orders.length} order(s) for session ${sessionId}`);

    for (const order of orders) {
      await base44.asServiceRole.entities.Order.update(order.id, {
        payment_status: 'Paid',
        payment_method: paymentMethodLabel,
        paymongo_payment_method: paymentMethodLabel,
        status: order.status === 'Pending' ? 'Processing' : order.status,
      });
      console.log(`[Webhook] ✅ Updated order ${order.order_number} (${order.id}) → Paid / ${paymentMethodLabel}`);
    }

    return Response.json({ received: true, orders_updated: orders.length });
  } catch (error) {
    console.error('[Webhook] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});