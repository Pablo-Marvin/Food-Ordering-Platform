import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import MenuCategory from '../components/menu/MenuCategory';
import CategoryIcon from '../components/ui/CategoryIcon';
import menuData from '../data/menuData';
import { CATEGORIES, getCategoryName } from '../utils/helpers';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('all');

  const groupedMenu = useMemo(() => {
    const groups = {};
    const cats = activeCategory === 'all' ? CATEGORIES : [activeCategory];
    cats.forEach((cat) => {
      const items = menuData.filter((item) => item.category === cat);
      if (items.length > 0) {
        groups[cat] = items;
      }
    });
    return groups;
  }, [activeCategory]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    if (cat !== 'all') {
      setTimeout(() => {
        const el = document.getElementById(`category-${cat}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <PageTransition>
      <div className="menu-page">
        <div className="container">
          <motion.div
            className="menu-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>
              Our <span className="text-gradient">Menu</span>
            </h1>
            <p>Crispy, crunchy, and absolutely delicious — pick your favorites!</p>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          <div className="category-tabs-inner">
            <button
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => scrollToCategory(cat)}
              >
                <CategoryIcon category={cat} size="1rem" color={activeCategory === cat ? 'white' : 'var(--accent-warm)'} />
                {getCategoryName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Content */}
        <div className="container">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <MenuCategory key={category} category={category} items={items} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
