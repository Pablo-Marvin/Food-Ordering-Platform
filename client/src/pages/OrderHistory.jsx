import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiPackage, FiShoppingBag, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import { formatPrice } from '../utils/helpers';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getMyOrders();
        if (response.success) {
          setOrders(response.data);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('An error occurred while fetching your order history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'placed':
      case 'confirmed':
        return 'badge-info';
      case 'preparing':
      case 'ready':
        return 'badge-warning';
      case 'out_for_delivery':
      case 'picked_up':
        return 'badge-primary';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading your orders...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <FiShoppingBag size={28} style={{ color: 'var(--primary)', marginRight: '16px' }} />
            <h1 style={{ margin: 0, fontSize: '2rem' }}>My Orders</h1>
          </div>

          {error && (
            <div style={{
              padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px'
            }}>
              <FiAlertCircle /> {error}
            </div>
          )}

          {orders.length === 0 && !error ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)'
            }}>
              <FiPackage size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h2>No Orders Yet</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Looks like you haven't placed any orders with us yet.
              </p>
              <Link to="/menu" className="btn btn-primary">
                Explore Menu
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>
                        {order.orderNumber}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiClock /> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiPackage /> {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {formatPrice(order.total)}
                      </div>
                      <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                        {getStatusText(order.orderStatus)}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Items</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>{item.quantity}x {item.name} {item.variant ? `(${item.variant})` : ''}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <Link
                      to={`/track?orderId=${order.orderNumber}`}
                      className="btn btn-outline"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      Track Order <FiChevronRight />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
