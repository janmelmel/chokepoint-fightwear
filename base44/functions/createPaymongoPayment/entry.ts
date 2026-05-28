import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    // createClientFromRequest provides asServiceRole — no auth.me() needed (supports guest users)
    const base44 = createClientFromRequest(req);

    const {
      amount, customerName, customerEmail, customerPhone,
      lineItems, cartItems, contact, address, zone, shippingFee, appliedPromoCode, promoDiscount
    } = await req.json();

    if (!amount || !lineItems?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // STOCK CHECK — before creating any orders or payment session
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
            error: `Sorry, ${p.name} (${label}) only has ${available} unit(s) available. Please return to your cart and update your quantities.`,
            stock_error: true,
          }, { status: 409 });
        }
      }
    }

    // CREATE ORDER RECORDS using service role (works for guests)
    const createdOrders = [];
    for (const item of cartItems) {
      const orderNum = `CP-${Date.now().toString(36).toUpperCase().slice(-4)}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
      const order = await base44.asServiceRole.entities.Order.create({
        order_number: orderNum,
        product_id: item.productId,
        product_name: item.name,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        size: item.size,
        quantity: item.quantity,
        total_amount: item.price * item.quantity,
        payment_method: 'Other',
        payment_status: 'Pending',
        status: 'Pending',
        is_preorder: !!item.is_preorder,
        custom_print_text: item.custom_text || '',
        variant_name: item.variant_name || '',
        shipping_province: address?.province || '',
        shipping_city: address?.city || '',
        shipping_barangay: address?.barangay || '',
        shipping_street: address?.street || '',
        shipping_postal_code: address?.postal_code || '',
        shipping_delivery_notes: address?.notes || '',
        shipping_zone: zone || '',
        shipping_fee: shippingFee || 0,
        notes: appliedPromoCode ? `Promo: ${appliedPromoCode} (-₱${promoDiscount || 0})` : '',
      });
      createdOrders.push({ id: order.id, orderNum, item });
    }

    const orderIds = createdOrders.map(o => o.id);
    const orderNumbers = createdOrders.map(o => o.orderNum);

    // BUILD PAYMONGO SESSION
    const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
    const authHeader = 'Basic ' + btoa(secretKey + ':');
    const origin = req.headers.get('origin') || 'https://chokepoint-fightwear.base44.app';

    // Sanitize phone to E.164 for PayMongo billing
    const sanitizePhone = (raw) => {
      if (!raw) return '';
      const digits = raw.replace(/\D/g, '');
      if (digits.startsWith('63')) return '+' + digits;
      if (digits.startsWith('09')) return '+63' + digits.slice(1);
      if (digits.startsWith('9') && digits.length === 10) return '+63' + digits;
      return '+' + digits;
    };
    const billingPhone = sanitizePhone(customerPhone);

    const pmLineItems = lineItems.map((item) => ({
      currency: 'PHP',
      amount: Math.round(item.price * 100),
      description: [item.size && `Size: ${item.size}`, item.custom_text && `Print: ${item.custom_text}`].filter(Boolean).join(' | ') || item.name,
      name: item.name,
      quantity: item.quantity,
    }));

    if (lineItems[0]?.shipping_fee > 0) {
      pmLineItems.push({
        currency: 'PHP',
        amount: Math.round(lineItems[0].shipping_fee * 100),
        description: 'Shipping Fee',
        name: 'Shipping',
        quantity: 1,
      });
    }

    const encodedIds = encodeURIComponent(JSON.stringify(orderIds));
    const encodedNums = encodeURIComponent(JSON.stringify(orderNumbers));

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
          payment_method_types: [
          ],
          description: 'Chokepoint Fightwear Order',
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
      // Cancel/mark orders as failed if PayMongo fails
      await Promise.all(orderIds.map(id =>
        base44.asServiceRole.entities.Order.update(id, { status: 'Cancelled', payment_status: 'Failed' }).catch(() => {})
      ));
      console.error('PayMongo error:', JSON.stringify(data));
      return Response.json({ error: data.errors?.[0]?.detail || 'PayMongo error' }, { status: 400 });
    }

    const checkoutUrl = data.data?.attributes?.checkout_url;
    const sessionId = data.data?.id;

    // Save session ID to orders
    await Promise.all(orderIds.map(id =>
      base44.asServiceRole.entities.Order.update(id, { paymongo_session_id: sessionId }).catch(() => {})
    ));

    return Response.json({ checkout_url: checkoutUrl, session_id: sessionId, orderIds, orderNumbers });
  } catch (error) {
    console.error('Function error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});