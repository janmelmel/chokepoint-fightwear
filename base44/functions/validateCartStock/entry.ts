import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Validates cart items against current DB stock.
 * Input: { items: [ { productId, size, variant_name, quantity, is_preorder } ] }
 * Output: { valid: boolean, violations: [ { productId, size, variant_name, requested, available } ] }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ valid: true, violations: [] });
    }

    // Get unique product IDs
    const productIds = [...new Set(items.map(i => i.productId))];
    const products = await Promise.all(
      productIds.map(id =>
        base44.asServiceRole.entities.Product.filter({ id }).then(r => r[0]).catch(() => null)
      )
    );
    const productMap = Object.fromEntries(products.filter(Boolean).map(p => [p.id, p]));

    const violations = [];

    for (const item of items) {
      // Skip preorders — no stock cap
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
        const sizeStock = p.stock_per_size?.[item.size] ?? null;
        available = sizeStock;
      }

      if (available === null) continue; // no stock tracking for this item

      if (item.quantity > available) {
        violations.push({
          productId: item.productId,
          productName: p.name,
          size: item.size,
          variant_name: item.variant_name || '',
          requested: item.quantity,
          available: available,
        });
      }
    }

    return Response.json({ valid: violations.length === 0, violations });
  } catch (error) {
    console.error('validateCartStock error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});