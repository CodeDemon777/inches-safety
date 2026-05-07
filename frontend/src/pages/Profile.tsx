import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { Package, CheckCircle, Truck, Star } from 'lucide-react';

const statusIcons: Record<string, typeof Package> = {
  placed: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

const Profile = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: orders } = useOrders();

  const [form, setForm] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '',
  });

  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: (user as any).phone || '',
        address_line1: (user as any).address_line1 || '',
        address_line2: (user as any).address_line2 || '',
        city: (user as any).city || '',
        state: (user as any).state || '',
        pincode: (user as any).pincode || '',
      });
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { user: updatedUser } = await apiFetch('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success('Profile updated!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }

  const submitFeedback = async (orderId: string) => {
    if (!feedbackForm.comment.trim()) {
      toast.error('Please provide written feedback before submitting.');
      return;
    }

    try {
      await apiFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          rating: feedbackForm.rating,
          comment: feedbackForm.comment
        })
      });
      toast.success('Feedback submitted successfully!');
      setFeedbackOrderId(null);
      setFeedbackForm({ rating: 5, comment: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-foreground">My Profile</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-display text-xl font-bold text-foreground">Personal Information</h2>
            <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Address Line 1</Label>
                <Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="mt-1" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1" />
                </div>
              </div>
              <Button type="submit" disabled={updateProfile.isPending} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Order History</h2>
            <div className="mt-4 space-y-4">
              {(orders ?? []).length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                (orders ?? []).map((order: any) => {
                  const Icon = statusIcons[order.status] || Package;
                  return (
                    <div key={order._id || order.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-medium text-foreground capitalize">{order.status}</span>
                        </div>
                        <span className="font-display font-bold text-foreground">₹{order.total}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.createdAt || order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="mt-2 flex gap-1">
                        {['placed', 'shipped', 'delivered'].map((s, i) => (
                          <div key={s} className={`h-1.5 flex-1 rounded-full ${
                            ['placed', 'shipped', 'delivered'].indexOf(order.status) >= i
                              ? 'bg-primary' : 'bg-muted'
                          }`} />
                        ))}
                      </div>
                      {order.status === 'delivered' && (
                        <div className="mt-4 pt-4 border-t">
                          {feedbackOrderId === (order._id || order.id) ? (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Leave Feedback</h4>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                                    className={`h-6 w-6 cursor-pointer ${star <= feedbackForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <Textarea
                                placeholder="Please write your feedback here..."
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                className="min-h-[80px]"
                                required
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => submitFeedback(order._id || order.id)}>Submit</Button>
                                <Button size="sm" variant="outline" onClick={() => setFeedbackOrderId(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setFeedbackOrderId(order._id || order.id);
                                setFeedbackForm({ rating: 5, comment: '' });
                              }}
                              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                            >
                              <Star className="h-4 w-4" /> Leave Feedback
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
