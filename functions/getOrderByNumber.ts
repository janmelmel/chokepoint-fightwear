import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderNumber } = await req.json();

    if (!orderNumber) {
      return Response.json({ error: 'Order number is required' }, { status: 400 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });
    if (!orders.length) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Only return fields needed for payment — don't expose sensitive admin data
    return Response.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        product_name: order.product_name,
        product_id: order.product_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        size: order.size,
        quantity: order.quantity,
        custom_print_text: order.custom_print_text,
        total_amount: order.total_amount,
        shipping_fee: order.shipping_fee,
        shipping_street: order.shipping_street,
        shipping_barangay: order.shipping_barangay,
        shipping_city: order.shipping_city,
        shipping_province: order.shipping_province,
        shipping_postal_code: order.shipping_postal_code,
        payment_status: order.payment_status,
        status: order.status,
        is_preorder: order.is_preorder,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});