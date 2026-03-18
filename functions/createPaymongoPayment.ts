import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { amount, description, customerName, customerEmail, customerPhone, lineItems } = await req.json();

    if (!amount || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
    const authHeader = 'Basic ' + btoa(secretKey + ':');

    // Build line items for PayMongo
    const pmLineItems = (lineItems || []).map((item) => ({
      currency: 'PHP',
      amount: Math.round(item.price * 100), // PayMongo uses centavos
      description: `${item.name} (${item.size})`,
      name: item.name,
      quantity: item.quantity,
    }));

    // If no line items provided, create a single item
    if (pmLineItems.length === 0) {
      pmLineItems.push({
        currency: 'PHP',
        amount: Math.round(amount * 100),
        description: description,
        name: description,
        quantity: 1,
      });
    }

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
          payment_method_types: ['card', 'gcash', 'paymaya'],
          description: description,
          success_url: `${req.headers.get('origin') || 'https://chokepoint-fightwear.base44.app'}/Checkout?payment=success`,
          cancel_url: `${req.headers.get('origin') || 'https://chokepoint-fightwear.base44.app'}/Checkout?payment=cancelled`,
        },
      },
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
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