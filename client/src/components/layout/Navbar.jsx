import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, toggleDrawer } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/track', label: 'Track Order' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src="/images/logo.jpg" alt="Crispiest Chicken" />
            <div className="navbar-logo-text">
              Crispiest <span>Chicken</span>
            </div>
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            {user ? (
              <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="user-name" style={{ color: 'var(--text-secondary)' }}>
                  <FiUser /> {user.name}
                </span>
                <Link 
                  to="/orders" 
                  className={`navbar-link ${location.pathname === '/orders' ? 'active' : ''}`}
                  style={{ margin: 0, padding: 0 }}
                >
                  My Orders
                </Link>
                <button className="btn-logout" onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn-login">Login</Link>
            )}

            <motion.button
              className="cart-button"
              onClick={toggleDrawer}
              whileTap={{ scale: 0.95 }}
            >
              <FiShoppingCart />
              <span>Cart</span>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    className="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={itemCount}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="mobile-menu-close"
              onClick={() => setMobileOpen(false)}
            >
              <FiX />
            </button>
            
            {user ? (
              <div className="mobile-user-info" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p>Welcome, {user.name}!</p>
                <Link to="/orders" className="btn btn-primary" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <button className="btn btn-outline" onClick={() => { logout(); setMobileOpen(false); }}>Logout</button>
              </div>
            ) : (
              <div className="mobile-auth-links">
                <Link to="/login" className="btn btn-outline" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className="mobile-menu-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '20px' }}
                onClick={() => {
                  setMobileOpen(false);
                  toggleDrawer();
                }}
              >
                <FiShoppingCart /> Cart ({itemCount})
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
