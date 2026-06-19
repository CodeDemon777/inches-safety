import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAllProducts } from '@/hooks/useProducts';
import { useAdminOrders } from '@/hooks/useOrders';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Package, IndianRupee, Users, Plus, Pencil, Trash2, X,
  ShoppingBag, Truck, CheckCircle, Star, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Tab = 'dashboard' | 'products' | 'orders' | 'feedbacks';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, loading, navigate]);

  if (!loading && (!user || !isAdmin)) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Admin Portal</h1>

        <div className="mt-6 flex gap-2 border-b">
          {(['dashboard', 'products', 'orders', 'feedbacks'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'feedbacks' && <FeedbacksTab />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const DashboardTab = () => {
  const { data, isLoading } = useAdminStats();

  const stats = [
    { label: 'Total Orders', value: data?.totalOrders ?? 0, icon: Package, color: 'text-primary' },
    { label: 'Total Revenue', value: `₹${data?.totalRevenue ?? 0}`, icon: IndianRupee, color: 'text-primary' },
    { label: 'Total Users', value: data?.totalUsers ?? 0, icon: Users, color: 'text-primary' },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {isLoading ? '...' : s.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductsTab = () => {
  const { data: products, isLoading } = useAllProducts();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: '', description: '', price: '', original_price: '', category: 'XL', sale_type: 'Normal', tags: '', stock: '', image_url: '', image_urls: [], is_active: true,
  });

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', original_price: '', category: 'XL', sale_type: 'Normal', tags: '', stock: '', image_url: '', image_urls: [], is_active: true });
    setEditId(null);
    setShowForm(false);
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await apiFetch('/upload/multiple', { method: 'POST', body: formData });
      setForm((prev: any) => ({ 
        ...prev, 
        image_urls: [...(prev.image_urls || []), ...res.image_urls]
      }));
      toast.success('Images uploaded successfully');
    } catch (err: any) {
      toast.error('Failed to upload images: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        original_price: form.original_price || undefined,
        category: form.category,
        sale_type: form.sale_type,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        stock: form.stock,
        image_url: form.image_urls && form.image_urls.length > 0 ? form.image_urls[0] : (form.image_url || null),
        image_urls: form.image_urls || [],
        is_active: form.is_active,
      };
      if (editId) {
        await apiFetch(`/products/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editId ? 'Product updated!' : 'Product added!');
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startEdit = (p: any) => {
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      original_price: p.original_price || 0,
      category: p.category,
      sale_type: p.sale_type || 'Normal',
      tags: (p.tags || []).join(', '),
      stock: p.stock,
      image_url: p.image_url || '',
      image_urls: p.image_urls && p.image_urls.length > 0 ? p.image_urls : (p.image_url ? [p.image_url] : []),
      is_active: p.is_active,
    });
    setEditId(p._id || p.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Products</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-1.5 rounded-full bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-foreground">{editId ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" /></div>
              <div>
                <Label>Category</Label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option>XL</option><option>XXL</option>
                </select>
              </div>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value === '' ? '' : Number(e.target.value) })} required className="mt-1" /></div>
              <div><Label>Original Price (₹) [Optional]</Label><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value === '' ? '' : Number(e.target.value) })} className="mt-1" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value === '' ? '' : Number(e.target.value) })} required className="mt-1" /></div>
              <div>
                <Label>Sale Type</Label>
                <select value={form.sale_type} onChange={(e) => setForm({ ...form, sale_type: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="Normal">Retail</option><option>Wholesale</option><option>Both</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Product Images</Label>
              
              {(form.image_urls?.length > 0 || form.image_url) && (
                <div className="flex gap-3 mt-2 mb-4 overflow-x-auto pb-2">
                  {(form.image_urls?.length > 0 ? form.image_urls : [form.image_url]).map((url: string, idx: number) => (
                    <div key={idx} className="relative flex-shrink-0 group">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded-md border" />
                      <button 
                        type="button"
                        onClick={() => {
                           const newUrls = [...(form.image_urls || [])];
                           newUrls.splice(idx, 1);
                           setForm({ ...form, image_urls: newUrls, image_url: newUrls.length > 0 ? newUrls[0] : '' });
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-1 flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/50 bg-primary/5 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors group relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 mb-4 text-primary" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> multiple images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
              {uploadingImage && <p className="text-sm text-muted-foreground mt-2 animate-pulse">Uploading images...</p>}
            </div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <Label htmlFor="active">Active</Label>
            </div>
            <Button type="submit" disabled={saveMutation.isPending} className="rounded-full bg-primary text-primary-foreground">
              {saveMutation.isPending ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
            </Button>
          </form>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="animate-pulse h-20 rounded-lg bg-muted" />
        ) : (
          (products ?? []).map((p: any) => (
            <div key={p._id || p.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div className="flex items-center gap-4">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-xl">🌿</div>
                )}
                <div>
                  <h4 className="font-medium text-foreground">{p.name}</h4>
                  <p className="text-sm text-muted-foreground">{p.category} · {p.sale_type === 'Normal' ? 'Retail' : p.sale_type} · ₹{p.price} {p.original_price ? `(was ₹${p.original_price})` : ''} · Stock: {p.stock} {!p.is_active && '· Inactive'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p._id || p.id); }} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const OrdersTab = () => {
  const { data: orders, isLoading } = useAdminOrders();
  const queryClient = useQueryClient();
  const [paymentFilter, setPaymentFilter] = useState('all');

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Order status updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, payment_status }: { id: string; payment_status: string }) => {
      await apiFetch(`/orders/${id}/payment-status`, {
        method: 'PUT',
        body: JSON.stringify({ payment_status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Payment status updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const generateAdminBillPDF = (order: any) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('EcoCycle Store - Invoice', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(order.createdAt || order.created_at).toLocaleDateString('en-IN')}`, 14, 30);
    doc.text(`Name: ${order.full_name || order.email}`, 14, 40);
    if (order.phone) doc.text(`Phone: ${order.phone}`, 14, 48);
    const txnId = order.transaction_id || order.payment_id || 'N/A';
    doc.text(`Transaction ID: ${txnId}`, 14, 56);
    
    const tableData = (order.items || []).map((item: any) => [
      item.product_name,
      item.quantity.toString(),
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.quantity}`
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [['Product', 'Quantity', 'Price', 'Total']],
      body: tableData,
      foot: [['', '', 'Grand Total:', `Rs. ${order.total}`]],
      theme: 'plain'
    });
    
    doc.save(`Invoice_${order.transaction_id || order._id || 'Order'}.pdf`);
  };

  const statusIcon = (s: string) => {
    if (s === 'shipped') return <Truck className="h-4 w-4" />;
    if (s === 'delivered') return <CheckCircle className="h-4 w-4" />;
    if (s === 'cancelled') return <X className="h-4 w-4 text-destructive" />;
    return <ShoppingBag className="h-4 w-4" />;
  };

  const filteredOrders = (orders ?? []).filter((o: any) => 
    paymentFilter === 'all' ? true : (o.payment_status || 'pending') === paymentFilter
  );

  const totalRevenue = filteredOrders.reduce((acc: number, order: any) => acc + (order.total || 0), 0);
  const totalGST = totalRevenue - (totalRevenue / 1.18);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">Orders</h2>
        <div className="flex gap-4 items-center">
          <Label className="text-sm font-medium whitespace-nowrap">Filter Payment:</Label>
          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm w-36"
          >
            <option value="all">All Orders</option>
            <option value="paid">Paid/Completed</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground font-medium">Orders Count</p>
          <p className="font-display text-2xl font-bold mt-1">{filteredOrders.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground font-medium">Filtered Revenue</p>
          <p className="font-display text-2xl font-bold mt-1 text-green-600">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground font-medium">Est. Taxable Value</p>
          <p className="font-display text-2xl font-bold mt-1 text-blue-600">₹{(totalRevenue / 1.18).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground font-medium">Est. GST (18%)</p>
          <p className="font-display text-2xl font-bold mt-1 text-purple-600">₹{totalGST.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="animate-pulse h-20 rounded-lg bg-muted" />
        ) : filteredOrders.length === 0 ? (
          <p className="text-muted-foreground">No orders found.</p>
        ) : (
          filteredOrders.map((order: any) => (
            <div key={order._id || order.id} className="rounded-lg border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {statusIcon(order.status)}
                    <span className="font-medium capitalize text-foreground">{order.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.full_name || order.email} · {new Date(order.createdAt || order.created_at).toLocaleDateString('en-IN')}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.email}</p>
                  {order.items && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {(order.items as any[]).map((item: any) => (
                        <span key={item._id || item.product_id} className="mr-2">{item.product_name} × {item.quantity}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-foreground">₹{order.total}</span>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/invoice/${order._id || order.id}?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" /> Bill
                      </a>
                    </Button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label className="text-xs text-muted-foreground">Order:</Label>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus.mutate({ id: order._id || order.id, status: e.target.value })}
                      className="rounded-md border bg-background px-2 py-1 text-sm"
                    >
                      <option value="placed">Placed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Label className="text-xs text-muted-foreground">Payment:</Label>
                    <select
                      value={order.payment_status || 'pending'}
                      onChange={(e) => updatePaymentStatus.mutate({ id: order._id || order.id, payment_status: e.target.value })}
                      className="rounded-md border bg-background px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FeedbacksTab = () => {
  const queryClient = useQueryClient();
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: async () => {
      return await apiFetch('/feedback');
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guest_name: '', rating: 5, comment: '' });

  const toggleApproval = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/feedback/${id}/approve`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
      toast.success('Approval status updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addFeedback = useMutation({
    mutationFn: async () => {
      await apiFetch('/feedback/admin', {
        method: 'POST',
        body: JSON.stringify(form)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
      toast.success('Feedback added successfully');
      setShowForm(false);
      setForm({ guest_name: '', rating: 5, comment: '' });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Customer Feedbacks</h2>
        <Button onClick={() => setShowForm(true)} className="gap-1.5 rounded-full bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Feedback
        </Button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-foreground">New Feedback</h3>
            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); addFeedback.mutate(); }} className="space-y-4">
            <div>
              <Label>Customer Name</Label>
              <Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    className={`h-6 w-6 cursor-pointer ${star <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Comment</Label>
              <Input value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required className="mt-1" />
            </div>
            <Button type="submit" disabled={addFeedback.isPending} className="rounded-full bg-primary text-primary-foreground">
              {addFeedback.isPending ? 'Saving...' : 'Add Feedback'}
            </Button>
          </form>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="animate-pulse h-20 rounded-lg bg-muted" />
        ) : (feedbacks ?? []).length === 0 ? (
          <p className="text-muted-foreground">No feedbacks yet.</p>
        ) : (
          (feedbacks ?? []).map((fb: any) => (
            <div key={fb._id} className="rounded-lg border bg-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground">
                    {fb.guest_name || fb.user_id?.full_name || 'Anonymous'} <span className="text-sm text-muted-foreground">({fb.user_id?.email || 'Guest'})</span>
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-foreground">{fb.comment}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-muted-foreground text-right">
                    {fb.order_id && <>Order ID: {fb.order_id}<br /></>}
                    {new Date(fb.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-medium ${fb.approved ? 'text-green-600' : 'text-amber-600'}`}>
                      {fb.approved ? 'Approved' : 'Pending'}
                    </span>
                    <button
                      onClick={() => toggleApproval.mutate(fb._id)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${fb.approved ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                      {fb.approved ? 'Revoke' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;
