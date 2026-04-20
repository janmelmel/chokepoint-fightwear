import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderId, completionNote } = await req.json();

    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Fetch the order using service role
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    const order = orders[0];

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Mark as Completed
    await base44.asServiceRole.entities.Order.update(orderId, {
      status: 'Completed',
      completion_note: completionNote || '',
    });

    // Send completion email to customer
    if (order.customer_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `Your Chokepoint Order is Complete! 🥋`,
        body: `<div style="background:#0a0a0a;color:#f0f0f0;font-family:monospace;padding:32px;max-width:560px;margin:0 auto;">
  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c180d84abb747333a6889/ff2b5a406_CPLOGO-WHITE.png" alt="Chokepoint Fightwear" style="height:36px;margin-bottom:24px;" />
  <h2 style="font-size:22px;color:#ffffff;margin:0 0 8px;">Order Completed ✅</h2>
  <p style="font-size:12px;color:#888;margin:0 0 20px;">Hi ${order.customer_name}, your order <strong style="color:#E87722">${order.order_number}</strong> has been completed!</p>
  <div style="border:1px solid #222;padding:16px;margin-bottom:20px;">
    <p style="font-size:11px;color:#888;margin:0 0 6px;">${order.product_name}${order.size ? ` · Size ${order.size}` : ''}${order.variant_name ? ` · ${order.variant_name}` : ''}</p>
    <p style="font-size:11px;color:#E87722;font-weight:bold;margin:0;">₱${Number(order.total_amount || 0).toLocaleString()}</p>
  </div>
  ${completionNote ? `<div style="border-left:3px solid #E87722;padding:8px 12px;margin-bottom:20px;background:#111;"><p style="font-size:11px;color:#888;margin:0;">Note: <span style="color:#fff">${completionNote}</span></p></div>` : ''}
  <p style="font-size:11px;color:#888;">Thank you for supporting Chokepoint Fightwear!</p>
  <p style="font-size:11px;color:#555;margin-top:24px;">No Escape From Chokepoint.<br/>— Chokepoint Fightwear Team<br/>sales@chokepoint-fightwear.com</p>
</div>`,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('completeOrder error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});