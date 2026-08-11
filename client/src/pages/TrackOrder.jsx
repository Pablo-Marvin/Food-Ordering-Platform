import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiPackage, FiCheck, FiCheckCircle, FiTruck, FiClock } from 'react-icons/fi';
import { GiChickenLeg, GiCook, GiPartyPopper } from 'react-icons/gi';
import PageTransition from '../components/layout/PageTransition';

const trackingSteps = [
  { id: 'placed', label: 'Order Placed', Icon: FiClock, desc: 'Your order has been received' },
  { id: 'confirmed', label: 'Confirmed', Icon: FiCheckCircle, desc: 'Restaurant confirmed your order' },
  { id: 'preparing', label: 'Preparing', Icon: GiCook, desc: 'Your food is being prepared' },
  { id: 'ready', label: 'Ready', Icon: GiChickenLeg, desc: 'Your order is ready' },
  { id: 'out_for_delivery', label: 'On the Way', Icon: FiTruck, desc: 'Order is out for delivery' },
  { id: 'delivered', label: 'Delivered', Icon: GiPartyPopper, desc: 'Enjoy your meal!' },
];

export default function TrackOrder() {
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState(location.state?.orderNumber || '');
  const [tracked, setTracked] = useState(!!location.state?.orderNumber);

  // Demo: show order in "preparing" stage
  const currentStepIndex = 2;

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setTracked(true);
    }
  };

  return (
    <PageTransition>
      <div className="track-page">
        <div className="container" style={{ maxWidth: '700px' }}>
          <motion.div
            style={{ textAlign: 'center', marginBottom: '32px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Track Your <span className="text-gradient">Order</span></h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Enter your order number to see the latest status
            </p>
          </motion.div>

          {/* Search */}
          <motion.form
            onSubmit={handleTrack}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                className="form-input"
                style={{ paddingLeft: '44px' }}
                type="text"
                placeholder="Enter order number (e.g. CC-01001)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Track
            </button>
          </motion.form>

          {/* Tracking Timeline */}
          {tracked && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <FiPackage style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>Order {orderNumber || 'CC-01001'}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Estimated delivery: ~30 minutes
                    </p>
                  </div>
                </div>

                <div className="track-timeline">
                  {trackingSteps.map((step, i) => {
                    const isCompleted = i < currentStepIndex;
                    const isActive = i === currentStepIndex;
                    const isFuture = i > currentStepIndex;

                    return (
                      <motion.div
                        key={step.id}
                        className={`track-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isFuture ? 0.4 : 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="track-step-dot" />
                        <div>
                          <div className="track-step-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <step.Icon style={{ fontSize: '1rem', color: isActive ? 'var(--accent-primary)' : isCompleted ? 'var(--success)' : 'var(--text-muted)' }} />
                            {step.label}
                            {isCompleted && <FiCheck style={{ color: 'var(--success)', fontSize: '0.9rem' }} />}
                            {isActive && (
                              <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  background: 'var(--accent-primary)',
                                  color: 'white',
                                  borderRadius: 'var(--radius-full)',
                                  fontWeight: 700,
                                }}
                              >
                                LIVE
                              </motion.span>
                            )}
                          </div>
                          <div className="track-step-time">{step.desc}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
