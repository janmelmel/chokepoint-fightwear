/**
 * Cart store using localStorage.
 * Cart item shape: { id, productId, name, price, image, size, quantity, is_preorder }
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

export function addToCart(product, size, quantity = 1) {
  const cart = getCart();
  const stockLimit = product.stock_limit > 0 ? product.stock_limit - (product.total_ordered || 0) : Infinity;
  const existingIdx = cart.findIndex(
    (i) => i.productId === product.id && i.size === size
  );
  if (existingIdx >= 0) {
    const newQty = cart[existingIdx].quantity + quantity;
    cart[existingIdx].quantity = Math.min(newQty, stockLimit);
  } else {
    cart.push({
      id: `${product.id}-${size}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || null,
      size,
      quantity: Math.min(quantity, stockLimit),
      is_preorder: !!product.is_preorder,
      stock_limit: product.stock_limit > 0 ? stockLimit : null,
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