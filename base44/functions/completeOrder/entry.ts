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
        body: `Hi ${order.customer_name},\n\nYour order ${order.order_number} has been marked as completed. Thank you for supporting Chokepoint Fightwear!\n\nNo Escape From Chokepoint.\n\n— Chokepoint Fightwear Team\nsales@chokepoint-fightwear.com`,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('completeOrder error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});