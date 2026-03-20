import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { amount, customerName, customerEmail, customerPhone, lineItems, orderIds, orderNumbers } = await req.json();

    if (!amount || !lineItems?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
    const authHeader = 'Basic ' + btoa(secretKey + ':');
    const origin = req.headers.get('origin') || 'https://chokepoint-fightwear.base44.app';

    const pmLineItems = lineItems.map((item) => ({
      currency: 'PHP',
      amount: Math.round(item.price * 100),
      description: [item.size && `Size: ${item.size}`, item.custom_text && `Print: ${item.custom_text}`].filter(Boolean).join(' | ') || item.name,
      name: item.name,
      quantity: item.quantity,
    }));

    // Add shipping as line item if present
    if (lineItems[0]?.shipping_fee > 0) {
      pmLineItems.push({
        currency: 'PHP',
        amount: Math.round(lineItems[0].shipping_fee * 100),
        description: 'Shipping Fee',
        name: 'Shipping',
        quantity: 1,
      });
    }

    // Encode order IDs into redirect URLs
    const encodedIds = encodeURIComponent(JSON.stringify(orderIds || []));
    const encodedNums = encodeURIComponent(JSON.stringify(orderNumbers || []));

    const payload = {
      data: {
        attributes: {
          billing: {
            name: customerName || '',
            email: customerEmail || '',
            phone: customerPhone || '',
          },
          send_email_receipt: !!customerEmail,
          show_description: true,
          show_line_items: true,
          line_items: pmLineItems,
          payment_method_types: ['qrph'],
          description: `Chokepoint Fightwear Order`,
          success_url: `${origin}/OrderConfirmed?status=success&orderIds=${encodedIds}&orderNumbers=${encodedNums}&name=${encodeURIComponent(customerName || '')}`,
          cancel_url: `${origin}/Checkout?payment=cancelled`,
        },
      },
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayMongo error:', JSON.stringify(data));
      return Response.json({ error: data.errors?.[0]?.detail || 'PayMongo error' }, { status: 400 });
    }

    const checkoutUrl = data.data?.attributes?.checkout_url;
    const sessionId = data.data?.id;

    return Response.json({ checkout_url: checkoutUrl, session_id: sessionId });
  } catch (error) {
    console.error('Function error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});