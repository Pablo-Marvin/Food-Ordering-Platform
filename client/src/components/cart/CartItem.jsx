import { motion } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <motion.div
      className="cart-item"
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>

      <div className="cart-item-info">
        <div className="cart-item-name">{item.name}</div>
        {item.variant && (
          <div className="cart-item-variant">{item.variant}</div>
        )}
        <div className="cart-item-bottom">
          <motion.span
            className="cart-item-price"
            key={item.price * item.quantity}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {formatPrice(item.price * item.quantity)}
          </motion.span>

          <div className="quantity-control">
            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
            >
              <FiMinus />
            </button>
            <motion.span
              className="quantity-value"
              key={item.quantity}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {item.quantity}
            </motion.span>
            <button
              className="quantity-btn"
              onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
            >
              <FiPlus />
            </button>
          </div>
        </div>
      </div>

      <button
        className="cart-item-remove"
        onClick={() => removeItem(item.cartId)}
        title="Remove item"
      >
        <FiTrash2 />
      </button>
    </motion.div>
  );
}
