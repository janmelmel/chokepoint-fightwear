/**
 * Cart store using localStorage.
 * Cart item shape: { id, productId, name, price, image, size, quantity, is_preorder, custom_text, shipping_fee_override }
 */

const STORAGE_KEY = 'cp_cart';

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

export function addToCart(product, size, quantity = 1, customText = '') {
  const cart = getCart();
  const sizeStock = product.stock_per_size?.[size];
  const globalStock = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : Infinity;
  const stockLimit = sizeStock != null ? sizeStock : globalStock;

  const variantName = product.variant_name || '';
  const existingIdx = cart.findIndex(
    (i) => i.productId === product.id && i.size === size && i.variant_name === variantName
  );
  if (existingIdx >= 0) {
    const newQty = cart[existingIdx].quantity + quantity;
    cart[existingIdx].quantity = Math.min(newQty, stockLimit);
    if (customText) cart[existingIdx].custom_text = customText;
  } else {
    cart.push({
      id: `${product.id}-${size}-${variantName}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || null,
      size,
      variant_name: variantName,
      quantity: Math.min(quantity, stockLimit),
      is_preorder: !!product.is_preorder,
      stock_limit: stockLimit !== Infinity ? stockLimit : null,
      custom_text: customText || '',
      shipping_fee_override: product.shipping_fee_override ?? null,
      allow_custom_print: !!product.allow_custom_print,
      custom_print_label: product.custom_print_label || '',
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