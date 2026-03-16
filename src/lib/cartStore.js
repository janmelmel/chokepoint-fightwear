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
  const existingIdx = cart.findIndex(
    (i) => i.productId === product.id && i.size === size
  );
  if (existingIdx >= 0) {
    cart[existingIdx].quantity += quantity;
  } else {
    cart.push({
      id: `${product.id}-${size}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || null,
      size,
      quantity,
      is_preorder: !!product.is_preorder,
    });
  }
  saveCart(cart);
}

export function removeFromCart(itemId) {
  saveCart(getCart().filter((i) => i.id !== itemId));
}

export function updateQuantity(itemId, quantity) {
  if (quantity < 1) { removeFromCart(itemId); return; }
  saveCart(getCart().map((i) => i.id === itemId ? { ...i, quantity } : i));
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