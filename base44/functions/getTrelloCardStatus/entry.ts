import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Maps Trello list names to customer-facing statuses
const TRELLO_STATUS_MAP = [
  { steps: ['Pending Orders', 'Digitize Mockup'], status: 'Order Confirmed', step: 1 },
  { steps: ['For Client Approval / Initial Checking'], status: 'Pending Customer Approval', step: 2 },
  { steps: ['Layout Sewing Pattern', 'Ready for Digital Files Quality Control', 'Digital Files Quality Control'], status: 'Digitizing Order', step: 3 },
  { steps: ['Ready to Print', 'Printing & Cutting', 'Heatpress & Cutting', 'Pre-sewing Quality Control', 'Sewing'], status: 'In Production', step: 4 },
  { steps: ['Finished Product Quality Control'], status: 'Quality Control', step: 5 },
  { steps: ['Packaging'], status: 'Packing', step: 6 },
  { steps: ['Ready for Delivery'], status: 'Ready for Delivery', step: 7 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { trello_card_id, order_id } = await req.json();

    if (!trello_card_id) {
      return Response.json({ error: 'Missing trello_card_id' }, { status: 400 });
    }

    const apiKey = Deno.env.get('TRELLO_API_KEY');
    const token = Deno.env.get('TRELLO_TOKEN');

    // Fetch card info
    const cardRes = await fetch(
      `https://api.trello.com/1/cards/${trello_card_id}?key=${apiKey}&token=${token}&fields=idList,name,shortUrl`
    );

    if (!cardRes.ok) {
      return Response.json({ error: 'Card not found on Trello' }, { status: 404 });
    }

    const card = await cardRes.json();

    // Fetch list name
    const listRes = await fetch(
      `https://api.trello.com/1/lists/${card.idList}?key=${apiKey}&token=${token}&fields=name`
    );

    if (!listRes.ok) {
      return Response.json({ error: 'Could not fetch Trello list' }, { status: 404 });
    }

    const list = await listRes.json();
    const listName = list.name;

    // Map to customer-facing status
    let mapped = null;
    for (const entry of TRELLO_STATUS_MAP) {
      if (entry.steps.some(s => listName.toLowerCase().includes(s.toLowerCase()))) {
        mapped = entry;
        break;
      }
    }

    const currentStep = mapped?.step || 1;
    const currentStatus = mapped?.status || 'In Progress';

    // If order_id provided, check history and log if status changed
    if (order_id) {
      try {
        const existing = await base44.asServiceRole.entities.OrderStatusHistory.filter(
          { order_id },
          '-changed_at',
          1
        );

        const lastStep = existing?.[0]?.step;

        // Only log if it's a new status
        if (!existing.length || existing[0].trello_list !== listName) {
          const isRevert = existing.length > 0 && currentStep < lastStep;
          await base44.asServiceRole.entities.OrderStatusHistory.create({
            order_id,
            trello_card_id,
            trello_list: listName,
            status: currentStatus,
            step: currentStep,
            event_type: isRevert ? 'revert' : (currentStep === 7 ? 'complete' : 'progress'),
            changed_at: new Date().toISOString(),
          });
        }
      } catch (histErr) {
        // Don't fail the main request if history logging fails
        console.error('History log error:', histErr.message);
      }
    }

    return Response.json({
      trello_list: listName,
      status: currentStatus,
      step: currentStep,
      card_url: card.shortUrl,
      total_steps: 7,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});