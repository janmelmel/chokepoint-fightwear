import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && user.role !== 'user')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all history records sorted by changed_at
    const allHistory = await base44.asServiceRole.entities.OrderStatusHistory.list('changed_at', 500);

    // Fetch all orders
    const allOrders = await base44.asServiceRole.entities.Order.list('-created_date', 500);
    const orderMap = Object.fromEntries(allOrders.map(o => [o.id, o]));

    // Group history by order_id
    const byOrder = {};
    for (const h of allHistory) {
      if (!byOrder[h.order_id]) byOrder[h.order_id] = [];
      byOrder[h.order_id].push(h);
    }

    const STAGE_LABELS = [
      'Order Confirmed',
      'Pending Customer Approval',
      'Digitizing Order',
      'In Production',
      'Quality Control',
      'Packing',
      'Ready for Delivery',
    ];

    // Per-order breakdown
    const orderMetrics = [];
    const stageTotals = {}; // stage -> [durations in hours]

    for (const [orderId, entries] of Object.entries(byOrder)) {
      const order = orderMap[orderId];
      if (!order) continue;

      // Sort by changed_at
      const sorted = [...entries].sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));

      // Calculate duration per stage (time between consecutive status entries)
      const stages = [];
      for (let i = 0; i < sorted.length; i++) {
        const curr = sorted[i];
        const next = sorted[i + 1];
        const start = new Date(curr.changed_at);
        const end = next ? new Date(next.changed_at) : (order.status === 'Completed' ? new Date(order.updated_date) : null);
        const durationHours = end ? (end - start) / (1000 * 60 * 60) : null;

        stages.push({
          step: curr.step,
          status: curr.status,
          trello_list: curr.trello_list,
          started_at: curr.changed_at,
          ended_at: end ? end.toISOString() : null,
          duration_hours: durationHours !== null ? Math.round(durationHours * 10) / 10 : null,
        });

        // Aggregate for averages
        if (durationHours !== null && curr.event_type !== 'revert') {
          if (!stageTotals[curr.status]) stageTotals[curr.status] = [];
          stageTotals[curr.status].push(durationHours);
        }
      }

      // Total order duration
      const firstEntry = sorted[0];
      const isCompleted = order.status === 'Completed';
      const totalHours = firstEntry
        ? (new Date(isCompleted ? order.updated_date : new Date()) - new Date(firstEntry.changed_at)) / (1000 * 60 * 60)
        : null;

      orderMetrics.push({
        order_id: orderId,
        order_number: order.order_number,
        product_name: order.product_name,
        customer_name: order.customer_name,
        status: order.status,
        is_completed: isCompleted,
        created_date: order.created_date,
        total_hours: totalHours !== null ? Math.round(totalHours * 10) / 10 : null,
        stages,
      });
    }

    // Stage averages
    const stageAverages = STAGE_LABELS.map(label => {
      const durations = stageTotals[label] || [];
      const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
      const max = durations.length ? Math.max(...durations) : null;
      const min = durations.length ? Math.min(...durations) : null;
      return {
        status: label,
        avg_hours: avg !== null ? Math.round(avg * 10) / 10 : null,
        max_hours: max !== null ? Math.round(max * 10) / 10 : null,
        min_hours: min !== null ? Math.round(min * 10) / 10 : null,
        sample_count: durations.length,
      };
    });

    // Sort order metrics by most recent first
    orderMetrics.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return Response.json({ orderMetrics, stageAverages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});