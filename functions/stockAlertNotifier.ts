import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const LOW_STOCK_THRESHOLD = 3;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Triggered by entity automation on Product update — no user auth required
    const body = await req.json().catch(() => ({}));
    const { event, data, old_data } = body;

    if (!data || !data.stock_per_size) {
      return Response.json({ skipped: true, reason: 'No stock_per_size data' });
    }

    const oldStock = old_data?.stock_per_size || {};
    const newStock = data.stock_per_size;

    // Find sizes that just hit 0 (out of stock transition)
    const justOutOfStock = Object.entries(newStock).filter(([size, qty]) => {
      const prev = oldStock[size];
      return Number(qty) === 0 && (prev == null || Number(prev) > 0);
    });

    // Find sizes that dropped to or below threshold
    const nowLow = Object.entries(newStock).filter(([size, qty]) => {
      const prev = oldStock[size];
      return Number(qty) <= LOW_STOCK_THRESHOLD && Number(qty) > 0 && (prev == null || Number(prev) > LOW_STOCK_THRESHOLD);
    });

    if (justOutOfStock.length === 0 && nowLow.length === 0) {
      return Response.json({ skipped: true, reason: 'No threshold crossings' });
    }

    // Get admin email(s)
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) {
      return Response.json({ skipped: true, reason: 'No admin users found' });
    }

    const productName = data.name || 'Unknown Product';
    const alerts = [];

    justOutOfStock.forEach(([size]) => alerts.push(`• ${productName} — Size ${size}: OUT OF STOCK`));
    nowLow.forEach(([size, qty]) => alerts.push(`• ${productName} — Size ${size}: ${qty} remaining (low stock)`));

    const subject = justOutOfStock.length > 0
      ? `⚠️ Out of Stock Alert — ${productName}`
      : `⚠️ Low Stock Alert — ${productName}`;

    const body_text = `Stock Alert — Chokepoint Fightwear\n\n${alerts.join('\n')}\n\nPlease restock or update product availability.\n\nView product: ${productName}\n\n— Chokepoint System`;

    // Send email to all admins
    const emailPromises = admins.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject,
        body: body_text,
      })
    );

    await Promise.all(emailPromises);

    return Response.json({
      sent: true,
      recipients: admins.map(a => a.email),
      alerts,
    });
  } catch (error) {
    console.error('stockAlertNotifier error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});