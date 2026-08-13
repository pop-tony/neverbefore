import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../context/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, AlertCircle, RefreshCw, ShoppingBag, ChevronDown, ChevronUp, XCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  'pending_sync': {
    label: 'Pending Sync',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: AlertCircle
  },
  'pending': {
    label: 'Payment Pending',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: Clock
  },
  'paid': {
    label: 'Processing',
    color: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Package
  },
  'processing': {
    label: 'Processing',
    color: 'bg-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-500/10',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: Package
  },
  'shipped': {
    label: 'Shipped',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: Truck
  },
  'out_for_delivery': {
    label: 'Out for Delivery',
    color: 'bg-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: Truck
  },
  'delivered': {
    label: 'Delivered',
    color: 'bg-green-500',
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-500/10',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: CheckCircle
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'bg-red-500',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: XCircle
  },
  'returned': {
    label: 'Returned',
    color: 'bg-zinc-500',
    textColor: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-50 dark:bg-zinc-500/10',
    borderColor: 'border-zinc-200 dark:border-zinc-800',
    icon: RotateCcw
  }
};

const STATUS_GROUPS = {
  active: {
    label: 'Active',
    icon: Clock,
    statuses: ['pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'pending_sync']
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    statuses: ['delivered']
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    statuses: ['cancelled', 'returned']
  }
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[order.status] || statusConfig['pending'];
  const Icon = config.icon;
  const orderDate = new Date(order.createdAt || Date.now());
  const firstItem = order.items?.[0] || order;
  const itemCount = order.items?.length || order.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg dark:bg-zinc-900 ${config.borderColor}`}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className={`rounded-lg p-2 ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.textColor}`} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wide ${config.textColor}`}>
                {config.label}
              </span>
              {order.status === 'pending_sync' && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text- font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  OFFLINE
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              #{order._id?.slice(-8).toUpperCase() || 'LOCAL'}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {format(orderDate, 'MMM dd, yyyy • h:mm a')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-zinc-900 dark:text-white">
              ₵{order.total?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {itemCount} item{itemCount!== 1? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <img
            src={firstItem?.image || 'https://via.placeholder.com/56'}
            alt={firstItem?.name || 'Product'}
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-zinc-900 dark:text-white line-clamp-1">
              {firstItem?.name || 'Order'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {itemCount > 1 && `+${itemCount - 1} more • `}
              Qty: {firstItem?.quantity || 1}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {expanded? 'Hide Details' : 'View Details'}
          {expanded? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="space-y-3 p-6">
              <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Order Items
              </h4>
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      ₵{item.price} × {item.quantity}
                      {item.size && item.size!== 'N/A' && ` • Size: ${item.size}`}
                      {item.color && item.color!== 'N/A' && ` • ${item.color}`}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    ₵{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
              <button
                onClick={() => navigate(`/order/${order._id}`)}
                className="mt-4 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Track Order
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Orders = () => {
  const navigate = useNavigate();
  const { orders, syncPendingOrders, checkOrderStatusUpdates } = useOrderContext();
  const [activeGroup, setActiveGroup] = useState('active');
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const active = orders.filter(o => STATUS_GROUPS.active.statuses.includes(o.status));
    const completed = orders.filter(o => STATUS_GROUPS.delivered.statuses.includes(o.status));
    const totalSpent = orders.filter(o =>!STATUS_GROUPS.cancelled.statuses.includes(o.status))
   .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      active: active.length,
      completed: completed.length,
      cancelled: orders.filter(o => STATUS_GROUPS.cancelled.statuses.includes(o.status)).length,
      total: orders.length,
      totalSpent
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const groupStatuses = STATUS_GROUPS[activeGroup].statuses;
    return orders
   .filter(o => groupStatuses.includes(o.status))
   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, activeGroup]);

  const handleSync = async () => {
    setSyncing(true);
    await syncPendingOrders();
    setSyncing(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkOrderStatusUpdates();
    setRefreshing(false);
    toast.success('Orders refreshed');
  };

  const hasPendingSync = orders.some(o => o.status === 'pending_sync');

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-24 dark:bg-black">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
            <ShoppingBag className="h-16 w-16 text-zinc-400" />
          </div>
          <h1 className="mb-4 text-4xl font-black text-zinc-900 dark:text-white">No Orders Yet</h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            You haven't placed any orders. Start shopping to see them here.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="rounded-full bg-black px-8 py-3 font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-24 dark:bg-black">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              Your Orders
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Track and manage all your Never Before Cosmetic rituals
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mb-3 flex shrink-0 items-center gap-2 rounded-xl border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing? 'animate-spin' : ''}`} />
            {refreshing? 'Refreshing...' : 'Refresh'}
          </button>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Orders', value: stats.total, icon: Package },
              { label: 'Active', value: stats.active, icon: Clock },
              { label: 'Delivered', value: stats.completed, icon: CheckCircle },
              { label: 'Total Spent', value: `₵${stats.totalSpent.toLocaleString()}`, icon: ShoppingBag }
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Sync Banner */}
          {hasPendingSync && (
            <div className="mb-6 rounded-2xl border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-500/10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    You have orders pending sync
                  </p>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing? 'animate-spin' : ''}`} />
                  {syncing? 'Syncing...' : 'Retry Sync'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
          {Object.entries(STATUS_GROUPS).map(([key, group]) => {
            const Icon = group.icon;
            const count = orders.filter(o => group.statuses.includes(o.status)).length;
            const isActive = activeGroup === key;

            return (
              <button
                key={key}
                onClick={() => setActiveGroup(key)}
                className={`cursor-pointer flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${
                  isActive
                 ? 'border-black text-black dark:border-white dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {group.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive
                 ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders Grid */}
        <AnimatePresence mode="wait">
          {filteredOrders.length > 0? (
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              {filteredOrders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <Package className="mx-auto mb-4 h-16 w-16 text-zinc-300 dark:text-zinc-700" />
              <p className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                No {STATUS_GROUPS[activeGroup].label.toLowerCase()} orders
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
