import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const eventType = body?.data?.attributes?.type;
    const sessionData = body?.data?.attributes?.data;

    console.log('[Webhook] Received event type:', eventType);
    console.log('[Webhook] Session ID:', sessionData?.id);
    console.log('[Webhook] Payment method used:', sessionData?.attributes?.payment_method_used);
    console.log('[Webhook] Full body keys:', Object.keys(body?.data?.attributes || {}));

    // Handle both possible event type formats
    if (
      eventType === 'checkout_session.payment.paid' ||
      eventType === 'payment.paid'
    ) {
      const sessionId = sessionData?.id;
      const rawMethod = sessionData?.attributes?.payment_method_used || '';
      const paymentMethodLabel = rawMethod === 'gcash' ? 'GCash'
        : rawMethod === 'paymaya' ? 'Maya'
        : rawMethod === 'grab_pay' ? 'GrabPay'
        : rawMethod === 'qrph' ? 'QRPh'
        : rawMethod === 'card' ? 'Card'
        : rawMethod || 'QRPh';

      if (sessionId) {
        const orders = await base44.asServiceRole.entities.Order.filter({ paymongo_session_id: sessionId });
        console.log(`[Webhook] Found ${orders.length} order(s) for session ${sessionId}`);
        for (const order of orders) {
          const result = await base44.asServiceRole.entities.Order.update(order.id, {
            payment_status: 'Paid',
            payment_method: paymentMethodLabel,
            paymongo_payment_method: paymentMethodLabel,
            status: order.status === 'Pending' ? 'Processing' : order.status,
          });
          console.log(`[Webhook] Updated order ${order.id} (${order.order_number}) → Paid/${paymentMethodLabel}`);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});