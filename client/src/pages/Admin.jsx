import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Calendar, CreditCard, Package, Truck, CheckCircle, Clock, AlertCircle, RefreshCw, ShoppingBag, XCircle, RotateCcw, Search, ChevronDown, ChevronUp, X, Plus, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setSiteContentCache } from '../hooks/useSiteContent';
import { normalizeOrderForClient } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value) => `₵${Number(value ?? 0).toLocaleString()}`;

const StatCard = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const Arrow = isPositive? '▲' : '▼';

  return (
    <div className={`rounded-2xl p-6 shadow-lg ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      {change!== undefined && (
        <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${changeColor}`}>
          <span>{Arrow}</span>
          <span>{Math.abs(change)}%</span>
          <span className="text-zinc-500 dark:text-zinc-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: { color: 'bg-yellow-500', label: 'Pending' },
    paid: { color: 'bg-blue-500', label: 'Paid' },
    processing: { color: 'bg-orange-500', label: 'Processing' },
    shipped: { color: 'bg-purple-500', label: 'Shipped' },
    delivered: { color: 'bg-green-500', label: 'Delivered' },
    cancelled: { color: 'bg-red-500', label: 'Closed' },
    returned: { color: 'bg-zinc-500', label: 'Returned' },
    confirmed: { color: 'bg-green-500', label: 'Resolved' },
    completed: { color: 'bg-blue-500', label: 'Completed' },
    'no-show': { color: 'bg-zinc-500', label: 'No Show' },
    pending_sync: { color: 'bg-amber-500', label: 'Pending Sync' },
    out_for_delivery: { color: 'bg-indigo-500', label: 'Out for Delivery' }
  };
  const c = config[status] || config.pending;
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${c.color}`}>{c.label}</span>;
};

// Status groups for filtering
const ORDER_STATUS_GROUPS = {
  all: {
    label: 'All Orders',
    icon: Package,
    statuses: null // null = show all
  },
  pending_sync: {
    label: 'Pending Sync',
    icon: AlertCircle,
    statuses: ['pending_sync']
  },
  pending: {
    label: 'Payment Pending',
    icon: Clock,
    statuses: ['pending']
  },
  paid: {
    label: 'Paid',
    icon: CheckCircle,
    statuses: ['paid']
  },
  processing: {
    label: 'Processing',
    icon: Package,
    statuses: ['processing']
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    statuses: ['shipped', 'out_for_delivery']
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

export const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [styleSessions, setStyleSessions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', price: '', quantity: '', description: '', brand: '', color: '', category: '', discount: '0',
    image: null, video: null, imagePreview: null, featured: false, topSell: false
  });

  const configuredBase = (import.meta.env.VITE_BACKEND_URL || '/api').replace(/\/+$/, '');
  const backendUrl = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;
  const [siteContent, setSiteContent] = useState(null);
  const [settingsSection, setSettingsSection] = useState('brand');
  const [designatedAdminInput, setDesignatedAdminInput] = useState('');
  const designatedAdminEmails = siteContent?.designated_admin_emails || [];
  const currentUserEmail = user?.email?.trim().toLowerCase();
  const canManageAdmins = designatedAdminEmails.some((email) => email.trim().toLowerCase() === currentUserEmail);

  const settingSections = [
    { id: 'brand', label: 'Brand & home', description: 'Hero and identity' },
    { id: 'shop', label: 'Shop', description: 'Catalog and categories' },
    { id: 'contact', label: 'Contact', description: 'Support and footer' },
    { id: 'pages', label: 'Navigation', description: 'Labels and menus' },
    { id: 'access', label: 'Access', description: 'Admin messaging' },
  ];
  
  // Fetch products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/product/products`, { withCredentials: true });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch admin users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/admin/users`, { withCredentials: true });
      if (res.data.success) setUsers(res.data.users || []);
    } catch (error) {
      console.error('Failed to load users', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, image: reader.result, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, video: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const { name, price, quantity, image, description, brand, color, category, discount, featured, topSell } = productForm;
    if (!name || !price || !quantity || !image) {
      toast.error('Name, price, quantity and image are required');
      return;
    }
    try {
      const res = await axios.post(`${backendUrl}/admin/products`, {
        name,
        price: Number(price),
        quantity: Number(quantity),
        image,
        video: productForm.video || undefined,
        description,
        brand,
        color,
        category,
        discount: Number(discount) || 0,
        featured: !!featured,
        topSell: !!topSell,
      }, { withCredentials: true });
      if (res.data.success) {
        toast.success('Product created successfully!');
        setShowProductForm(false);
        setProductForm({ name: '', price: '', quantity: '', description: '', brand: '', color: '', category: '', discount: '0', image: null, video: null, imagePreview: null, featured: false, topSell: false });
        fetchProducts();
      } else {
        toast.error(res.data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await axios.delete(`${backendUrl}/admin/products/${productId}`, { withCredentials: true });
      if (res.data.success) {
        toast.success('Product deleted!');
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        toast.error(res.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product');
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeOrderModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await axios.get(`${backendUrl}/order/orders`, { withCredentials: true });
        if (res.data.success) {
          setOrders((res.data.orders || []).map(normalizeOrderForClient));
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load orders');
      }
    };

    const getContent = async () => {
      try {
        const res = await axios.get(`${backendUrl}/content/site-content`);
        if (res.data.success) setSiteContent(res.data.content);
      } catch (err) {
        console.error('Failed to load site content', err);
      }
    };

    const getSections = async () => {
      try {
        const res = await axios.get(`${backendUrl}/order/c-data`, { withCredentials: true });
        if (res.data.success) {
          setStyleSessions(res.data.consults);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load sessions');
      }
    };

    Promise.all([getOrders(), getSections(), getContent()]).finally(() => setLoading(false));
  }, [backendUrl]);

  const handleContentChange = (key, value) => {
    setSiteContent(prev => ({ ...(prev || {}), [key]: value }));
  };

  const saveSiteContent = async () => {
    try {
      const res = await axios.put(`${backendUrl}/content/site-content`, siteContent, { withCredentials: true });
      if (res.data.success) {
        const updatedContent = { ...siteContent, ...(res.data.content || {}) };
        setSiteContent(updatedContent);
        setSiteContentCache(updatedContent);
        toast.success('Site content updated');
      } else {
        toast.error(res.data.message || 'Failed to update content');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update content');
    }
  };

  // Build customers from orders
  useEffect(() => {
    if (!orders?.length) return;

    const customerMap = orders
  .filter(order => order.status!== 'cancelled' && order.email)
  .reduce((acc, order) => {
        const email = order.email;
        if (!acc[email]) {
          acc[email] = {
            _id: email,
            name: order.customerName,
            email: email,
            orders: 0,
            totalSpent: 0,
            lastOrder: order.createdAt
          };
        }
        acc[email].orders += 1;
        acc[email].totalSpent += order.total || 0;
        if (new Date(order.createdAt) > new Date(acc[email].lastOrder)) {
          acc[email].lastOrder = order.createdAt;
        }
        return acc;
      }, {});

    setCustomers(Object.values(customerMap));
  }, [orders]);

  // Analytics
  const analytics = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalRevenueChange: 0,
        todayRevenue: 0,
        todayRevenueChange: 0,
        activeOrders: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalCustomersChange: 0,
        revenueData: [],
        topCategories: []
      };
    }

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd); yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return { date: d, day: days[d.getDay()], revenue: 0 };
    });

    let totalRevenue = 0;
    let thisWeekRevenue = 0;
    let lastWeekRevenue = 0;
    let todayRevenue = 0;
    let yesterdayRevenue = 0;
    let activeOrders = 0;
    const salesByItem = {};
    const thisWeekCustomerEmails = new Set();
    const lastWeekCustomerEmails = new Set();

    orders.forEach(o => {
      const d = new Date(o.createdAt || o.created_at);
      const isCancelled = ['cancelled', 'returned'].includes(o.status);

      if (!isCancelled) {
        totalRevenue += o.total || 0;
        if (d >= weekAgo) {
          thisWeekRevenue += o.total || 0;
          if (o.email) thisWeekCustomerEmails.add(o.email);
        }
        if (d >= twoWeeksAgo && d < weekAgo) {
          lastWeekRevenue += o.total || 0;
          if (o.email) lastWeekCustomerEmails.add(o.email);
        }
        if (d >= todayStart && d <= todayEnd) todayRevenue += o.total || 0;
        if (d >= yesterdayStart && d <= yesterdayEnd) yesterdayRevenue += o.total || 0;

        const dayIdx = last7Days.findIndex(day => {
          const next = new Date(day.date);
          next.setDate(next.getDate() + 1);
          return d >= day.date && d < next;
        });
        if (dayIdx!== -1) last7Days[dayIdx].revenue += o.total || 0;

        const items = o.items?.length ? o.items : [{ name: o.itemName, quantity: o.quantity || 1, price: o.total }];
        items.forEach(item => {
          const name = item.name || item.product_name || item.itemName || 'Unknown';
          if (!salesByItem[name]) salesByItem[name] = { name, value: 0 };
          salesByItem[name].value += item.quantity || 1;
        });
      }

      if (['paid', 'processing', 'shipped', 'out_for_delivery'].includes(o.status)) activeOrders++;
    });

    const getChange = (current, previous) => {
      if (!previous) return current > 0? 100 : 0;
      return +(((current - previous) / previous) * 100).toFixed(1);
    };

    return {
      totalRevenue: Math.round(totalRevenue),
      thisWeekRevenue: Math.round(thisWeekRevenue),
      totalRevenueChange: getChange(thisWeekRevenue, lastWeekRevenue),
      todayRevenue: Math.round(todayRevenue),
      todayRevenueChange: getChange(todayRevenue, yesterdayRevenue),
      activeOrders,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalCustomersChange: getChange(thisWeekCustomerEmails.size, lastWeekCustomerEmails.size),
      revenueData: last7Days.map(d => ({ day: d.day, revenue: Math.round(d.revenue) })),
      topCategories: Object.values(salesByItem).sort((a, b) => b.value - a.value).slice(0, 4)
    };
  }, [orders, customers]);

  // Get counts per status for tab badges
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    Object.entries(ORDER_STATUS_GROUPS).forEach(([key, group]) => {
      if (group.statuses) {
        counts[key] = orders.filter(o => group.statuses.includes(o.status)).length;
      }
    });
    return counts;
  }, [orders]);

  // Filter orders by status group + search
  const filteredOrders = useMemo(() => {
    const group = ORDER_STATUS_GROUPS[orderStatusFilter];
    let filtered = group.statuses
  ? orders.filter(o => group.statuses.includes(o.status))
      : orders;

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      filtered = filtered.filter(o =>
        o._id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.itemName?.toLowerCase().includes(q) ||
        o.items?.some(i => i.name?.toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, orderStatusFilter, orderSearch]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`${backendUrl}/order/orders/${orderId}/status`, { status: newStatus }, { withCredentials: true });
      if (res.data.success) {
        toast.success('Status updated!');
        setOrders(prev => prev.map(o => o._id === orderId? {...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order');
    }
  };

  const updateEnquiryStatus = async (enquiryId, newStatus) => {
    try {
      const res = await axios.put(`${backendUrl}/order/update-consult`, {
        consultId: enquiryId,
        status: newStatus
      }, { withCredentials: true });
      if (res.data.success) {
        toast.success('Enquiry updated!');
        setStyleSessions(prev => prev.map(e => e._id === enquiryId? {...e, status: newStatus } : e));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update enquiry');
    }
  };

  const refreshOrders = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${backendUrl}/order/orders`, { withCredentials: true });
      if (res.data.success) {
        setOrders((res.data.orders || []).map(normalizeOrderForClient));
        toast.success('Orders refreshed');
      }
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'site-settings', label: 'Site Settings', icon: '⚙️' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '🛍' },
    { id: 'sessions', label: 'Enquiries', icon: '✨' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'users', label: 'Users', icon: '👥' },
  ];
  
  // Fetch products when products tab is active
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-neutral-950">
        <div className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">Loading dashboard...</div>
      </div>
    );
  }

  const OrderModal = () => {
    if (!selectedOrder) return null;
  
    const order = selectedOrder;
    const items = order.items || [{
      name: order.itemName,
      image: order.image,
      size: order.size,
      color: order.color,
      quantity: order.quantity || 1,
      price: order.total
    }];
  
    return (
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOrderModal}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
  
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                      Order Details
                    </h2>
                    <p className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={closeOrderModal}
                    className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
  
                {/* Content */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 88px)' }}>
                  <div className="grid gap-6 lg:grid-cols-5">
                    {/* Left Column - 2 cols */}
                    <div className="space-y-6 lg:col-span-2">
                      {/* Status & Date */}
                      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <Package className="h-4 w-4" /> Order Status
                        </h3>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={order.status} />
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Placed on</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
  
                      {/* Customer Info */}
                      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <Mail className="h-4 w-4" /> Customer
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {order.customerName}
                            </p>
                          </div>
                          <a
                            href={`mailto:${order.email}`}
                            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-[#C5A059] dark:text-zinc-400 dark:hover:text-[#C5A059]"
                          >
                            <Mail className="h-4 w-4" />
                            {order.email}
                          </a>
                          <a
                            href={`tel:${order.phone}`}
                            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-[#C5A059] dark:text-zinc-400 dark:hover:text-[#C5A059]"
                          >
                            <Phone className="h-4 w-4" />
                            {order.phone}
                          </a>
                        </div>
                      </div>
  
                      {/* Delivery Address */}
                      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <MapPin className="h-4 w-4" /> Delivery Address
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {order.address}
                        </p>
                      </div>
                    </div>
  
                    {/* Right Column - 3 cols */}
                    <div className="space-y-6 lg:col-span-3">
                      {/* Order Items - DETAILED */}
                      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                        <h3 className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-2">
                            <Package className="h-4 w-4" /> Order Items
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] dark:bg-zinc-800">
                            {items.length} {items.length === 1? 'Item' : 'Items'}
                          </span>
                        </h3>
                        <div className="space-y-4">
                          {items.map((item, i) => (
                            <div key={i} className="flex gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                              <img
                                src={item.image || 'https://via.placeholder.com/80'}
                                alt={item.name}
                                className="h-20 w-20 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                              />
                              <div className="flex-1 space-y-2">
                                <p className="font-bold text-zinc-900 dark:text-white">
                                  {item.name}
                                </p>
  
                                {/* Product Details Grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 dark:text-zinc-400">Quantity:</span>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                      {item.quantity || 1}
                                    </span>
                                  </div>
  
                                  {item.size && item.size!== 'N/A' && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 dark:text-zinc-400">Size:</span>
                                      <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700">
                                        {item.size}
                                      </span>
                                    </div>
                                  )}
  
                                  {item.color && item.color!== 'N/A' && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 dark:text-zinc-400">Color:</span>
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className="h-4 w-4 rounded-full ring-2 ring-white dark:ring-zinc-900"
                                          style={{ backgroundColor: item.color }}
                                        />
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
                                          {item.color}
                                        </span>
                                      </div>
                                    </div>
                                  )}
  
                                  {item.sku && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-500 dark:text-zinc-400">SKU:</span>
                                      <span className="font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                                        {item.sku}
                                      </span>
                                    </div>
                                  )}
                                </div>
  
                                {/* Price */}
                                <div className="flex items-baseline gap-2 pt-1">
                                  <span className="text-lg font-black text-[#C5A059]">
                                    {formatCurrency((item.price || order.total / items.length) * (item.quantity || 1))}
                                  </span>
                                  {item.quantity > 1 && (
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                      ({formatCurrency(item.price || order.total / items.length)} each)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
  
                      {/* Payment Summary */}
                      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <CreditCard className="h-4 w-4" /> Payment Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              {formatCurrency(order.subtotal ?? order.total)}
                            </span>
                          </div>
                          {order.shipping > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                              <span className="font-semibold text-zinc-900 dark:text-white">
                                {formatCurrency(order.shipping)}
                              </span>
                            </div>
                          )}
                          {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-600 dark:text-zinc-400">Discount</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                -{formatCurrency(order.discount)}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                            <div className="flex justify-between">
                              <span className="text-base font-bold text-zinc-900 dark:text-white">Total</span>
                              <span className="text-2xl font-black text-rose-500">
                                {formatCurrency(order.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
                        <h3 className="mb-4 text-lg font-bold">Site Content (Quick Edit)</h3>
                        {!siteContent ? (
                          <p className="text-sm text-zinc-500">Loading content...</p>
                        ) : (
                          <div className="grid gap-4">
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Brand Name</label>
                              <input
                                type="text"
                                value={siteContent.brand_name || ''}
                                onChange={(e) => handleContentChange('brand_name', e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Hero Title</label>
                              <input
                                type="text"
                                value={siteContent.hero_title || ''}
                                onChange={(e) => handleContentChange('hero_title', e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Hero Subtitle</label>
                              <input
                                type="text"
                                value={siteContent.hero_subtitle || ''}
                                onChange={(e) => handleContentChange('hero_subtitle', e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button onClick={saveSiteContent} className="rounded-lg bg-[#C5A059] px-4 py-2 text-sm font-bold text-white">Save Content</button>
                              <button onClick={() => window.location.reload()} className="rounded-lg border px-4 py-2 text-sm">Discard</button>
                            </div>
                          </div>
                        )}
                      </div>
  
                      {/* Update Status */}
                      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <Truck className="h-4 w-4" /> Update Status
                        </h3>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            updateOrderStatus(order._id, e.target.value);
                            setSelectedOrder({...order, status: e.target.value });
                          }}
                          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  };  

  return (
    <div className="mt-5 min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Manage orders, sessions & track performance</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-semibold transition ${
                activeTab === tab.id
            ? 'border-[#C5A059] text-[#C5A059]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="rounded-3xl border border-zinc-200 bg-gradient-to-r from-[#F6EAD2] via-white to-[#FBF7F2] p-6 shadow-sm dark:border-zinc-800 dark:from-[#1D1D1B] dark:via-[#151515] dark:to-[#111827]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#C5A059]">Performance overview</p>
                  <h2 className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">Admin Dashboard</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/30 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] dark:bg-zinc-900/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live data
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Revenue this week</p>
                  <p className="mt-3 text-2xl font-black text-zinc-900 dark:text-white">{formatCurrency(analytics.thisWeekRevenue)}</p>
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">+{analytics.totalRevenueChange || 0}% vs last week</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Active orders</p>
                  <p className="mt-3 text-2xl font-black text-zinc-900 dark:text-white">{analytics.activeOrders}</p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Processing and dispatch</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Customer base</p>
                  <p className="mt-3 text-2xl font-black text-zinc-900 dark:text-white">{analytics.totalCustomers}</p>
                  <p className="mt-2 text-xs text-violet-600 dark:text-violet-400">+{analytics.totalCustomersChange || 0}% growth</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Total orders</p>
                  <p className="mt-3 text-2xl font-black text-zinc-900 dark:text-white">{analytics.totalOrders}</p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">All order statuses</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(analytics.totalRevenue)}
                icon="💰"
                color="bg-green-100 dark:bg-green-900/30"
              />
              <StatCard
                title="This Week"
                value={formatCurrency(analytics.thisWeekRevenue)}
                change={analytics.totalRevenueChange}
                icon="📈"
                color="bg-green-100 dark:bg-green-900/30"
              />
              <StatCard
                title="Today's Revenue"
                value={formatCurrency(analytics.todayRevenue)}
                change={analytics.todayRevenueChange}
                icon="📊"
                color="bg-blue-100 dark:bg-blue-900/30"
              />
              <StatCard
                title="Active Orders"
                value={analytics.activeOrders}
                icon="📦"
                color="bg-[#C5A059]/10 dark:bg-[#C5A059]/20"
              />
              <StatCard
                title="Customers"
                value={analytics.totalCustomers}
                change={analytics.totalCustomersChange}
                icon="👥"
                color="bg-purple-100 dark:bg-purple-900/30"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-bold">Revenue This Week</h3>
                {analytics.revenueData.some(d => d.revenue > 0)? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h- items-center justify-center text-zinc-500">No revenue data for the last 7 days</div>
                )}
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-bold">Top Categories</h3>
                {analytics.topCategories.length? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        tickFormatter={(name) => name.length > 12? `${name.slice(0, 12)}...` : name}
                      />
                      <YAxis stroke="#9ca3af" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        cursor={{ fill: 'rgba(197, 160, 89, 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#C5A059" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h- items-center justify-center text-zinc-500">No sales data yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Site Settings Tab */}
        {activeTab === 'site-settings' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059]">Brand Controls</p>
                <h2 className="mt-2 text-3xl font-black text-zinc-900 dark:text-white">Site Settings</h2>
              </div>
              <button
                onClick={saveSiteContent}
                className="rounded-xl bg-[#C5A059] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B08D4F]"
              >
                Save all changes
              </button>
            </div>

            {!siteContent ? (
              <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                Loading site settings...
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mb-3 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Sections</p>
                  </div>
                  <nav className="space-y-2">
                    {settingSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setSettingsSection(section.id)}
                        className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                          settingsSection === section.id
                            ? 'border-[#C5A059]/50 bg-[#C5A059]/10 text-[#C5A059] shadow-sm'
                            : 'border-transparent bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="text-sm font-bold">{section.label}</div>
                        <div className="mt-1 text-[11px] opacity-75">{section.description}</div>
                      </button>
                    ))}
                  </nav>
                </aside>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  {settingsSection === 'brand' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Brand</p>
                          <h3 className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">Identity & home banner</h3>
                        </div>
                        <span className="rounded-full bg-[#C5A059]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C5A059]">Live</span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Brand name</label>
                          <input value={siteContent.brand_name || ''} onChange={(e) => handleContentChange('brand_name', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Brand logo</label>
                          <div className="space-y-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
                            <div className="flex items-center gap-4">
                              {(siteContent.logo_url || '').trim() ? (
                                <img
                                  src={siteContent.logo_url}
                                  alt="Brand logo preview"
                                  className="h-20 w-20 rounded-full border border-[#C5A059]/20 bg-white object-cover p-2 shadow-sm"
                                />
                              ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
                                  Logo
                                </div>
                              )}
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      handleContentChange('logo_url', reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                  className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#C5A059] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.2em] file:text-white hover:file:bg-[#B08D4F] dark:text-zinc-300"
                                />
                                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                  Upload a square logo image. It will be saved with the site settings.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Brand tagline</label>
                          <input value={siteContent.brand_tagline || ''} onChange={(e) => handleContentChange('brand_tagline', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Hero badge</label>
                          <input value={siteContent.hero_badge || ''} onChange={(e) => handleContentChange('hero_badge', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">CTA label</label>
                          <input value={siteContent.hero_cta_label || ''} onChange={(e) => handleContentChange('hero_cta_label', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Hero title</label>
                          <input value={siteContent.hero_title || ''} onChange={(e) => handleContentChange('hero_title', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Hero subtitle</label>
                          <textarea rows={4} value={siteContent.hero_subtitle || ''} onChange={(e) => handleContentChange('hero_subtitle', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">CTA link</label>
                          <input value={siteContent.hero_cta_href || ''} onChange={(e) => handleContentChange('hero_cta_href', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSection === 'shop' && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Shop</p>
                        <h3 className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">Catalog messaging</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Shop heading</label>
                          <input value={siteContent.shop_heading || ''} onChange={(e) => handleContentChange('shop_heading', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Shop subheading</label>
                          <input value={siteContent.shop_subheading || ''} onChange={(e) => handleContentChange('shop_subheading', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Product data source</label>
                          <select
                            value={siteContent.product_source || 'mock'}
                            onChange={(e) => handleContentChange('product_source', e.target.value)}
                            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                          >
                            <option value="mock">Use mock products from the app</option>
                            <option value="database">Load products from the database</option>
                          </select>
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Save all changes to apply this catalog source across the storefront.</p>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Category heading</label>
                          <input value={siteContent.category_heading || ''} onChange={(e) => handleContentChange('category_heading', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Category subtitle</label>
                          <input value={siteContent.category_subtitle || ''} onChange={(e) => handleContentChange('category_subtitle', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Empty state title</label>
                          <input value={siteContent.empty_title || ''} onChange={(e) => handleContentChange('empty_title', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Empty state message</label>
                          <textarea rows={3} value={siteContent.empty_message || ''} onChange={(e) => handleContentChange('empty_message', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSection === 'contact' && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Contact</p>
                        <h3 className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">Support & footer</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Support email</label>
                          <input type="email" value={siteContent.support_email || ''} onChange={(e) => handleContentChange('support_email', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Support phone</label>
                          <input value={siteContent.support_phone || ''} onChange={(e) => handleContentChange('support_phone', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Contact heading</label>
                          <input value={siteContent.contact_heading || ''} onChange={(e) => handleContentChange('contact_heading', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Contact note</label>
                          <textarea rows={4} value={siteContent.contact_note || ''} onChange={(e) => handleContentChange('contact_note', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Footer note</label>
                          <textarea rows={3} value={siteContent.footer_note || ''} onChange={(e) => handleContentChange('footer_note', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSection === 'pages' && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Navigation</p>
                        <h3 className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">Menu labels</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Home</label>
                          <input value={siteContent.navigation_home || ''} onChange={(e) => handleContentChange('navigation_home', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Shop</label>
                          <input value={siteContent.navigation_shop || ''} onChange={(e) => handleContentChange('navigation_shop', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Cart</label>
                          <input value={siteContent.navigation_cart || ''} onChange={(e) => handleContentChange('navigation_cart', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Contact</label>
                          <input value={siteContent.navigation_contact || ''} onChange={(e) => handleContentChange('navigation_contact', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Categories</label>
                          <input value={siteContent.navigation_categories || ''} onChange={(e) => handleContentChange('navigation_categories', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Orders</label>
                          <input value={siteContent.navigation_orders || ''} onChange={(e) => handleContentChange('navigation_orders', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSection === 'access' && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Access</p>
                        <h3 className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">Admin messaging</h3>
                      </div>
                      {canManageAdmins && (
                        <div className="rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/5 p-4 dark:bg-[#C5A059]/10">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B6D36] dark:text-[#E8D29E]">Designated admins</p>
                          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Designated admins can manage admin access. You may add another designated admin or revoke only your own designation.</p>
                          <div className="mt-4 space-y-2">
                            {designatedAdminEmails.map((email) => (
                              <div key={email} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm dark:bg-zinc-900">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{email}</span>
                                {email.trim().toLowerCase() === currentUserEmail && designatedAdminEmails.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleContentChange('designated_admin_emails', designatedAdminEmails.filter((item) => item.trim().toLowerCase() !== currentUserEmail))}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400"
                                  >
                                    Revoke my designation
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <input
                              type="email"
                              value={designatedAdminInput}
                              onChange={(e) => setDesignatedAdminInput(e.target.value)}
                              placeholder="new-admin@example.com"
                              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const email = designatedAdminInput.trim().toLowerCase();
                                if (!email || !email.includes('@')) {
                                  toast.error('Enter a valid admin email');
                                  return;
                                }
                                if (designatedAdminEmails.some((item) => item.trim().toLowerCase() === email)) {
                                  toast.error('That email is already designated');
                                  return;
                                }
                                handleContentChange('designated_admin_emails', [...designatedAdminEmails, email]);
                                setDesignatedAdminInput('');
                              }}
                              className="rounded-xl bg-[#C5A059] px-4 py-2 text-sm font-bold text-white hover:bg-[#B08D4F]"
                            >
                              Add designated admin
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Access title</label>
                          <input value={siteContent.admin_access_title || ''} onChange={(e) => handleContentChange('admin_access_title', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Access message</label>
                          <textarea rows={3} value={siteContent.admin_access_message || ''} onChange={(e) => handleContentChange('admin_access_message', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Access note</label>
                          <textarea rows={3} value={siteContent.admin_access_note || ''} onChange={(e) => handleContentChange('admin_access_note', e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Products</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="flex items-center gap-2 rounded-lg bg-[#C5A059] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#B08D4F]"
              >
                <Plus className="h-4 w-4" />
                {showProductForm ? 'Cancel' : 'Add Product'}
              </button>
            </div>

            {/* Add Product Form */}
            <AnimatePresence>
              {showProductForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <form onSubmit={handleCreateProduct} className="p-6">
                    <h3 className="mb-4 text-lg font-bold">New Product</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Name *</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          placeholder="Product name"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Quantity *</label>
                        <input
                          type="number"
                          value={productForm.quantity}
                          onChange={(e) => setProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Brand</label>
                        <input
                          type="text"
                          value={productForm.brand}
                          onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          placeholder="Brand name"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
                        <input
                          type="text"
                          value={productForm.category}
                          onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          placeholder="Skincare, Makeup, Body..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Color</label>
                        <input
                          type="text"
                          value={productForm.color}
                          onChange={(e) => setProductForm(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          placeholder="Color"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Discount (%)</label>
                        <input
                          type="number"
                          value={productForm.discount}
                          onChange={(e) => setProductForm(prev => ({ ...prev, discount: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          placeholder="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                          rows={3}
                          placeholder="Product description"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Image *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageChange}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-[#C5A059] file:px-2 file:py-1 file:text-xs file:text-white dark:border-zinc-700 dark:bg-zinc-800"
                        />
                        {productForm.imagePreview && (
                          <img src={productForm.imagePreview} alt="Preview" className="mt-2 h-20 w-20 rounded-lg object-cover ring-1 ring-zinc-200" />
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-500">Video (optional)</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleProductVideoChange}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-[#C5A059] file:px-2 file:py-1 file:text-xs file:text-white dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                            className="h-4 w-4 rounded border-zinc-300 text-[#C5A059] focus:ring-[#C5A059]"
                          />
                          <span className="text-sm font-semibold">Featured</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={productForm.topSell}
                            onChange={(e) => setProductForm(prev => ({ ...prev, topSell: e.target.checked }))}
                            className="h-4 w-4 rounded border-zinc-300 text-[#C5A059] focus:ring-[#C5A059]"
                          />
                          <span className="text-sm font-semibold">Top Sell</span>
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-6 rounded-lg bg-[#C5A059] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#B08D4F]"
                    >
                      Create Product
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-lg font-semibold text-zinc-500">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-lg dark:bg-zinc-900">
                <Package className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-500">No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map(product => (
                  <div key={product._id} className="group relative rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                      <img
                        src={product.image || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      {product.featured && (
                        <span className="absolute left-2 top-2 rounded-full bg-[#C5A059] px-2 py-0.5 text-[10px] font-bold text-white">Featured</span>
                      )}
                      {product.topSell && (
                        <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">Top Sell</span>
                      )}
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-0 shadow transition hover:bg-red-500 hover:text-white group-hover:opacity-100 dark:bg-zinc-800/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{product.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{product.description || product.brand || ''}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-black text-[#C5A059]">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Stock: {product.quantity}
                        </span>
                      </div>
                      {product.discount > 0 && (
                        <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {product.discount}% OFF
                        </span>
                      )}
                      <div className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                        ID: {product._id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold">All Orders</h2>
              <div className="flex gap-2">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
                <button
                  onClick={refreshOrders}
                  disabled={refreshing}
                  className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
              {Object.entries(ORDER_STATUS_GROUPS).map(([key, group]) => {
                const Icon = group.icon;
                const count = statusCounts[key] || 0;
                const isActive = orderStatusFilter === key;

                return (
                  <button
                    key={key}
                    onClick={() => setOrderStatusFilter(key)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${
                      isActive
                   ? 'border-[#C5A059] text-[#C5A059]'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {group.label}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                   ? 'bg-[#C5A059] text-white'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Order</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Customer</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Items</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Date</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    <AnimatePresence>
                      {filteredOrders.map((order, idx) => {
                        return (
                          <motion.tr
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => openOrderModal(order)}
                            className="group cursor-pointer transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                          >
                            {/* Order ID */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                                  #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  {order.items?.length || 1} item{order.items?.length!== 1? 's' : ''}
                                </span>
                              </div>
                            </td>

                            {/* Customer + Contact */}
                            <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                  {order.customerName}
                                </span>
                                <a
                                  href={`mailto:${order.email}`}
                                  className="text-[11px] text-zinc-500 hover:text-[#C5A059] dark:text-zinc-400 dark:hover:text-[#C5A059]"
                                >
                                  {order.email}
                                </a>
                                <a
                                  href={`tel:${order.phone}`}
                                  className="text-[11px] text-zinc-500 hover:text-[#C5A059] dark:text-zinc-400 dark:hover:text-[#C5A059]"
                                >
                                  {order.phone}
                                </a>
                              </div>
                            </td>

                            {/* Product + Variant */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={order.items?.[0]?.image || order.image || 'https://via.placeholder.com/40'}
                                  alt={order.items?.[0]?.name || order.itemName}
                                  className="h-10 w-10 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">
                                    {order.items?.[0]?.name || order.itemName}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {order.items?.[0]?.size && order.items?.[0]?.size!== 'N/A' && (
                                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                        {order.items?.[0]?.size}
                                      </span>
                                    )}
                                    {order.items?.[0]?.color && order.items?.[0]?.color!== 'N/A' && (
                                      <span
                                        className="h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-zinc-900"
                                        style={{ backgroundColor: order.items?.[0]?.color }}
                                        title={order.items?.[0]?.color}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Total */}
                            <td className="px-5 py-4">
                              <span className="text-lg font-black text-[#C5A059]">
                                {formatCurrency(order.total)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <StatusBadge status={order.status} />
                            </td>

                            {/* Date */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-zinc-400 focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                              </select>
                            </td>
                          </motion.tr>

                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="py-20 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      No orders found
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Style Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Enquiries</h2>
              <span className="rounded-lg bg-zinc-500/20 px-3 py-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {styleSessions.length} Total
              </span>
            </div>

            {styleSessions.length? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {styleSessions.map(enquiry => {
                  const created = new Date(enquiry.createdAt);
                  const updated = new Date(enquiry.updatedAt);

                  return (
                    <div key={enquiry._id} className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
                      <div className="mb-4 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{enquiry.name}</h3>
                          <p className="text-xs text-zinc-500">{enquiry.orderNumber}</p>
                        </div>
                        <StatusBadge status={enquiry.status} />
                      </div>

                      <div className="mb-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <p className="flex items-center gap-2">
                          <span>📧</span>
                          <a href={`mailto:${enquiry.email}`} className="hover:text-[#C5A059]">
                            {enquiry.email}
                          </a>
                        </p>
                        <p className="flex items-center gap-2">
                          <span>📱</span>
                          <a href={`tel:${enquiry.phone}`} className="hover:text-[#C5A059]">
                            {enquiry.phone}
                          </a>
                        </p>
                        <p className="flex items-center gap-2">
                          <span>🏷</span>
                          <span className="font-semibold">{enquiry.subject}</span>
                        </p>
                      </div>

                      <div className="mb-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3">
                          {enquiry.message}
                        </p>
                      </div>

                      <div className="mb-4 space-y-1 text-xs text-zinc-500">
                        <p>📅 Created: {created.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        <p>🔄 Updated: {updated.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateEnquiryStatus(enquiry._id, 'confirmed')}
                          disabled={enquiry.status === 'confirmed'}
                          className="flex-1 rounded-lg bg-green-500 py-2 text-xs font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => updateEnquiryStatus(enquiry._id, 'cancelled')}
                          disabled={enquiry.status === 'cancelled'}
                          className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center shadow-lg dark:bg-zinc-900">
                <p className="text-zinc-500">No enquiries yet</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Users</h2>
              <span className="rounded-lg bg-zinc-500/20 px-3 py-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {users.length} Total
              </span>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-lg font-semibold text-zinc-500">Loading users...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-lg dark:bg-zinc-900">
                <p className="text-sm font-semibold text-zinc-500">No users found.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <tr>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Name</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Role</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                      {users.map(u => (
                        <tr key={u._id} className="group">
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-zinc-900 dark:text-white">{u.name || '—'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">{u.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold">{u.isAdmin? 'Admin' : 'Customer'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              {canManageAdmins && (
                                <button
                                onClick={async () => {
                                  try {
                                    const res = await axios.put(`${backendUrl}/admin/users/${u._id}`, { isAdmin: !u.isAdmin }, { withCredentials: true });
                                    if (res.data.success) {
                                      toast.success('User updated');
                                      setUsers(prev => prev.map(x => x._id === u._id? res.data.user : x));
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to update user');
                                  }
                                }}
                                className="rounded-lg px-3 py-1 text-sm font-semibold text-white" 
                                style={{ background: u.isAdmin? '#ef4444' : '#10b981' }}
                              >
                                {u.isAdmin? 'Revoke Admin' : 'Make Admin'}
                                </button>
                              )}
                              {canManageAdmins && (
                                <button
                                onClick={async () => {
                                  if (!window.confirm('Delete this user?')) return;
                                  try {
                                    const res = await axios.delete(`${backendUrl}/admin/users/${u._id}`, { withCredentials: true });
                                    if (res.data.success) {
                                      toast.success('User deleted');
                                      setUsers(prev => prev.filter(x => x._id !== u._id));
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to delete user');
                                  }
                                }}
                                className="rounded-lg px-3 py-1 text-sm font-semibold text-white bg-red-600"
                                >Delete</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Customers</h2>
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-zinc-500">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-zinc-500">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-zinc-500">Orders</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-zinc-500">Total Spent</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-zinc-500">Last Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {customers.map(customer => (
                      <tr key={customer._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-4 font-semibold">{customer.name}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{customer.email}</td>
                        <td className="px-6 py-4">{customer.orders}</td>
                        <td className="px-6 py-4 font-bold text-[#C5A059]">₵{Math.round(customer.totalSpent)}</td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {customer.lastOrder? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <OrderModal />
    </div>
  );
};