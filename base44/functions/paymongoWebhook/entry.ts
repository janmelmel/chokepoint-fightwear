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

      // Send pre-order confirmation email with timeline
      if (order.is_preorder && order.customer_email) {
        const orderDate = new Date(order.created_date || new Date());
        const addBizDays = (start, days) => {
          let count = 0; let d = new Date(start);
          while (count < days) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) count++; }
          return d;
        };
        const addCalDays = (d, days) => { const r = new Date(d); r.setDate(r.getDate() + days); return r; };
        const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const fmtShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const prodMin = addBizDays(orderDate, 7);
        const prodMax = addBizDays(orderDate, 10);
        const arrMin = addCalDays(prodMin, 3);
        const arrMax = addCalDays(prodMax, 7);
        const prodRange = `${fmtShort(prodMin)} – ${fmtShort(prodMax)}, ${prodMax.getFullYear()}`;
        const arrRange = `${fmtShort(arrMin)} – ${fmtShort(arrMax)}, ${arrMax.getFullYear()}`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: order.customer_email,
          subject: `Pre-Order Confirmed: ${order.order_number} — Chokepoint Fightwear`,
          body: `<div style="background:#111111;color:#f0f0f0;font-family:monospace;padding:32px;max-width:560px;margin:0 auto;">
  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c180d84abb747333a6889/ff2b5a406_CPLOGO-WHITE.png" alt="Chokepoint Fightwear" style="height:36px;margin-bottom:24px;" />
  <h2 style="font-size:22px;color:#ffffff;margin:0 0 4px;">Pre-Order Confirmed! 🥋</h2>
  <p style="font-size:12px;color:#888;margin:0 0 24px;">Hi ${order.customer_name}, your pre-order <strong style="color:#E87722">${order.order_number}</strong> has been received and paid.</p>
  <div style="border:1px solid #333;padding:12px 16px;margin-bottom:20px;background:#0d0d0d;">
    <p style="font-size:12px;color:#ffffff;margin:0 0 4px;">${order.product_name}${order.size ? ` · Size ${order.size}` : ''}${order.variant_name ? ` · ${order.variant_name}` : ''}</p>
    <p style="font-size:12px;color:#E87722;font-weight:bold;margin:0;">₱${Number(order.total_amount || 0).toLocaleString()}</p>
  </div>
  <div style="border-left:3px solid #E87722;background:#0d0d0d;padding:14px 16px;margin-bottom:20px;">
    <p style="font-size:10px;color:#E87722;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">YOUR PRE-ORDER TIMELINE</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="border-bottom:1px solid #222;">
        <td style="font-size:11px;color:#aaa;padding:5px 0;">📋 Order Placed</td>
        <td style="font-size:11px;color:#ffffff;padding:5px 0;text-align:right;">${fmt(orderDate)}</td>
      </tr>
      <tr style="border-bottom:1px solid #222;">
        <td style="font-size:11px;color:#aaa;padding:5px 0;">🔧 Est. Production</td>
        <td style="font-size:11px;color:#ffffff;padding:5px 0;text-align:right;">7–10 business days<br/><span style="font-size:10px;color:#E87722;">by ${prodRange}</span></td>
      </tr>
      <tr style="border-bottom:1px solid #222;">
        <td style="font-size:11px;color:#aaa;padding:5px 0;">🚚 Est. Shipping</td>
        <td style="font-size:11px;color:#ffffff;padding:5px 0;text-align:right;">3–7 days after production</td>
      </tr>
      <tr>
        <td style="font-size:11px;color:#aaa;padding:5px 0;">📦 Est. Arrival</td>
        <td style="font-size:12px;color:#E87722;font-weight:bold;padding:5px 0;text-align:right;">${arrRange}</td>
      </tr>
    </table>
    <p style="font-size:10px;color:#555;margin:10px 0 0;">We'll notify you when your order ships!</p>
  </div>
  <p style="font-size:11px;color:#888;">Questions? Contact us at <a href="mailto:sales@chokepoint-fightwear.com" style="color:#E87722;">sales@chokepoint-fightwear.com</a></p>
  <p style="font-size:11px;color:#555;margin-top:24px;">No Escape From Chokepoint.<br/>— Chokepoint Fightwear Team</p>
</div>`,
        }).catch(e => console.error('[Webhook] Failed to send preorder email:', e.message));
      }
    }

    return Response.json({ received: true, orders_updated: orders.length });
  } catch (error) {
    console.error('[Webhook] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});