/**
 * Cart store using localStorage.
 * Cart item shape: { id, productId, name, price, image, size, variant_name, quantity,
 *                    is_preorder, custom_text, shipping_fee_override, added_at }
 */

const STORAGE_KEY = 'cp_cart';
const CART_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cp_cart_updated'));
}

/**
 * Remove expired non-preorder items and return how many were removed.
 */
export function purgeExpiredItems() {
  const cart = getCart();
  const now = Date.now();
  const fresh = cart.filter(i => i.is_preorder || !i.added_at || (now - i.added_at) < CART_EXPIRY_MS);
  if (fresh.length !== cart.length) {
    saveCart(fresh);
    return cart.length - fresh.length;
  }
  return 0;
}

export function addToCart(product, size, quantity = 1, customText = '') {
  const cart = getCart();

  // Determine per-size stock for this specific size
  const variantName = product.variant_name || '';
  const sizeStock = product.stock_per_size?.[size] ?? null;
  const globalStock = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : null;
  const stockLimit = sizeStock != null ? sizeStock : (globalStock != null ? globalStock : null);

  const existingIdx = cart.findIndex(
    (i) => i.productId === product.id && i.size === size && i.variant_name === variantName
  );

  if (existingIdx >= 0) {
    const newQty = cart[existingIdx].quantity + quantity;
    cart[existingIdx].quantity = stockLimit != null ? Math.min(newQty, stockLimit) : newQty;
    if (customText) cart[existingIdx].custom_text = customText;
  } else {
    const cappedQty = stockLimit != null ? Math.min(quantity, stockLimit) : quantity;
    cart.push({
      id: `${product.id}-${size}-${variantName}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || null,
      size,
      variant_name: variantName,
      quantity: cappedQty,
      is_preorder: !!product.is_preorder,
      stock_limit: stockLimit,
      custom_text: customText || '',
      shipping_fee_override: product.shipping_fee_override ?? null,
      allow_custom_print: !!product.allow_custom_print,
      custom_print_label: product.custom_print_label || '',
      weight_kg: product.weight_kg || null,
      added_at: Date.now(),
    });
  }
  saveCart(cart);
}

export function removeFromCart(itemId) {
  saveCart(getCart().filter((i) => i.id !== itemId));
}

export function updateQuantity(itemId, quantity) {
  if (quantity < 1) { removeFromCart(itemId); return; }
  saveCart(getCart().map((i) => {
    if (i.id !== itemId) return i;
    const max = i.stock_limit != null ? i.stock_limit : Infinity;
    return { ...i, quantity: Math.min(quantity, max) };
  }));
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}