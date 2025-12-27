import React, { createContext, useContext, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const formatBND = (amount) => {
    return new Intl.NumberFormat('en-BN', {
      style: 'currency',
      currency: 'BND',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const cartTotal = useMemo(() => 
    cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );
  
  const cartCount = useMemo(() => 
    cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );

  // UPDATE: Parameter 'customPrice' ditambahkan di sini
  const addToCart = (item, qty, selectedOption = null, customPrice = null) => {
    const cartId = selectedOption ? `${item.id}-${selectedOption}` : `${item.id}`;
    const itemName = selectedOption ? `${item.name} (${selectedOption})` : item.name;
    
    // Gunakan customPrice jika ada (untuk Pizza $12 atau Mix), jika tidak pakai harga default
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

        // Update quantity DAN pastikan harga terupdate
        return prevCart.map(i =>
          i.cartId === cartId ? { ...i, quantity: newQty, price: finalPrice } : i
        );
      } else {
        const newItem = { 
            ...item, 
            cartId, 
            name: itemName,
            quantity: quantityToAdd,
            price: finalPrice, // Simpan harga custom
            selectedOption 
        };

        toast.success(`Added: ${itemName}`, {
            style: { background: '#fff', color: '#333', border: '1px solid #e2e8f0' },
            iconTheme: { primary: '#d97706', secondary: '#fff' },
        });

        return [...prevCart, newItem];
      }
    });
  };

  const updateQuantity = (cartId, delta) => {
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
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    toast.success("Item removed from cart.");
  };

  const clearCart = () => setCart([]);
  
  const value = {
    cart,
    cartTotal,
    cartCount,
    formatBND,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
