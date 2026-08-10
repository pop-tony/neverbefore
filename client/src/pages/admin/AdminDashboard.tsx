import { useState, useEffect, useMemo } from 'react';
import { productsApi, ordersApi } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import {
  DollarSign, Package, TrendingUp, AlertTriangle,
  ArrowUp, ArrowDown, Minus, Clock, Truck, CheckCircle, XCircle,
} from 'lucide-react';

const LOGO_URL = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface OrderRow {
  _id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
}

interface ProductRow {
  _id: string;
  name: string;
  stock_quantity: number;
  price: number;
}

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100' },
  confirmed: { label: 'Processing', icon: Package, color: 'text-blue-700', bg: 'bg-blue-100' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  delivered: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-100' },
};

const LOW_STOCK_THRESHOLD = 10;

export function AdminDashboard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        ordersApi.list(),
        productsApi.list(),
      ]);
      setOrders(ordersData as unknown as OrderRow[]);
      setProducts(productsData as unknown as ProductRow[]);
    } catch {
      // leave empty
    }
    setLoading(false);
  };

  const revenueOrders = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled'),
    [orders]
  );

  const rangeDays = timeRange === 'daily' ? 7 : timeRange === 'weekly' ? 28 : 90;

  const revenueData = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; amount: number; date: Date }[] = [];

    if (timeRange === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        buckets.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), amount: 0, date: d });
      }
      revenueOrders.forEach((o) => {
        const orderDate = new Date(o.created_at);
        const bucket = buckets.find((b) => {
          const next = new Date(b.date);
          next.setDate(next.getDate() + 1);
          return orderDate >= b.date && orderDate < next;
        });
        if (bucket) bucket.amount += o.total_amount;
      });
    } else if (timeRange === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        buckets.push({ label: `Week ${4 - i}`, amount: 0, date: weekStart });
      }
      revenueOrders.forEach((o) => {
        const orderDate = new Date(o.created_at);
        for (let i = 0; i < buckets.length; i++) {
          const start = buckets[i].date;
          const end = new Date(start);
          end.setDate(end.getDate() + 7);
          if (orderDate >= start && orderDate < end) {
            buckets[i].amount += o.total_amount;
            break;
          }
        }
      });
    } else {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), amount: 0, date: d });
      }
      revenueOrders.forEach((o) => {
        const orderDate = new Date(o.created_at);
        const bucket = buckets.find((b) => {
          const next = new Date(b.date);
          next.setMonth(next.getMonth() + 1);
          return orderDate >= b.date && orderDate < next;
        });
        if (bucket) bucket.amount += o.total_amount;
      });
    }

    return buckets;
  }, [revenueOrders, timeRange]);

  const rangeStats = useMemo(() => {
    const now = new Date();
    const rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - rangeDays);

    const inRange = revenueOrders.filter((o) => new Date(o.created_at) >= rangeStart);
    const totalRevenue = inRange.reduce((sum, o) => sum + o.total_amount, 0);
    const orderCount = inRange.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const prevStart = new Date(rangeStart);
    prevStart.setDate(prevStart.getDate() - rangeDays);
    const prevRange = revenueOrders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= prevStart && d < rangeStart;
    });
    const prevRevenue = prevRange.reduce((sum, o) => sum + o.total_amount, 0);

    const revenueChange = prevRevenue > 0
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
      : totalRevenue > 0 ? 100 : 0;

    return { totalRevenue, orderCount, avgOrderValue, revenueChange };
  }, [revenueOrders, rangeDays]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }, [orders]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock_quantity < LOW_STOCK_THRESHOLD).sort((a, b) => a.stock_quantity - b.stock_quantity),
    [products]
  );

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [orders]
  );

  const maxRevenue = Math.max(...revenueData.map((d) => d.amount), 1);

  const formatCurrency = formatPrice;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCustomerName = (order: OrderRow) => {
    if (order.guest_name) return order.guest_name;
    if (order.guest_email) return order.guest_email;
    return 'Account Customer';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-stone-500">Loading your dashboard...</p>
      </div>
    );
  }

  const trendIcon = rangeStats.revenueChange > 0
    ? <ArrowUp className="w-4 h-4 text-emerald-600" />
    : rangeStats.revenueChange < 0
    ? <ArrowDown className="w-4 h-4 text-rose-600" />
    : <Minus className="w-4 h-4 text-stone-400" />;

  const trendColor = rangeStats.revenueChange > 0
    ? 'text-emerald-600'
    : rangeStats.revenueChange < 0
    ? 'text-rose-600'
    : 'text-stone-400';

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <img src={LOGO_URL} alt="Never Before Cosmetics" className="h-14 w-14 rounded-full object-cover ring-2 ring-amber-200 hidden sm:block" />
        <div>
          <h1 className="text-2xl font-light text-stone-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome back, Madam Jozy
          </h1>
          <p className="text-stone-500">Here's how your store is doing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              {trendIcon}
              {Math.abs(rangeStats.revenueChange).toFixed(0)}%
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-800">
            {formatCurrency(rangeStats.totalRevenue)}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Revenue ({timeRange === 'daily' ? 'last 7 days' : timeRange === 'weekly' ? 'last 4 weeks' : 'last 3 months'})
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-800">{rangeStats.orderCount}</p>
          <p className="text-sm text-stone-500 mt-1">Orders in this period</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-800">
            {formatCurrency(rangeStats.avgOrderValue)}
          </p>
          <p className="text-sm text-stone-500 mt-1">Average order value</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-medium text-stone-800">Sales Trend</h2>
            <p className="text-sm text-stone-500">Revenue over time</p>
          </div>
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {range === 'daily' ? 'Daily' : range === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 sm:gap-4 h-48">
          {revenueData.map((bucket, idx) => {
            const heightPct = (bucket.amount / maxRevenue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-rose-400 to-amber-300 rounded-t-md transition-all duration-500 hover:from-rose-500 hover:to-amber-400 relative"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                      {formatCurrency(bucket.amount)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-medium">{bucket.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-stone-800 mb-1">Order Status</h2>
          <p className="text-sm text-stone-500 mb-5">Where your orders stand right now</p>
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const meta = STATUS_META[status];
              const Icon = meta.icon;
              const total = orders.length || 1;
              const pct = (count / total) * 100;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-stone-700">{meta.label}</span>
                      <span className="text-sm text-stone-500">{count}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${meta.bg}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-medium text-stone-800">Inventory Alerts</h2>
          </div>
          <p className="text-sm text-stone-500 mb-5">
            Products running low (under {LOW_STOCK_THRESHOLD} in stock)
          </p>
          {lowStockProducts.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-700">All products are well stocked.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
                  <span className="text-sm font-medium text-stone-700 truncate pr-2">
                    {product.name}
                  </span>
                  <span className={`text-sm font-semibold flex-shrink-0 ${
                    product.stock_quantity === 0 ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} left`}
                  </span>
                </div>
              ))}
              {lowStockProducts.length > 6 && (
                <p className="text-xs text-stone-400 pt-1">
                  +{lowStockProducts.length - 6} more products need restocking
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-lg font-medium text-stone-800">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((order) => {
                  const meta = STATUS_META[order.status] || STATUS_META.pending;
                  return (
                    <tr key={order._id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                        {getCustomerName(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
