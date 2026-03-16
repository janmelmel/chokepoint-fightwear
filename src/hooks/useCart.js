import { useState, useEffect } from 'react';
import { getCart, getCartCount } from '@/lib/cartStore';

export function useCart() {
  const [cart, setCart] = useState(getCart);
  const [count, setCount] = useState(getCartCount);

  useEffect(() => {
    const sync = () => {
      setCart(getCart());
      setCount(getCartCount());
    };
    window.addEventListener('cp_cart_updated', sync);
    return () => window.removeEventListener('cp_cart_updated', sync);
  }, []);

  return { cart, count };
}