import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { amount, customerName, customerEmail, customerPhone, lineItems, orderIds, orderNumbers, cartItems } = await req.json();

    if (!amount || !lineItems?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // FINAL STOCK CHECK — last line of defense before creating payment session
    if (cartItems && cartItems.length > 0) {
      const productIds = [...new Set(cartItems.map(i => i.productId))];
      const products = await Promise.all(
        productIds.map(id =>
          base44.asServiceRole.entities.Product.filter({ id }).then(r => r[0]).catch(() => null)
        )
      );
      const productMap = Object.fromEntries(products.filter(Boolean).map(p => [p.id, p]));

      for (const item of cartItems) {
        if (item.is_preorder) continue;
        const p = productMap[item.productId];
        if (!p) continue;

        let available = null;
        if (p.variants?.length && item.variant_name) {
          const v = p.variants.find(v => v.name === item.variant_name);
          if (v) {
            const vs = (v.sizes || []).find(s => s.size === item.size);
            available = vs?.stock ?? null;
          }
        } else {
          available = p.stock_per_size?.[item.size] ?? null;
        }

        if (available !== null && item.quantity > available) {
          const label = item.variant_name ? `${item.variant_name} — Size ${item.size}` : `Size ${item.size}`;
          return Response.json({
            error: `Sorry, ${p.name} (${label}) only has ${available} unit(s) available. Your order has not been processed. Please return to your cart and update your quantities.`,
            stock_error: true,
          }, { status: 409 });
        }
      }
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