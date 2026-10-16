import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setCart({ items: [], total: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await api.getCart(token);
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addToCart(productId, variantId, quantity = 1) {
    const data = await api.addToCart({ productId, variantId, quantity }, token);
    setCart(data);
  }

  async function updateQuantity(productId, variantId, quantity) {
    const data = await api.updateCartItem({ productId, variantId, quantity }, token);
    setCart(data);
  }

  async function removeItem(productId, variantId) {
    const data = await api.removeCartItem({ productId, variantId }, token);
    setCart(data);
  }

  async function clear() {
    const data = await api.clearCart(token);
    setCart(data);
  }

  return (
    <CartContext.Provider
      value={{ cart, loading, refresh, addToCart, updateQuantity, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
