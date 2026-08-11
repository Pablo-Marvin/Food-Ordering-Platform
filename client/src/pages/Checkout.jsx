import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMapPin, FiCreditCard, FiCheck, FiTruck, FiShoppingBag, FiAlertCircle, FiGift, FiNavigation, FiDollarSign } from 'react-icons/fi';
import PageTransition from '../components/layout/PageTransition';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { orderAPI } from '../utils/api';

const steps = [
  { id: 1, label: 'Details', icon: <FiUser /> },
  { id: 2, label: 'Delivery', icon: <FiTruck /> },
  { id: 3, label: 'Payment', icon: <FiCreditCard /> },
  { id: 4, label: 'Review', icon: <FiCheck /> },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Mock Payment UI State
  const [showMockPayment, setShowMockPayment] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);

  const { user } = useAuth();
  
  // Form state
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    orderType: 'delivery',
    address: '',
    landmark: '',
    paymentMethod: 'online',
    notes: '',
  });

  // Delivery state
  const [distance, setDistance] = useState(null); // Real distance from API
  const [isLocating, setIsLocating] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(true);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateForm('coordinates', { lat, lng });
          
          const response = await orderAPI.calculateDistance(lat, lng);
          if (response.success) {
            setDistance(response.data.distance);
            if (response.data.address) {
              updateForm('address', response.data.address);
            }
            if (!response.data.deliveryAvailable) {
              setError(`Delivery not available at your location (${response.data.distance}km)`);
            }
          }
        } catch (err) {
          console.error("Distance calculation error:", err);
          setError(`Failed to calculate distance: ${err.message}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setError('Could not get your location. Please allow location access.');
      }
    );
  };

  const codAvailable = distance !== null && distance <= 5;
  const deliveryCharge = distance === null ? 0 : (isFirstOrder ? 0 : distance <= 3 ? 30 : distance <= 5 ? 50 : distance <= 10 ? 80 : 120);
  const actualDeliveryCharge = form.orderType === 'pickup' ? 0 : deliveryCharge;
  const total = subtotal + actualDeliveryCharge;

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!form.name.trim()) return 'Please enter your name';
        if (!form.phone.trim() || form.phone.length < 10) return 'Please enter a valid phone number';
        return null;
      case 2:
        if (form.orderType === 'delivery') {
          if (!form.address.trim()) return 'Please enter your delivery address';
          if (distance === null) return 'Please use "Locate Me" to verify your delivery distance';
        }
        return null;
      case 3:
        if (!form.paymentMethod) return 'Please select a payment method';
        if (form.paymentMethod === 'cod' && !codAvailable && form.orderType === 'delivery') {
          return 'COD not available beyond 5km. Please choose online payment.';
        }
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const orderData = {
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.orderType === 'delivery' ? form.address : 'Pickup',
          coordinates: form.orderType === 'delivery' && form.coordinates ? form.coordinates : null,
        },
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        orderType: form.orderType,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      };

      const response = await orderAPI.create(orderData);

      if (response.success) {
        if (form.paymentMethod === 'online') {
          // Import paymentAPI directly or use it here
          const { paymentAPI } = await import('../utils/api');
          const rzpOrder = await paymentAPI.createRazorpayOrder({
            items: orderData.items,
            orderId: response.data._id || response.data.orderNumber || response.data.id,
            customerEmail: form.email,
          });
          
          if (rzpOrder.success && rzpOrder.id) {
            
            // DEMO MODE BYPASS: If backend returns 'mock', launch our beautiful Mock UPI UI
            if (rzpOrder.key_id === 'mock') {
              console.log('Running in Razorpay Mock Mode - Opening Mock UI');
              setMockOrderDetails({
                orderId: response.data._id || response.data.orderNumber || response.data.id,
                amount: total,
                orderData: response.data
              });
              setShowMockPayment(true);
              return;
            }

            const options = {
              key: rzpOrder.key_id,
              amount: rzpOrder.amount,
              currency: rzpOrder.currency,
              name: 'Crispiest Chicken',
              description: 'Order Payment',
              order_id: rzpOrder.id,
              handler: async function (res) {
                try {
                  const verifyRes = await paymentAPI.verifyRazorpayPayment({
                    ...res,
                    orderId: response.data._id || response.data.orderNumber || response.data.id,
                  });
                  if (verifyRes.success) {
                    clearCart();
                    navigate('/order-success', {
                      state: { order: response.data },
                    });
                  } else {
                    setError('Payment verification failed');
                  }
                } catch (err) {
                  setError('Payment verification failed. Please contact support.');
                }
              },
              prefill: {
                name: form.name,
                email: form.email,
                contact: form.phone
              },
              theme: {
                color: '#DC2626'
              }
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
              setError('Payment failed: ' + resp.error.description);
            });
            rzp.open();
          } else {
            throw new Error('Failed to create payment session');
          }
        } else {
          clearCart();
          navigate('/order-success', {
            state: { order: response.data },
          });
        }
      } else {
        setError(response.error || 'Failed to place order');
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMockPaymentSuccess = async () => {
    try {
      const { paymentAPI } = await import('../utils/api');
      const verifyRes = await paymentAPI.verifyRazorpayPayment({
        razorpay_order_id: 'mock_order_id',
        razorpay_payment_id: 'mock_payment_id',
        razorpay_signature: 'mock_signature',
        orderId: mockOrderDetails.orderId,
      });
      if (verifyRes.success) {
        clearCart();
        setShowMockPayment(false);
        navigate('/order-success', {
          state: { order: mockOrderDetails.orderData },
        });
      }
    } catch (err) {
      setError('Mock payment verification failed');
      setShowMockPayment(false);
    }
  };

  const handleMockPaymentFailure = () => {
    setError('Payment failed or was cancelled by the user (Simulated).');
    setShowMockPayment(false);
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="checkout-page">
          <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
            <h2>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
              Add some items before checking out!
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="checkout-page">
        <div className="container">
          <motion.h1
            style={{ textAlign: 'center', marginBottom: '8px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gradient">Checkout</span>
          </motion.h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Complete your order in a few steps
          </p>

          {/* Step Indicator */}
          <div className="checkout-steps">
            {steps.map((step, i) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="step-number">
                    {currentStep > step.id ? <FiCheck /> : step.id}
                  </div>
                  <span className="step-label">{step.label}</span>
                </motion.div>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: 'var(--accent-light)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '800px',
                  margin: '0 auto 24px',
                }}
              >
                <FiAlertCircle /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="checkout-grid">
            {/* Form Area */}
            <div>
              <AnimatePresence mode="wait">
                {/* Step 1: Customer Details */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    className="checkout-form-section"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <h3 className="form-title"><FiUser /> Your Details</h3>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="Enter your 10-digit phone number"
                        value={form.phone}
                        onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email (Optional)</label>
                      <input
                        className="form-input"
                        type="email"
                        placeholder="Enter your email for order updates"
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Delivery */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    className="checkout-form-section"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <h3 className="form-title"><FiTruck /> Delivery Method</h3>
                    <div className="delivery-options">
                      <motion.div
                        className={`delivery-option ${form.orderType === 'delivery' ? 'selected' : ''}`}
                        onClick={() => updateForm('orderType', 'delivery')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="delivery-option-icon"><FiTruck /></div>
                        <div className="delivery-option-title">Delivery</div>
                        <div className="delivery-option-desc">We'll bring it to you</div>
                      </motion.div>
                      <motion.div
                        className={`delivery-option ${form.orderType === 'pickup' ? 'selected' : ''}`}
                        onClick={() => updateForm('orderType', 'pickup')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="delivery-option-icon"><FiMapPin /></div>
                        <div className="delivery-option-title">Pickup</div>
                        <div className="delivery-option-desc">Collect from our store</div>
                      </motion.div>
                    </div>

                    {form.orderType === 'delivery' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: '24px' }}
                      >
                        {isFirstOrder && (
                          <div className="free-delivery-banner">
                            <FiGift /> 🎉 First order — FREE delivery!
                          </div>
                        )}
                        <div className="form-group">
                          <label className="form-label">Delivery Address *</label>
                          <textarea
                            className="form-input"
                            placeholder="Enter your full delivery address in Chengalpattu area"
                            value={form.address}
                            onChange={(e) => updateForm('address', e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Landmark (Optional)</label>
                          <input
                            className="form-input"
                            type="text"
                            placeholder="Any nearby landmark"
                            value={form.landmark}
                            onChange={(e) => updateForm('landmark', e.target.value)}
                          />
                        </div>
                        <div style={{
                          padding: '16px',
                          background: 'var(--glass)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}><FiMapPin /> Estimated Distance:</strong>{' '}
                            {distance !== null ? `${distance} km from our store` : 'Distance unknown'}
                            {distance !== null && !isFirstOrder && (
                              <div style={{ marginTop: '4px', color: 'var(--accent-warm)' }}>
                                Delivery Charge: {formatPrice(deliveryCharge)}
                              </div>
                            )}
                          </div>
                          
                          <motion.button 
                            className="btn btn-outline" 
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isLocating ? 'Locating...' : <><FiNavigation /> Locate Me</>}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {form.orderType === 'pickup' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          marginTop: '24px',
                          padding: '16px',
                          background: 'var(--glass)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <p style={{ fontWeight: 600, marginBottom: '4px' }}>📍 Pickup Location</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Crispiest Chicken, Chengalpattu, Tamil Nadu
                        </p>
                        <p style={{ color: 'var(--accent-warm)', fontSize: '0.85rem', marginTop: '8px' }}>
                          ⏱️ Ready in ~20 minutes
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    className="checkout-form-section"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <h3 className="form-title"><FiCreditCard /> Payment Method</h3>

                    <div className="payment-options">
                      <motion.div
                        className={`payment-option ${form.paymentMethod === 'online' ? 'selected' : ''}`}
                        onClick={() => updateForm('paymentMethod', 'online')}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="payment-option-radio" />
                        <div className="payment-option-icon"><FiCreditCard /></div>
                        <div className="payment-option-info">
                          <div className="payment-option-title">Online Payment</div>
                          <div className="payment-option-desc">UPI / Card / Net Banking (Demo)</div>
                        </div>
                      </motion.div>

                      <motion.div
                        className={`payment-option ${form.paymentMethod === 'cod' ? 'selected' : ''} ${(!codAvailable && form.orderType === 'delivery') ? 'disabled' : ''}`}
                        onClick={() => {
                          if (codAvailable || form.orderType === 'pickup') {
                            updateForm('paymentMethod', 'cod');
                          }
                        }}
                        whileHover={codAvailable || form.orderType === 'pickup' ? { scale: 1.01 } : {}}
                      >
                        <div className="payment-option-radio" />
                        <div className="payment-option-icon"><FiDollarSign /></div>
                        <div className="payment-option-info">
                          <div className="payment-option-title">Cash on Delivery</div>
                          <div className="payment-option-desc">
                            {form.orderType === 'pickup'
                              ? 'Pay at the counter'
                              : codAvailable
                                ? 'Pay when you receive your order'
                                : 'Not available beyond 5km'
                            }
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {!codAvailable && form.orderType === 'delivery' && (
                      <div className="cod-warning">
                        <FiAlertCircle />
                        <span>
                          Cash on Delivery is not available for distances greater than 5km.
                          Your estimated distance is {distance}km. Please choose online payment.
                        </span>
                      </div>
                    )}

                    <div className="form-group" style={{ marginTop: '24px' }}>
                      <label className="form-label">Order Notes (Optional)</label>
                      <textarea
                        className="form-input"
                        placeholder="Any special instructions for your order"
                        value={form.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    className="checkout-form-section"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <h3 className="form-title"><FiCheck /> Review Your Order</h3>

                    {/* Customer Info */}
                    <div style={{
                      padding: '16px',
                      background: 'var(--glass)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Customer</h4>
                      <p style={{ fontWeight: 600 }}>{form.name}</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{form.phone}</p>
                      {form.email && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{form.email}</p>}
                    </div>

                    {/* Delivery Info */}
                    <div style={{
                      padding: '16px',
                      background: 'var(--glass)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {form.orderType === 'delivery' ? <><FiTruck /> Delivery</> : <><FiMapPin /> Pickup</>}
                      </h4>
                      <p style={{ fontSize: '0.9rem' }}>
                        {form.orderType === 'delivery' ? form.address : 'Crispiest Chicken, Chengalpattu'}
                      </p>
                    </div>

                    {/* Payment */}
                    <div style={{
                      padding: '16px',
                      background: 'var(--glass)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Payment</h4>
                      <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {form.paymentMethod === 'online' ? <><FiCreditCard /> Online Payment</> : <><FiDollarSign /> Cash on Delivery</>}
                      </p>
                    </div>

                    {/* Items */}
                    <div style={{
                      padding: '16px',
                      background: 'var(--glass)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Order Items ({items.length})
                      </h4>
                      {items.map((item) => (
                        <div key={item.cartId} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              background: 'var(--glass)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                            }}>
                              x{item.quantity}
                            </span>
                            <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                            {item.variant && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.variant})</span>
                            )}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--accent-warm)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}

                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                          <span style={{ color: isFirstOrder && form.orderType === 'delivery' ? 'var(--success)' : '' }}>
                            {form.orderType === 'pickup'
                              ? 'Free (Pickup)'
                              : isFirstOrder
                              ? <><FiGift /> FREE</>
                                : formatPrice(deliveryCharge)
                            }
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '12px 0 0',
                          marginTop: '8px',
                          borderTop: '1px solid var(--border-default)',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 800,
                          fontSize: '1.25rem',
                        }}>
                          <span>Total</span>
                          <span style={{ color: 'var(--accent-warm)' }}>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '24px',
              }}>
                {currentStep > 1 ? (
                  <motion.button
                    className="btn btn-secondary"
                    onClick={prevStep}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back
                  </motion.button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <motion.button
                    className="btn btn-primary"
                    onClick={nextStep}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    Continue →
                  </motion.button>
                ) : (
                  <motion.button
                    className="btn btn-primary btn-lg animate-glow"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    style={{ minWidth: '200px' }}
                  >
                    {isSubmitting ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>🍗 Place Order — {formatPrice(total)}</>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="order-summary-card">
              <h3><FiShoppingBag style={{ marginRight: '8px' }} />Order Summary</h3>

              {items.map((item) => (
                <div key={item.cartId} className="order-summary-item">
                  <span className="order-summary-item-name">
                    <span className="order-summary-item-qty">x{item.quantity}</span>
                    {item.name}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-warm)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="order-summary-divider" />

              <div className="order-summary-item">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="order-summary-item">
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span style={{ color: isFirstOrder && form.orderType === 'delivery' ? 'var(--success)' : 'var(--text-secondary)' }}>
                  {form.orderType === 'pickup' ? 'Free' : isFirstOrder ? 'FREE' : formatPrice(deliveryCharge)}
                </span>
              </div>

              <div className="order-summary-divider" />
              <div className="order-summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Payment Gateway Modal */}
        <AnimatePresence>
          {showMockPayment && mockOrderDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(10, 10, 10, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  width: '100%',
                  maxWidth: '400px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent-warm), #b91c1c)',
                  padding: '24px',
                  textAlign: 'center',
                  color: 'white'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Crispiest Payment Gateway</h3>
                  <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Mock Mode - Testing Only</p>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Amount to Pay</p>
                  <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    {formatPrice(mockOrderDetails.amount)}
                  </h2>

                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    display: 'inline-block',
                    marginBottom: '24px'
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=demo@upi&pn=CrispiestChicken&am=${mockOrderDetails.amount}`} 
                      alt="UPI QR Code" 
                      style={{ width: '150px', height: '150px' }}
                    />
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Scan with PhonePe, GPay, or Paytm<br/>(This is a simulated QR for testing)
                  </p>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1, borderColor: 'var(--border-subtle)' }}
                      onClick={handleMockPaymentFailure}
                    >
                      Cancel Payment
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, background: 'var(--success)' }}
                      onClick={handleMockPaymentSuccess}
                    >
                      Simulate Success
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
