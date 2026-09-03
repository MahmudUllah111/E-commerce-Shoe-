import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  // Load current user from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trustedmart_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Load cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('trustedmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Load wishlist from localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('trustedmart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync cart changes
  useEffect(() => {
    localStorage.setItem('trustedmart_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist changes
  useEffect(() => {
    localStorage.setItem('trustedmart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('trustedmart_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('trustedmart_user');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
    }
  }, [currentUser]);

  // Complete Login action
  const loginUser = (user, token) => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('auth_token', token);
    }
    localStorage.setItem('trustedmart_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  // Complete Logout action
  const logoutUser = () => {
    localStorage.removeItem('trustedmart_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
  };

  // Cart operations
  const addToCart = (product, variant, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product_id === product.id && item.variant_id === variant.id
      );

      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + quantity,
        };
        return nextCart;
      }

      return [
        ...prev,
        {
          id: `${product.id}-${variant.id}`,
          product_id: product.id,
          variant_id: variant.id,
          name: product.name,
          price: Number(product.price),
          image: product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
          size: variant.size_value,
          color: variant.color_name,
          quantity: quantity,
          maxStock: variant.stock_quantity,
        },
      ];
    });
  };

  const updateCartQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operation
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  return (
    <ShopContext.Provider
      value={{
        currentUser,
        loginUser,
        logoutUser,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}