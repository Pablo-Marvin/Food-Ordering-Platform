import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import { formatPrice } from '../../utils/helpers';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, itemCount, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="cart-header">
              <h2>
                <FiShoppingBag /> Your Cart
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                    }}
                  >
                    ({itemCount} items)
                  </motion.span>
                )}
              </h2>
              <button className="cart-close" onClick={closeDrawer}>
                <FiX />
              </button>
            </div>

            {/* Items */}
            <div className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <motion.div 
                    className="cart-empty-icon"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                    style={{ color: 'var(--text-muted)', fontSize: '4rem', marginBottom: '1rem' }}
                  >
                    <FiShoppingBag />
                  </motion.div>
                  <h3>Your cart is empty</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Add some delicious items from our menu!
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      closeDrawer();
                      navigate('/menu');
                    }}
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItem key={item.cartId} item={item} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                className="cart-footer"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="cart-summary-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="cart-summary-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Calculated at checkout</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Estimated Total</span>
                  <span className="cart-total-price">{formatPrice(subtotal)}</span>
                </div>

                <motion.button
                  className="btn btn-primary cart-checkout-btn"
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed to Checkout <FiArrowRight />
                </motion.button>

                <button
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                  }}
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
