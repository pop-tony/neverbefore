import axios from 'axios';
import React from 'react'
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const OrderContext = createContext();

export const normalizeOrderForClient = (order = {}) => {
  const shippingAddress = order.shipping_address || {};
  const sourceItems = order.items?.length ? order.items : order.order_items || [];
  const items = sourceItems.map((item) => ({
    id: item.id || item.product_id || '',
    product_id: item.product_id || item.id || '',
    name: item.name || item.product_name || '',
    product_name: item.product_name || item.name || '',
    price: Number(item.price ?? item.unit_price ?? 0),
    unit_price: Number(item.unit_price ?? item.price ?? 0),
    quantity: Number(item.quantity || 1),
    image: item.image || item.product?.image_url || item.product?.image || '',
    size: item.size || '',
    color: item.color || '',
  }));
  const firstItem = items[0] || {};
  const total = Number(order.total ?? order.total_amount ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0));

  return {
    ...order,
    items,
    order_items: items.map((item) => ({
      ...item,
      product_name: item.name,
      unit_price: item.price,
    })),
    total,
    total_amount: Number(order.total_amount ?? total),
    customerName: order.customerName || order.guest_name || shippingAddress.fullName || '',
    itemName: order.itemName || firstItem.name || '',
    address: order.address || shippingAddress.address || '',
    phone: order.phone || shippingAddress.phone || '',
    email: order.email || order.guest_email || shippingAddress.email || '',
    quantity: Number(order.quantity ?? firstItem.quantity ?? 0),
    price: order.price ?? String(firstItem.price || 0),
    image: order.image || firstItem.image || '',
    size: order.size || firstItem.size || '',
    color: order.color || firstItem.color || '',
    createdAt: order.createdAt || order.created_at || new Date().toISOString(),
    updatedAt: order.updatedAt || order.updated_at || order.createdAt || order.created_at,
    paymentRef: order.paymentRef || order.order_number || '',
  };
};

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('nbc-orders');
    return saved ? JSON.parse(saved).map(normalizeOrderForClient) : [];
  });
  const [isPolling, setIsPolling] = useState(false);
  const isInitialLoad = useRef(true);
  const pollIntervalRef = useRef(null);
  const configuredBase = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
  const backendUrl = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    localStorage.setItem('nbc-orders', JSON.stringify(orders));
  }, [orders]);

  const addOrderData = (orderData) => {
    const normalizedOrder = normalizeOrderForClient(orderData);
    setOrders(prev => {
      if (prev.some(o => o._id === normalizedOrder._id)) return prev;
      return [...prev, normalizedOrder];
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o =>
      o._id === orderId? {...o, status: newStatus, updatedAt: new Date().toISOString() } : o
    ));
  };

  // Poll server for status updates every 60s
  const checkOrderStatusUpdates = useCallback(async () => {
    if (isPolling ||!orders.length) return;

    // Only check non-terminal orders
    const ordersToCheck = orders.filter(o =>
    !['delivered', 'cancelled', 'returned'].includes(o.status) &&
    !o._id.startsWith('local_') // Skip unsynced local orders
    );

    if (!ordersToCheck.length) return;

    setIsPolling(true);
    try {
      const results = await Promise.allSettled(
        ordersToCheck.map(async (order) => {
          const res = await axios.get(`${backendUrl}/order/orders/track?orderId=${order._id}`);
          return res.data.success ? res.data.data || res.data.order : null;
        })
      );

      let updatedCount = 0;
      setOrders(prev => {
        const updated = [...prev];
        results.forEach((result, i) => {
          if (result.status === 'fulfilled' && result.value) {
            const serverOrder = normalizeOrderForClient(result.value);
            const localOrder = ordersToCheck[i];

            // Only update if status changed
            if (serverOrder.status!== localOrder.status) {
              const idx = updated.findIndex(o => o._id === localOrder._id);
              if (idx!== -1) {
                updated[idx] = {...updated[idx],...serverOrder };
                updatedCount++;
                toast.info(`Order #${localOrder._id.slice(-6).toUpperCase()} updated to ${serverOrder.status}`);
              }
            }
          }
        });
        return updated;
      });

      if (updatedCount > 0) {
        console.log(`[Orders] Updated ${updatedCount} order statuses`);
      }
    } catch (error) {
      console.error('[Orders] Poll failed:', error);
    } finally {
      setIsPolling(false);
    }
  }, [orders, backendUrl, isPolling]);

  // Start polling on mount, cleanup on unmount
  useEffect(() => {
    // Initial check after 5s, then every 60s
    const initialTimeout = setTimeout(checkOrderStatusUpdates, 5000);
    pollIntervalRef.current = setInterval(checkOrderStatusUpdates, 60000);

    return () => {
      clearTimeout(initialTimeout);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [checkOrderStatusUpdates]);

  // Retry syncing pending orders
  const syncPendingOrders = async () => {
    const pending = orders.filter(o => o.status === 'pending_sync');
    if (!pending.length) return;

    const results = await Promise.allSettled(
      pending.map(async (localOrder) => {
        const { _id, syncError, ...payload } = localOrder;
        const normalizedPayload = {
          items: payload.items?.map((item) => ({
            product_id: item.id || item.product_id,
            product_name: item.name || item.product_name,
            quantity: item.quantity,
            unit_price: item.price || item.unit_price,
            image: item.image || '',
            size: item.size || '',
            color: item.color || '',
          })) || [],
          shipping_address: {
            fullName: payload.customer?.name || payload.shipping_address?.fullName || payload.guest_name || '',
            phone: payload.customer?.phone || payload.shipping_address?.phone || '',
            address: payload.customer?.address || payload.shipping_address?.address || '',
            email: payload.customer?.email || payload.shipping_address?.email || payload.guest_email || '',
          },
          guest_email: payload.customer?.email || payload.shipping_address?.email || payload.guest_email || '',
          guest_name: payload.customer?.name || payload.shipping_address?.fullName || payload.guest_name || '',
          status: payload.status || 'pending',
          notes: payload.notes || 'Synced order',
          order_number: payload.paymentRef || payload.order_number,
        };

        const res = await axios.post(`${backendUrl}/order/orders`, normalizedPayload);
        if (res.data.success) {
          return { oldId: _id, newOrder: normalizeOrderForClient(res.data.order || res.data.data || payload) };
        }
        throw new Error(res.data.message);
      })
    );

    let syncedCount = 0;
    setOrders(prev => {
      let updated = [...prev];
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { oldId, newOrder } = result.value;
          updated = updated.map(o => o._id === oldId? newOrder : o);
          syncedCount++;
        }
      });
      return updated;
    });

    if (syncedCount) {
      toast.success(`Synced ${syncedCount} pending order${syncedCount > 1? 's' : ''}`);
    }

    const failedCount = pending.length - syncedCount;
    if (failedCount) {
      toast.error(`${failedCount} order${failedCount > 1? 's' : ''} still pending`);
    }
  };

  const ordersCount = orders.length;

  return (
    <OrderContext.Provider value={{
      orders,
      addOrderData,
      ordersCount,
      updateOrderStatus,
      syncPendingOrders,
      checkOrderStatusUpdates // Expose for manual refresh
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrderContext must be used within OrderProvider');
  return context;
};