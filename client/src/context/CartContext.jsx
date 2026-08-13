import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('nbc-cart');
    return saved? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nbc-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      // Check for existing item with same id + size + color
      const existing = prev.find(item =>
        item.id === product.id &&
        item.size === product.size &&
        item.color === product.color
      );

      if (existing) {
        return prev.map(item =>
          item.id === product.id &&
          item.size === product.size &&
          item.color === product.color
       ? {...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }

      // New item - generate cartItemId
      const cartItemId = `${product.id}_${product.size || 'nosize'}_${product.color || 'nocolor'}_${Date.now()}`;
      return [...prev,{...product, quantity: product.quantity || 1, cartItemId }];
    });
  };

  // Remove by cartItemId - matches your Cart.jsx
  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId!== cartItemId));
  };

  // Update by cartItemId - matches your Cart.jsx
  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.cartItemId === cartItemId
   ? {...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);