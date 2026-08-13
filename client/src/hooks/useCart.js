// src/hooks/useCart.js
import { useState } from 'react';

export function useCart() {
  const [orderItems, setOrderItems] = useState([]);

  const addToOrder = (item) => {
    setOrderItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => 
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      setOrderItems(prev => prev.filter(i => i.id !== id));
    } else {
      setOrderItems(prev => prev.map(i => 
        i.id === id ? { ...i, qty: newQty } : i
      ));
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const cartCount = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    orderItems,
    addToOrder,
    updateQty,
    clearOrder,
    cartCount,
    cartTotal
  };
}