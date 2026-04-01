import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderId, orderNumber, customerName, items, shippingAddress } = await req.json();

    const apiKey = Deno.env.get('TRELLO_API_KEY');
    const token = Deno.env.get('TRELLO_TOKEN');
    const listId = Deno.env.get('TRELLO_PENDING_LIST_ID');

    // Build card description
    const itemsList = items.map(i =>
      `- ${i.name}${i.variant_name ? ` (${i.variant_name})` : ''} | Size: ${i.size} | Qty: ${i.quantity}`
    ).join('\n');

    const description = `**Order Number:** ${orderNumber}
**Customer:** ${customerName}
**Shipping:** ${shippingAddress}

**Items:**
${itemsList}`;

    const cardName = `[${orderNumber}] ${customerName}`;

    const res = await fetch(
      `https://api.trello.com/1/cards?key=${apiKey}&token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idList: listId,
          name: cardName,
          desc: description,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Trello API error: ${errText}` }, { status: 500 });
    }

    const card = await res.json();

    // Save trello_card_id to the order
    if (orderId) {
      await base44.asServiceRole.entities.Order.update(orderId, { trello_card_id: card.id });
    }

    return Response.json({ card_id: card.id, card_url: card.shortUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});