import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { order_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const history = await base44.asServiceRole.entities.OrderStatusHistory.filter(
      { order_id },
      'changed_at',
      50
    );

    return Response.json({ history });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});