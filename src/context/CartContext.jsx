import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const CART_STORAGE_KEY = 'coffeennity_cart_v1';

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Initialize cart from LocalStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
      return [];
    }
  });

  // Persist cart to LocalStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to storage:", error);
    }
  }, [cart]);

  const formatBND = useCallback((amount) => {
    return new Intl.NumberFormat('en-BN', {
      style: 'currency',
      currency: 'BND',
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  const cartTotal = useMemo(() => 
    cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );
  
  const cartCount = useMemo(() => 
    cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );

  const addToCart = useCallback((item, qty, selectedOption = null, customPrice = null) => {
    const cartId = selectedOption ? `${item.id}-${selectedOption}` : `${item.id}`;
    const itemName = selectedOption ? `${item.name} (${selectedOption})` : item.name;
    
    const finalPrice = customPrice !== null ? customPrice : item.price;

    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.cartId === cartId);
      const quantityToAdd = qty || item.minQty;

      if (existingItem) {
        const newQty = existingItem.quantity + quantityToAdd;
        
        toast.success(`Updated: ${itemName}`, {
             style: { background: '#fff', color: '#333', border: '1px solid #e2e8f0' },
             iconTheme: { primary: '#d97706', secondary: '#fff' },
        });

        return prevCart.map(i =>
          i.cartId === cartId ? { ...i, quantity: newQty, price: finalPrice } : i
        );
      } else {
        const newItem = { 
            ...item, 
            cartId, 
            name: itemName,
            quantity: quantityToAdd,
            price: finalPrice, 
            selectedOption 
        };

        toast.success(`Added: ${itemName}`, {
            style: { background: '#fff', color: '#333', border: '1px solid #e2e8f0' },
            iconTheme: { primary: '#d97706', secondary: '#fff' },
        });

        return [...prevCart, newItem];
      }
    });
  }, []);

  const updateQuantity = useCallback((cartId, delta) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(i => i.cartId === cartId);
      if (!itemToUpdate) return prevCart;

      const newQty = itemToUpdate.quantity + delta;

      if (newQty < itemToUpdate.minQty) {
        toast.error(`Minimum order for this item is ${itemToUpdate.minQty} ${itemToUpdate.unit}.`);
        return prevCart;
      }
      
      return prevCart.map(i => 
        i.cartId === cartId ? { ...i, quantity: newQty } : i
      );
    });
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    toast.success("Item removed from cart.");
  }, []);

  const clearCart = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your tray?")) {
      setCart([]);
      toast.success("Tray cleared.");
    }
  }, []);
  
  const value = useMemo(() => ({
    cart,
    cartTotal,
    cartCount,
    formatBND,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }), [cart, cartTotal, cartCount, formatBND, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};