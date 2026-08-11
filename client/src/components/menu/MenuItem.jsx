import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiShoppingBag, FiZap } from 'react-icons/fi';
import { GiChiliPepper } from 'react-icons/gi';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

export default function MenuItem({ item, index }) {
  const { addItem, openDrawer } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    item.variants?.length > 0 ? item.variants[0] : null
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const currentPrice = selectedVariant ? selectedVariant.price : item.price;

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(item, selectedVariant);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 600);
  };

  return (
    <motion.div
      className="food-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <div className="food-card-image">
        <img src={item.image} alt={item.name} loading="lazy" />
        <div className="food-card-badges">
          {item.isSpicy && (
            <span className="badge badge-spicy"><GiChiliPepper /> Spicy</span>
          )}
          {item.isPopular && (
            <span className="badge badge-popular"><FiZap /> Popular</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="food-card-body">
        <h3 className="food-card-name">{item.name}</h3>
        <p className="food-card-desc">{item.description}</p>

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="food-card-ingredients">
            {item.ingredients.map((ing, i) => (
              <span key={i} className="ingredient-tag">{ing}</span>
            ))}
          </div>
        )}

        {/* Variants */}
        {item.variants && item.variants.length > 0 && (
          <div className="variant-selector">
            {item.variants.map((v) => (
              <button
                key={v.name}
                className={`variant-btn ${selectedVariant?.name === v.name ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
              >
                {v.name} - {formatPrice(v.price)}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="food-card-footer">
          <div className="food-card-price">
            <span>₹</span>{currentPrice}
          </div>
          <motion.button
            className="add-to-cart-btn"
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            animate={addedAnimation ? {
              scale: [1, 1.2, 1],
              backgroundColor: ['', 'rgba(34, 197, 94, 1)', ''],
            } : {}}
          >
            {addedAnimation ? (
              <>
                <FiShoppingBag /> Added!
              </>
            ) : (
              <>
                <FiPlus /> Add
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Premium floating +1 animation */}
      {addedAnimation && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '70px',
            right: '20px',
            backgroundColor: 'var(--success)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
          }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, -10, -20, -30], scale: [0.8, 1.1, 1, 0.9] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <FiShoppingBag /> +1
        </motion.div>
      )}
    </motion.div>
  );
}
