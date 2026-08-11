import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock, FiHeart } from 'react-icons/fi';
import { GiChickenLeg } from 'react-icons/gi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-wrapper">
              <img src="/images/logo.jpg" alt="Crispiest Chicken" className="footer-logo-img" />
            </div>
            <p>
              Serving the crispiest, most delicious fried chicken in Chengalpattu.
              Made with love and the finest ingredients. Good to Go! <GiChickenLeg style={{ color: 'var(--accent-warm)', verticalAlign: 'middle' }} />
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiMapPin style={{ color: 'var(--accent-primary)' }} /> Chengalpattu, Tamil Nadu
              </span>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Full Menu</Link></li>
              <li><Link to="/checkout">Checkout</Link></li>
              <li><Link to="/track">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/menu">Burgers</Link></li>
              <li><Link to="/menu">Fried Chicken</Link></li>
              <li><Link to="/menu">Crispy Wraps</Link></li>
              <li><Link to="/menu">Meal Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Info</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                <FiClock style={{ color: 'var(--accent-warm)', flexShrink: 0 }} /> 11 AM - 11 PM
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                <FiPhone style={{ color: 'var(--accent-warm)', flexShrink: 0 }} /> Contact Us
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <FiMapPin style={{ color: 'var(--accent-warm)', flexShrink: 0 }} /> Pickup Available
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Crispiest Chicken. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Made with <FiHeart style={{ color: 'var(--accent-primary)' }} /> in Chengalpattu
          </span>
        </div>
      </div>
    </footer>
  );
}
