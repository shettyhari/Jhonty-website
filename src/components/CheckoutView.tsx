import { FormEvent, useState } from 'react';
import { Check, CheckCircle2, CreditCard, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { INDIAN_STATES, STORES_DATA, formatINR } from '../data/catalog';
import {
  BagItem,
  DeliveryMode,
  OrderReceipt,
  PaymentMode,
  ShippingAddress,
  StoreLocation,
} from '../types';
import { ResilientImage } from './ResilientImage';

interface CheckoutViewProps {
  bag: BagItem[];
  coupon: string | null;
  selectedStore: StoreLocation;
  onSelectStoreId: (id: string) => void;
  onApplyCoupon: (code: string) => void;
  onCompleteOrder: (receipt: OrderReceipt) => void;
  onBackToShopping: () => void;
}

export function CheckoutView({
  bag,
  coupon,
  selectedStore,
  onSelectStoreId,
  onApplyCoupon,
  onCompleteOrder,
  onBackToShopping,
}: CheckoutViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('home');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [couponInput, setCouponInput] = useState(coupon || '');
  const [formError, setFormError] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    pincode: '',
    addressLine: '',
    city: '',
    state: 'Karnataka',
  });

  const subtotal = bag.reduce((sum, item) => sum + item.price * item.qty, 0);
  let discount = 0;
  if (coupon === 'SALE15') discount = Math.round(subtotal * 0.15);
  if (coupon === 'LS1000' && subtotal >= 3999) discount = 1000;
  const total = Math.max(0, subtotal - discount);

  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!address.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^[6-9][0-9]{9}$/.test(address.phone.trim())) {
      setFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (deliveryMode === 'home') {
      if (!/^[1-9][0-9]{5}$/.test(address.pincode.trim())) {
        setFormError('Please enter a valid 6-digit Indian pincode.');
        return;
      }
      if (!address.addressLine.trim() || !address.city.trim()) {
        setFormError('Please fill in your complete street address and city.');
        return;
      }
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (paymentMode === 'upi' && !upiId.includes('@')) {
      setFormError('Please enter a valid UPI ID (e.g. aarav@okicici).');
      return;
    }
    if (paymentMode === 'card' && cardNumber.replace(/\s+/g, '').length < 12) {
      setFormError('Please enter a valid card number.');
      return;
    }

    const orderId = `LS-${Math.floor(100000 + Math.random() * 900000)}`;
    const confirmed: OrderReceipt = {
      orderId,
      placedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      deliveryMode,
      paymentMode,
      store: deliveryMode === 'pickup' ? selectedStore : undefined,
      address:
        deliveryMode === 'pickup'
          ? {
              ...address,
              addressLine: selectedStore.address,
              city: selectedStore.city,
              pincode: selectedStore.pincode,
            }
          : address,
      items: [...bag],
      subtotal,
      discount,
      total,
    };

    setReceipt(confirmed);
    setStep(3);
    onCompleteOrder(confirmed);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-neutral-50 min-h-[75vh] pb-16">
      {/* Stepper Header */}
      <div className="bg-white border-b border-neutral-200 py-5">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center justify-center gap-4 sm:gap-10 text-xs sm:text-sm font-bold">
          {[
            { num: 1, label: 'Delivery & Address' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Confirmation' },
          ].map((item, idx) => {
            const isActive = step === item.num;
            const isDone = step > item.num;
            return (
              <div key={item.num} className="flex items-center gap-2.5">
                {idx > 0 && <span className="hidden sm:inline text-neutral-300">—</span>}
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs tabular-nums ${
                    isDone
                      ? 'bg-emerald-700 text-white'
                      : isActive
                        ? 'bg-[#faa619] text-neutral-950'
                        : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : item.num}
                </span>
                <span className={isActive || isDone ? 'text-neutral-950' : 'text-neutral-400'}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-8">
        {/* Step 3: Confirmation Receipt */}
        {step === 3 && receipt ? (
          <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-lg p-8 sm:p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
              Order {receipt.orderId} Confirmed
            </p>
            <h1 className="font-display text-3xl font-bold text-neutral-950 mb-2">
              {receipt.deliveryMode === 'pickup'
                ? 'Preparing Your Store Pickup'
                : 'Thank You for Your Order'}
            </h1>
            <p className="text-sm text-neutral-600 mb-6">
              {receipt.deliveryMode === 'pickup' && receipt.store
                ? `Your order will be ready within 4 hours at ${receipt.store.name}.`
                : `Estimated delivery within 2–3 business days to ${receipt.address.city} (${receipt.address.pincode}).`}
            </p>

            <div className="text-left border border-neutral-200 rounded-lg p-5 bg-neutral-50 space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Reference</span>
                <strong className="tabular-nums text-neutral-950">{receipt.orderId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer</span>
                <strong className="text-neutral-950">
                  {receipt.address.name} · +91 {receipt.address.phone}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Mode</span>
                <strong className="uppercase text-neutral-950">{receipt.paymentMode}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-base">
                <span className="font-bold text-neutral-950">Total Paid / Payable</span>
                <strong className="tabular-nums text-neutral-950">{formatINR(receipt.total)}</strong>
              </div>
            </div>

            <div className="text-left space-y-2.5 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Items in Order ({receipt.items.reduce((s, i) => s + i.qty, 0)})
              </h3>
              {receipt.items.map((item, idx) => (
                <div
                  key={`${item.id}-${item.size}-${idx}`}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-100"
                >
                  <span className="text-neutral-800 truncate pr-4">
                    {item.brand} — {item.title} ({item.size}) × {item.qty}
                  </span>
                  <span className="font-semibold tabular-nums shrink-0">
                    {formatINR(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onBackToShopping}
              className="px-7 py-3 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : bag.length === 0 ? (
          <div className="max-w-lg mx-auto bg-white border border-neutral-200 rounded-lg p-10 text-center">
            <h2 className="text-xl font-bold text-neutral-950 mb-2">Your Basket is Empty</h2>
            <p className="text-sm text-neutral-600 mb-6">
              Add styles from our catalog before proceeding to checkout.
            </p>
            <button
              type="button"
              onClick={onBackToShopping}
              className="px-6 py-3 bg-[#faa619] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Explore Styles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Flow */}
            <div className="lg:col-span-8">
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-6">
                  {/* Delivery Mode */}
                  <div className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-neutral-950 mb-4">
                      1. Choose Delivery Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <label
                        className={`p-4 rounded-lg border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                          deliveryMode === 'home'
                            ? 'border-[#faa619] bg-[#fffcf5]'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMode"
                          checked={deliveryMode === 'home'}
                          onChange={() => setDeliveryMode('home')}
                          className="mt-1 accent-neutral-950"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-950">
                            <Truck className="w-4 h-4 text-[#d98200]" />
                            <span>Standard Home Delivery</span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            Free delivery in 2–3 business days across India.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-4 rounded-lg border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                          deliveryMode === 'pickup'
                            ? 'border-[#faa619] bg-[#fffcf5]'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMode"
                          checked={deliveryMode === 'pickup'}
                          onChange={() => setDeliveryMode('pickup')}
                          className="mt-1 accent-neutral-950"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-950">
                            <MapPin className="w-4 h-4 text-[#d98200]" />
                            <span>Free Click &amp; Collect</span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            Ready within 4 hours at your selected Lifestyle Store.
                          </p>
                        </div>
                      </label>
                    </div>

                    {deliveryMode === 'pickup' && (
                      <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                        <label
                          htmlFor="pickupStoreSelect"
                          className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2"
                        >
                          Pickup Store Location
                        </label>
                        <select
                          id="pickupStoreSelect"
                          value={selectedStore.id}
                          onChange={(e) => onSelectStoreId(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                        >
                          {STORES_DATA.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.city} — {st.name} ({st.pincode})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-neutral-600 mt-2">
                          {selectedStore.address} · Open {selectedStore.hours}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact & Address Form */}
                  <div className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-neutral-950 mb-4">
                      2. {deliveryMode === 'pickup' ? 'Pickup Contact Details' : 'Shipping Address'}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.name}
                          onChange={(e) => setAddress({ ...address, name: e.target.value })}
                          placeholder="e.g. Ananya Sharma"
                          className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          10-Digit Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm tabular-nums focus:border-[#faa619] focus:outline-none"
                        />
                      </div>

                      {deliveryMode === 'home' && (
                        <>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                              Flat / House No., Building, Street *
                            </label>
                            <input
                              type="text"
                              required
                              value={address.addressLine}
                              onChange={(e) =>
                                setAddress({ ...address, addressLine: e.target.value })
                              }
                              placeholder="e.g. 402, Palm Grove Residency, 12th Main Indiranagar"
                              className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                              6-Digit Pincode *
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              inputMode="numeric"
                              value={address.pincode}
                              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                              placeholder="e.g. 560038"
                              className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm tabular-nums focus:border-[#faa619] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              value={address.city}
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              placeholder="e.g. Bengaluru"
                              className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                              State
                            </label>
                            <select
                              value={address.state}
                              onChange={(e) => setAddress({ ...address, state: e.target.value })}
                              className="w-full h-11 px-3 bg-white border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {formError && (
                      <p className="mt-4 text-xs font-semibold text-red-600">{formError}</p>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        className="px-7 h-12 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div className="bg-white border border-neutral-200 rounded-lg p-5 flex items-center justify-between gap-4">
                    <div className="text-sm">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        {deliveryMode === 'pickup' ? 'Click & Collect Store' : 'Delivering To'}
                      </span>
                      <div className="font-bold text-neutral-950 mt-0.5">
                        {address.name} · +91 {address.phone}
                      </div>
                      <div className="text-neutral-600 text-xs mt-0.5">
                        {deliveryMode === 'pickup'
                          ? `${selectedStore.name}, ${selectedStore.city}`
                          : `${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold uppercase tracking-wider text-[#d98200] hover:underline shrink-0"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-neutral-950 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#d98200]" />
                      <span>Select Payment Method</span>
                    </h2>

                    <div className="space-y-3">
                      <label
                        className={`block p-4 rounded-lg border-2 cursor-pointer ${
                          paymentMode === 'upi'
                            ? 'border-[#faa619] bg-[#fffcf5]'
                            : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMode"
                            checked={paymentMode === 'upi'}
                            onChange={() => setPaymentMode('upi')}
                            className="accent-neutral-950"
                          />
                          <div>
                            <div className="text-sm font-bold text-neutral-950">
                              UPI (Google Pay / PhonePe / Paytm)
                            </div>
                            <div className="text-xs text-neutral-600">
                              Instant verification with zero convenience fee
                            </div>
                          </div>
                        </div>
                        {paymentMode === 'upi' && (
                          <div className="mt-3 pl-7">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="Enter UPI ID (e.g. ananya@okhdfcbank)"
                              className="w-full sm:w-80 h-10 px-3 bg-white border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                            />
                          </div>
                        )}
                      </label>

                      <label
                        className={`block p-4 rounded-lg border-2 cursor-pointer ${
                          paymentMode === 'card'
                            ? 'border-[#faa619] bg-[#fffcf5]'
                            : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMode"
                            checked={paymentMode === 'card'}
                            onChange={() => setPaymentMode('card')}
                            className="accent-neutral-950"
                          />
                          <div>
                            <div className="text-sm font-bold text-neutral-950">
                              Credit / Debit Card
                            </div>
                            <div className="text-xs text-neutral-600">
                              Visa, Mastercard, RuPay &amp; Amex supported
                            </div>
                          </div>
                        </div>
                        {paymentMode === 'card' && (
                          <div className="mt-3 pl-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-md">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="Card Number"
                              maxLength={19}
                              className="sm:col-span-3 h-10 px-3 bg-white border border-neutral-200 rounded-md text-sm tabular-nums"
                            />
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="h-10 px-3 bg-white border border-neutral-200 rounded-md text-sm tabular-nums"
                            />
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="CVV"
                              maxLength={4}
                              className="h-10 px-3 bg-white border border-neutral-200 rounded-md text-sm tabular-nums"
                            />
                          </div>
                        )}
                      </label>

                      <label
                        className={`block p-4 rounded-lg border-2 cursor-pointer ${
                          paymentMode === 'netbanking'
                            ? 'border-[#faa619] bg-[#fffcf5]'
                            : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMode"
                            checked={paymentMode === 'netbanking'}
                            onChange={() => setPaymentMode('netbanking')}
                            className="accent-neutral-950"
                          />
                          <div>
                            <div className="text-sm font-bold text-neutral-950">Net Banking</div>
                            <div className="text-xs text-neutral-600">
                              HDFC, ICICI, SBI, Axis &amp; 40+ Indian banks
                            </div>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`block p-4 rounded-lg border-2 cursor-pointer ${
                          paymentMode === 'cod'
                            ? 'border-[#faa619] bg-[#fffcf5]'
                            : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMode"
                            checked={paymentMode === 'cod'}
                            onChange={() => setPaymentMode('cod')}
                            className="accent-neutral-950"
                          />
                          <div>
                            <div className="text-sm font-bold text-neutral-950">
                              Cash on Delivery (Pay on Arrival)
                            </div>
                            <div className="text-xs text-neutral-600">
                              Pay {formatINR(total)} via cash or UPI QR upon delivery (Free COD)
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    {formError && (
                      <p className="mt-4 text-xs font-semibold text-red-600">{formError}</p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-5 h-11 border border-neutral-300 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-md"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="submit"
                        className="px-8 h-12 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-sm font-bold uppercase tracking-wider rounded-md transition-colors tabular-nums"
                      >
                        Place Order · {formatINR(total)}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Right Order Summary Sidebar */}
            <aside className="lg:col-span-4 bg-white border border-neutral-200 rounded-lg p-6 lg:sticky lg:top-24">
              <h3 className="text-base font-bold text-neutral-950 pb-3 border-b border-neutral-200">
                Order Summary ({bag.reduce((s, i) => s + i.qty, 0)} Items)
              </h3>

              <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto my-3 pr-1">
                {bag.map((item, idx) => (
                  <div key={`${item.id}-${item.size}-${idx}`} className="py-3 flex gap-3">
                    <div className="w-14 h-18 rounded overflow-hidden bg-neutral-100 shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase text-neutral-500">
                        {item.brand}
                      </div>
                      <div className="text-xs font-semibold text-neutral-950 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        Size: {item.size} · Qty: {item.qty}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-neutral-950 tabular-nums shrink-0">
                      {formatINR(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 py-3 border-t border-neutral-200">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Promo code (SALE15 / LS1000)"
                  className="flex-1 h-9 px-2.5 border border-neutral-200 rounded-md text-xs uppercase focus:border-[#faa619] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onApplyCoupon(couponInput)}
                  className="px-3 h-9 border border-neutral-950 text-xs font-bold rounded-md hover:bg-neutral-950 hover:text-white transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="space-y-2 pt-3 border-t border-neutral-200 text-sm tabular-nums">
                <div className="flex justify-between text-neutral-600">
                  <span>Bag Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Promo Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Total Payable</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
                <span>256-Bit Encrypted · Easy 30-Day Returns</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
