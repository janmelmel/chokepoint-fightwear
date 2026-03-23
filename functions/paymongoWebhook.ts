import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const eventType = body?.data?.attributes?.type;
    const sessionData = body?.data?.attributes?.data;

    console.log('PayMongo webhook event:', eventType);

    if (eventType === 'checkout_session.payment.paid') {
      const sessionId = sessionData?.id;
      const paymentMethod = sessionData?.attributes?.payment_method_used || 'Card';
      const paymentMethodLabel = paymentMethod === 'gcash' ? 'GCash'
        : paymentMethod === 'paymaya' ? 'Maya'
        : paymentMethod === 'grab_pay' ? 'GrabPay'
        : 'Card';

      if (sessionId) {
        // Find orders with this session ID and update them
        const orders = await base44.asServiceRole.entities.Order.filter({ paymongo_session_id: sessionId });
        for (const order of orders) {
          await base44.asServiceRole.entities.Order.update(order.id, {
            payment_status: 'Paid',
            payment_method: paymentMethodLabel,
            status: 'Processing',
          });
        }
        console.log(`Updated ${orders.length} orders to Paid/Processing for session ${sessionId}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});