import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin, FiTruck, FiClock, FiStar, FiAward, FiZap, FiHeart } from 'react-icons/fi';
import { GiChickenLeg, GiHamburger, GiFrenchFries, GiWrappedSweet, GiStarShuriken } from 'react-icons/gi';
import PageTransition from '../components/layout/PageTransition';

const floatingItems = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 6,
  color: ['#DC2626', '#F97316', '#F59E0B', '#FCA5A5', '#7C2D12'][Math.floor(Math.random() * 5)],
  duration: 3 + Math.random() * 6,
  delay: Math.random() * 6,
  drift: -40 + Math.random() * 80,
}));

const categories = [
  { name: 'Burgers', image: '/images/burger.png', count: 5, Icon: GiHamburger },
  { name: 'Fried Chicken', image: '/images/fried-chicken.png', count: 9, Icon: GiChickenLeg },
  { name: 'Loaded Fries', image: '/images/loaded-fries.png', count: 4, Icon: GiFrenchFries },
  { name: 'Crispy Wraps', image: '/images/crispy-wrap.png', count: 4, Icon: GiWrappedSweet },
  { name: 'Meal Deals', image: '/images/meal-deal.png', count: 11, Icon: FiAward },
  { name: 'Special Items', image: '/images/kimchi-loaded.png', count: 4, Icon: GiStarShuriken },
];

const popularItems = [
  { name: 'Nashville Burger', price: 189, image: '/images/burger.png', tag: 'Bestseller', TagIcon: FiZap },
  { name: "Hot N' Crispy Chicken", price: 89, image: '/images/fried-chicken.png', tag: 'Must Try', TagIcon: FiStar },
  { name: 'Korean Loaded', price: 189, image: '/images/loaded-fries.png', tag: 'Spicy', TagIcon: FiHeart },
  { name: "Mingle N' Chunch", price: 777, image: '/images/meal-deal.png', tag: 'Premium', TagIcon: FiAward },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      {/* ═══ HERO SECTION ═══ */}
      <section className="hero">
        {/* Background glows */}
        <div className="hero-bg-glow glow-1" />
        <div className="hero-bg-glow glow-2" />
        <div className="hero-bg-glow glow-3" />

        {/* Floating particles */}
        <div className="fire-particles">
          {floatingItems.map((p) => (
            <div
              key={p.id}
              className="fire-particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                '--duration': `${p.duration}s`,
                '--delay': `${p.delay}s`,
                '--drift': `${p.drift}px`,
              }}
            />
          ))}
        </div>

        {/* Noise overlay */}
        <div className="hero-noise" />

        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GiChickenLeg style={{ fontSize: '1.1rem' }} /> #1 Fried Chicken in Chengalpattu
              </motion.div>

              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                The <span className="text-gradient">Crispiest</span> Chicken,{' '}
                <span style={{ color: 'var(--accent-warm)' }}>Good to Go!</span>
              </motion.h1>

              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Crispy on the outside, juicy on the inside. From Nashville heat to Korean fire —
                every bite is an explosion of flavor. Order now for delivery or pickup!
              </motion.p>

              <motion.div
                className="hero-cta-group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  className="btn btn-primary btn-lg animate-glow"
                  onClick={() => navigate('/menu')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Order Now <FiArrowRight />
                </motion.button>
                <motion.button
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate('/menu')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Menu
                </motion.button>
              </motion.div>

              <motion.div
                className="hero-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div>
                  <div className="hero-stat-value">50+</div>
                  <div className="hero-stat-label">Menu Items</div>
                </div>
                <div>
                  <div className="hero-stat-value">30min</div>
                  <div className="hero-stat-label">Avg. Delivery</div>
                </div>
                <div>
                  <div className="hero-stat-value">
                    4.8<FiStar style={{ fontSize: '0.7em', verticalAlign: 'super', color: 'var(--accent-gold)' }} />
                  </div>
                  <div className="hero-stat-label">Customer Rating</div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="hero-image-wrapper"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
            >
              <div className="hero-image-ring" />
              <div className="hero-image-ring ring-2" />
              <img
                src="/images/fried-chicken.png"
                alt="Crispy Fried Chicken"
                className="hero-image"
                style={{ borderRadius: '24px' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ DELIVERY INFO STRIP ═══ */}
      <section className="info-strip">
        <div className="container">
          <div className="info-strip-inner">
            <span className="info-strip-item">
              <FiTruck /> Delivery in Chengalpattu Area
            </span>
            <span className="info-strip-item">
              <FiMapPin /> Pickup Available
            </span>
            <span className="info-strip-item">
              <FiClock /> 4 PM - 11 PM
            </span>
            <span className="info-strip-item">
              <FiStar /> First Order Free Delivery
            </span>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED CATEGORIES ═══ */}
      <section className="section section-rich">
        <div className="section-bg-accent" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="featured-header">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Explore Our <span className="text-gradient">Menu</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Choose from our delicious categories
            </motion.p>
          </div>

          <div className="featured-grid">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                className="featured-category-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate('/menu')}
              >
                <img src={cat.image} alt={cat.name} />
                <div className="featured-category-overlay">
                  <cat.Icon className="featured-category-icon-svg" />
                  <div className="featured-category-name">{cat.name}</div>
                  <div className="featured-category-count">{cat.count} items</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ POPULAR ITEMS ═══ */}
      <section className="section section-dark">
        <div className="container">
          <div className="featured-header">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <FiZap style={{ color: 'var(--accent-warm)', marginRight: '8px' }} />
              Most <span className="text-gradient">Popular</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              What everyone's ordering right now
            </motion.p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {popularItems.map((item, i) => (
              <motion.div
                key={item.name}
                className="food-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate('/menu')}
                style={{ cursor: 'pointer' }}
              >
                <div className="food-card-image">
                  <img src={item.image} alt={item.name} />
                  <div className="food-card-badges">
                    <span className="badge badge-popular">
                      <item.TagIcon style={{ fontSize: '0.65rem' }} /> {item.tag}
                    </span>
                  </div>
                </div>
                <div className="food-card-body">
                  <h3 className="food-card-name">{item.name}</h3>
                  <div className="food-card-footer" style={{ marginTop: '12px' }}>
                    <div className="food-card-price">
                      <span>₹</span>{item.price}
                    </div>
                    <button className="add-to-cart-btn" onClick={(e) => { e.stopPropagation(); navigate('/menu'); }}>
                      View <FiArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="section section-cta">
        <div className="section-bg-accent" />
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.h2
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Hungry? <span className="text-gradient">We Got You!</span>
          </motion.h2>
          <motion.p
            style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Order now and get your food delivered hot and crispy right to your door in Chengalpattu.
          </motion.p>
          <motion.button
            className="btn btn-primary btn-lg animate-glow"
            onClick={() => navigate('/menu')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GiChickenLeg /> Order Now <FiArrowRight />
          </motion.button>
        </div>
      </section>
    </PageTransition>
  );
}
