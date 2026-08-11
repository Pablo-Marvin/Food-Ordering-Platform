import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { FiCheck, FiClock, FiMapPin, FiPackage } from 'react-icons/fi';
import PageTransition from '../components/layout/PageTransition';
import { formatPrice } from '../utils/helpers';
import { orderAPI } from '../utils/api';
import { useCart } from '../context/CartContext';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order && !!searchParams.get('order'));
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = searchParams.get('order');
      const sessionId = searchParams.get('session_id');
      
      if (orderId && !order) {
        try {
          const res = await orderAPI.getById(orderId);
          if (res.success) {
            setOrder(res.data);
            if (sessionId) clearCart(); // clear cart if we came back from stripe successfully
          }
        } catch (err) {
          console.error('Failed to fetch order', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', handleResize); };
  }, [searchParams, order, clearCart]);

  if (loading) {
    return (
      <PageTransition>
        <div className="order-success">
          <div className="success-content">
            <h2>Verifying payment...</h2>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="order-success">
          <div className="success-content">
            <h2>No order found</h2>
            <p style={{ color: 'var(--text-muted)', margin: '16px 0' }}>
              Looks like you arrived here without placing an order.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>
              Go to Menu
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={['#DC2626', '#F97316', '#F59E0B', '#22C55E', '#FAFAFA']}
        />
      )}
      <div className="order-success">
        <div className="success-content">
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <FiCheck style={{ color: 'var(--success)' }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Order <span className="text-gradient">Placed!</span> 🎉
          </motion.h1>

          <motion.p
            style={{ color: 'var(--text-secondary)', marginTop: '8px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your delicious food is being prepared!
          </motion.p>

          <motion.div
            className="success-order-number"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {order.orderNumber}
          </motion.div>

          <motion.div
            className="success-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="success-detail-row">
              <span className="label"><FiPackage /> Order Type</span>
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                {order.orderType === 'delivery' ? '🛵 Delivery' : '🏪 Pickup'}
              </span>
            </div>
            <div className="success-detail-row">
              <span className="label"><FiClock /> Estimated Time</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-warm)' }}>
                ~{order.estimatedTime} minutes
              </span>
            </div>
            {order.orderType === 'delivery' && (
              <div className="success-detail-row">
                <span className="label"><FiMapPin /> Distance</span>
                <span>{order.distance} km</span>
              </div>
            )}
            <div className="success-detail-row">
              <span className="label">💳 Payment</span>
              <span style={{ textTransform: 'capitalize' }}>
                {order.paymentMethod === 'online' ? 'Online (Demo)' : 'Cash on Delivery'}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '12px',
              paddingTop: '12px',
            }}>
              <div className="success-detail-row">
                <span className="label">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="success-detail-row">
                <span className="label">Delivery</span>
                <span style={{ color: order.isFirstOrder ? 'var(--success)' : '' }}>
                  {order.deliveryCharge === 0
                    ? (order.isFirstOrder ? '🎉 FREE' : 'Free (Pickup)')
                    : formatPrice(order.deliveryCharge)
                  }
                </span>
              </div>
              <div className="success-detail-row" style={{
                fontWeight: 800,
                fontSize: '1.2rem',
                fontFamily: 'var(--font-heading)',
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-warm)' }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/track" state={{ orderNumber: order.orderNumber }}>
              <button className="btn btn-primary">Track Order</button>
            </Link>
            <button className="btn btn-secondary" onClick={() => navigate('/menu')}>
              Order More
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
