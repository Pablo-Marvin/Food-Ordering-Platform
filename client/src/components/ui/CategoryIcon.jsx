import {
  GiHamburger,
  GiFrenchFries,
  GiChickenLeg,
  GiWrappedSweet,
  GiCoffeeCup,
  GiMilkCarton,
  GiStarShuriken,
} from 'react-icons/gi';
import { FiPackage, FiStar } from 'react-icons/fi';
import { getCategoryIconKey } from '../../utils/helpers';

const iconMap = {
  burger: GiHamburger,
  fries: GiFrenchFries,
  drumstick: GiChickenLeg,
  wrap: GiWrappedSweet,
  coffee: GiCoffeeCup,
  glass: GiMilkCarton,
  package: FiPackage,
  star: GiStarShuriken,
  utensils: FiStar,
};

export default function CategoryIcon({ category, size = '1.3rem', color, className = '' }) {
  const key = getCategoryIconKey(category);
  const Icon = iconMap[key] || FiStar;
  return <Icon style={{ fontSize: size, color: color || 'var(--accent-warm)', flexShrink: 0 }} className={className} />;
}
