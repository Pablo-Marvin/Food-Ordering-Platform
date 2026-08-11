import { motion } from 'framer-motion';
import MenuItem from './MenuItem';
import CategoryIcon from '../ui/CategoryIcon';
import { getCategoryName } from '../../utils/helpers';

export default function MenuCategory({ category, items }) {
  return (
    <motion.section
      id={`category-${category}`}
      className="category-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="category-title">
        <span className="category-title-icon">
          <CategoryIcon category={category} size="1.5rem" />
        </span>
        <span>{getCategoryName(category)}</span>
        <div className="category-title-line" />
      </div>
      <div className="menu-grid">
        {items.map((item, index) => (
          <MenuItem key={item.id} item={item} index={index} />
        ))}
      </div>
    </motion.section>
  );
}
