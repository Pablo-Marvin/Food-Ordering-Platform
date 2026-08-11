export const formatPrice = (price) => {
  return `₹${price}`;
};

export const formatOrderNumber = (num) => {
  return num.toUpperCase();
};

export const getCategoryLabel = (category) => {
  const labels = {
    'burgers': 'Burgers',
    'loaded-fries': 'Loaded Fries',
    'fried-chicken': 'Fried Chicken',
    'fries': 'Fries',
    'beverages': 'Beverages',
    'crispy-wraps': 'Crispy Wraps',
    'milkshakes': 'Milkshakes',
    'meal-deals': 'Meal Deals',
    'special-items': 'Special Items',
  };
  return labels[category] || category;
};

// Returns a string key for the icon — components use CategoryIcon to render
export const getCategoryIconKey = (category) => {
  const icons = {
    'burgers': 'burger',
    'loaded-fries': 'fries',
    'fried-chicken': 'drumstick',
    'fries': 'fries',
    'beverages': 'coffee',
    'crispy-wraps': 'wrap',
    'milkshakes': 'glass',
    'meal-deals': 'package',
    'special-items': 'star',
  };
  return icons[category] || 'utensils';
};

export const getCategoryName = (category) => {
  const names = {
    'burgers': 'Burgers',
    'loaded-fries': 'Loaded Fries',
    'fried-chicken': 'Fried Chicken',
    'fries': 'Fries',
    'beverages': 'Beverages',
    'crispy-wraps': 'Crispy Wraps',
    'milkshakes': 'Milkshakes',
    'meal-deals': 'Meal Deals',
    'special-items': 'Special Items',
  };
  return names[category] || category;
};

export const CATEGORIES = [
  'burgers',
  'loaded-fries',
  'fried-chicken',
  'fries',
  'beverages',
  'crispy-wraps',
  'milkshakes',
  'meal-deals',
  'special-items',
];

export const generateCartItemId = (itemId, variant) => {
  return variant ? `${itemId}__${variant}` : itemId;
};
