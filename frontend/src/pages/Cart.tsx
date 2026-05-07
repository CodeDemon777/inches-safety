import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', notes: '',
  });

  const startCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      navigate('/login');
      return;
    }
    setForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: (user as any).phone || '',
      address_line1: (user as any).address_line1 || '',
      address_line2: (user as any).address_line2 || '',
      city: (user as any).city || '',
      state: (user as any).state || '',
      pincode: (user as any).pincode || '',
      notes: '',
    });
    setCheckoutMode(true);
  };

  const generateBillPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('EcoCycle Store - Invoice', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Name: ${form.full_name}`, 14, 40);
    doc.text(`Phone: ${form.phone}`, 14, 48);
    doc.text(`Transaction ID: ${transactionId}`, 14, 56);
    
    const tableData = items.map(item => [
      item.name,
      item.quantity.toString(),
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.quantity}`
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [['Product', 'Quantity', 'Price', 'Total']],
      body: tableData,
      foot: [['', '', 'Grand Total:', `Rs. ${totalPrice()}`]],
      theme: 'grid'
    });
    
    doc.save(`Invoice_${transactionId || 'Order'}.pdf`);
  };

  const getUpiUrl = () => {
    const tr = `EZ${Date.now()}`;
    return `upi://pay?pa=7092264632-4@ybl&pn=EcoCycle&tr=${tr}&tn=EcoCycle%20Order&am=${totalPrice().toFixed(2)}&cu=INR`;
  };

  const getGPayUrl = () => {
    const tr = `EZ${Date.now()}`;
    return `tez://upi/pay?pa=7092264632-4@ybl&pn=EcoCycle&tr=${tr}&tn=EcoCycle%20Order&am=${totalPrice().toFixed(2)}&cu=INR`;
  };

  const getPhonePeUrl = () => {
    const tr = `EZ${Date.now()}`;
    return `phonepe://pay?pa=7092264632-4@ybl&pn=EcoCycle&tr=${tr}&tn=EcoCycle%20Order&am=${totalPrice().toFixed(2)}&cu=INR`;
  };

  const payViaWhatsApp = () => {
    if (!form.full_name || !form.phone || !form.address_line1) {
      toast.error('Please fill in your Name, Phone, and Address to order via WhatsApp.');
      return;
    }

    const productList = items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
    const fullAddress = `${form.address_line1}, ${form.address_line2 ? form.address_line2 + ', ' : ''}${form.city}, ${form.state} - ${form.pincode}`;
    
    const paymentLink = getUpiUrl();
    
    const message = `🛒 *New Order - Inches Eco Pads*\n\n📦 *Product:* ${productList}\n💰 *Total:* ₹${totalPrice()}\n⚡ *Click to Pay directly using UPI Apps:* ${paymentLink}\n\n👤 *Name:* ${form.full_name}\n📞 *Phone:* ${form.phone}\n📍 *Address:* ${fullAddress}\n📝 *Notes:* ${form.notes || 'None'}`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/+917092264632?text=${encoded}`, '_blank');
  };

  const sendToWhatsApp = () => {
    if (!form.full_name || !form.phone || !form.address_line1) {
      toast.error('Please fill in your Name, Phone, and Address to order via WhatsApp.');
      return;
    }

    if (!transactionId) {
      toast.error('Please enter the Transaction ID after paying via QR Code to proceed.');
      return;
    }

    generateBillPDF();

    const productList = items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
    const fullAddress = `${form.address_line1}, ${form.address_line2 ? form.address_line2 + ', ' : ''}${form.city}, ${form.state} - ${form.pincode}`;
    
    const message = `🛒 *New Order - Inches Eco Pads*\n\n📦 *Product:* ${productList}\n💰 *Total Paid:* ₹${totalPrice()}\n💳 *Transaction ID:* ${transactionId}\n\n👤 *Name:* ${form.full_name}\n📞 *Phone:* ${form.phone}\n📍 *Address:* ${fullAddress}\n📝 *Notes:* ${form.notes || 'None'}`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/+917092264632?text=${encoded}`, '_blank');
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!transactionId) {
      toast.error('Please enter the Transaction ID after paying via QR Code to proceed.');
      return;
    }

    setPlacing(true);

    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          transaction_id: transactionId,
          total: totalPrice(),
          items: orderItems
        })
      });

      generateBillPDF();

      clearCart();
      toast.success('Order placed and bill downloaded successfully!');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-32">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="mt-6 font-display text-2xl font-bold text-foreground">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Add some eco-friendly products to get started!</p>
          <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-foreground">
          {checkoutMode ? 'Checkout' : 'Shopping Cart'}
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {!checkoutMode ? (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-lg border bg-card p-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover" loading="lazy" width={96} height={96} />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-accent text-3xl">🌿</div>
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.category} {item.sale_type ? `· ${item.sale_type}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-accent">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-accent">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-display font-bold text-foreground">₹{item.price * item.quantity}</span>
                      <button onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <form id="checkout-form" onSubmit={placeOrder} className="space-y-4 rounded-xl border bg-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground">Shipping Address</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="mt-1" /></div>
                  <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required type="email" className="mt-1" /></div>
                </div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="mt-1" /></div>
                <div><Label>Address Line 1</Label><Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} required className="mt-1" /></div>
                <div><Label>Address Line 2</Label><Input value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="mt-1" /></div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="mt-1" /></div>
                  <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="mt-1" /></div>
                  <div><Label>Pincode</Label><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required className="mt-1" /></div>
                </div>
                <div><Label>Notes [Optional]</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" placeholder="Any specific instructions..." /></div>
              </form>
            )}
          </div>

          <div className="h-fit rounded-lg border bg-card p-6">
            <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>Free</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span><span>₹{totalPrice()}</span>
              </div>
            </div>
            {!checkoutMode ? (
              <Button onClick={startCheckout} className="mt-6 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Proceed to Checkout
              </Button>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white">
                  <h4 className="font-semibold mb-2 text-black">Scan & Pay (UPI)</h4>
                  <QRCodeSVG 
                    value={getUpiUrl()} 
                    size={160} 
                  />
                  <p className="text-sm mt-3 text-center text-muted-foreground">Scan with GPay, PhonePe, or Paytm</p>
                  <p className="font-bold text-lg mt-1 text-black">Total: ₹{totalPrice()}</p>
                </div>
                
                <div>
                    <Label>Transaction ID / UTR</Label>
                    <Input 
                        value={transactionId} 
                        onChange={(e) => setTransactionId(e.target.value)} 
                        placeholder="Enter 12-digit UTR after payment" 
                        required 
                        className="mt-1" 
                    />
                </div>

                <div className="space-y-3 mt-4">
                  <Button type="button" onClick={payViaWhatsApp} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#128C7E] text-white hover:bg-[#075E54]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Pay via WhatsApp
                  </Button>
                  <Button type="button" onClick={sendToWhatsApp} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Send to WhatsApp
                  </Button>
                  <Button type="submit" form="checkout-form" disabled={placing} variant="outline" className="w-full rounded-full">
                    {placing ? 'Placing Order...' : 'Place Order without WhatsApp'}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setCheckoutMode(false)} className="w-full rounded-full mt-2">
                    Back to Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
