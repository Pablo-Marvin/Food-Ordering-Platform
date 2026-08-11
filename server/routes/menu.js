const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Full menu data for initial seeding
const menuData = [
  // BURGERS
  { name: 'Eco Strip Burger', category: 'burgers', price: 99, description: 'Lettuce / Strip / Tandoori', ingredients: ['Lettuce', 'Strip', 'Tandoori'], image: '/images/burger.png', isSpicy: false, isPopular: false, variants: [] },
  { name: 'Korean Burger', category: 'burgers', price: 169, description: 'Lettuce / Fried Chicken / Tandoori', ingredients: ['Lettuce', 'Fried Chicken', 'Tandoori'], image: '/images/korean-burger.png', isSpicy: true, isPopular: true, variants: [] },
  { name: 'BBQ Burger', category: 'burgers', price: 169, description: 'Lettuce / Fried Chicken / Tandoori', ingredients: ['Lettuce', 'Fried Chicken', 'Tandoori'], image: '/images/burger.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Nashville Burger', category: 'burgers', price: 189, description: 'Lettuce / Fried Chicken / Tandoori', ingredients: ['Lettuce', 'Fried Chicken', 'Tandoori'], image: '/images/burger.png', isSpicy: true, isPopular: true, variants: [] },
  { name: 'Cheesy Burger', category: 'burgers', price: 199, description: 'Lettuce / Fried Chicken / Tandoori', ingredients: ['Lettuce', 'Fried Chicken', 'Tandoori'], image: '/images/burger.png', isSpicy: false, isPopular: true, variants: [] },

  // LOADED FRIES
  { name: 'Chicken Loaded', category: 'loaded-fries', price: 169, description: 'Fries / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Fries', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/loaded-fries.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Korean Loaded', category: 'loaded-fries', price: 189, description: 'Fries / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Fries', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/loaded-fries.png', isSpicy: true, isPopular: false, variants: [] },
  { name: 'BBQ Loaded', category: 'loaded-fries', price: 189, description: 'Fries / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Fries', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/loaded-fries.png', isSpicy: false, isPopular: false, variants: [] },
  { name: 'Nashville Loaded', category: 'loaded-fries', price: 199, description: 'Fries / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Fries', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/loaded-fries.png', isSpicy: true, isPopular: false, variants: [] },

  // FRIED CHICKEN - Hot N' Crispy
  { name: "Hot N' Crispy Chicken", category: 'fried-chicken', price: 89, description: '1 Piece of golden crispy fried chicken', ingredients: [], image: '/images/fried-chicken.png', isSpicy: true, isPopular: true, variants: [{ name: '1 PCS', price: 89 }, { name: '2 PCS', price: 169 }, { name: '8 PCS', price: 666 }] },

  // FRIED CHICKEN - Boneless Strips
  { name: 'Boneless Strips - Crispy', category: 'fried-chicken', price: 99, description: 'Crispy boneless chicken strips', ingredients: [], image: '/images/boneless-strips.png', isSpicy: false, isPopular: true, variants: [{ name: '3 PCS', price: 99 }, { name: '8 PCS', price: 222 }] },
  { name: 'Boneless Strips - Saucy', category: 'fried-chicken', price: 135, description: 'Saucy boneless chicken strips', ingredients: [], image: '/images/boneless-strips.png', isSpicy: true, isPopular: false, variants: [{ name: '3 PCS', price: 135 }, { name: '8 PCS', price: 245 }] },

  // FRIED CHICKEN - Popcorn
  { name: 'Popcorn Chicken - Crispy', category: 'fried-chicken', price: 79, description: '100 Grams of crispy popcorn chicken', ingredients: [], image: '/images/popcorn-chicken.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Popcorn Chicken - Saucy', category: 'fried-chicken', price: 99, description: '100 Grams of saucy popcorn chicken', ingredients: [], image: '/images/popcorn-chicken.png', isSpicy: true, isPopular: false, variants: [] },

  // FRIED CHICKEN - Hot Wings
  { name: 'Hot Wings - Crispy', category: 'fried-chicken', price: 119, description: '4 Pieces of crispy hot wings', ingredients: [], image: '/images/hot-wings.png', isSpicy: true, isPopular: true, variants: [] },
  { name: 'Hot Wings - Saucy', category: 'fried-chicken', price: 135, description: '4 Pieces of saucy hot wings', ingredients: [], image: '/images/hot-wings.png', isSpicy: true, isPopular: false, variants: [] },

  // FRIED CHICKEN - Lollipop
  { name: 'Lollipop - Crispy', category: 'fried-chicken', price: 119, description: '4 Pieces of crispy chicken lollipop', ingredients: [], image: '/images/chicken-lollipop.png', isSpicy: false, isPopular: false, variants: [] },
  { name: 'Lollipop - Saucy', category: 'fried-chicken', price: 135, description: '4 Pieces of saucy chicken lollipop', ingredients: [], image: '/images/chicken-lollipop.png', isSpicy: true, isPopular: false, variants: [] },

  // FRIES
  { name: 'Classic Fries', category: 'fries', price: 69, description: 'Golden crispy french fries', ingredients: [], image: '/images/classic-fries.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Mexicano Fries', category: 'fries', price: 79, description: 'Spiced fries with Mexican seasoning', ingredients: [], image: '/images/classic-fries.png', isSpicy: true, isPopular: false, variants: [] },

  // BEVERAGES
  { name: 'Classic Mint', category: 'beverages', price: 69, description: 'Refreshing classic mint mojito', ingredients: [], image: '/images/beverage.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Blue Curacao', category: 'beverages', price: 69, description: 'Cool blue curacao mocktail', ingredients: [], image: '/images/beverage.png', isSpicy: false, isPopular: false, variants: [] },

  // CRISPY WRAPS
  { name: 'Crispy Wrap', category: 'crispy-wraps', price: 119, description: 'Onion / Lettuce / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Onion', 'Lettuce', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/crispy-wrap.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Korean Wrap', category: 'crispy-wraps', price: 139, description: 'Onion / Lettuce / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Onion', 'Lettuce', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/crispy-wrap.png', isSpicy: true, isPopular: false, variants: [] },
  { name: 'BBQ Wrap', category: 'crispy-wraps', price: 139, description: 'Onion / Lettuce / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Onion', 'Lettuce', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/crispy-wrap.png', isSpicy: false, isPopular: false, variants: [] },
  { name: 'Nashville Wrap', category: 'crispy-wraps', price: 149, description: 'Onion / Lettuce / Mayo / Tandoori / Ketchup / Chicken', ingredients: ['Onion', 'Lettuce', 'Mayo', 'Tandoori', 'Ketchup', 'Chicken'], image: '/images/crispy-wrap.png', isSpicy: true, isPopular: false, variants: [] },

  // MILKSHAKES
  { name: 'Milo Shakes', category: 'milkshakes', price: 149, description: 'Rich and creamy Milo milkshake', ingredients: [], image: '/images/milkshake.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Chocolate Boba', category: 'milkshakes', price: 160, description: 'Chocolate milkshake with boba pearls', ingredients: [], image: '/images/milkshake.png', isSpicy: false, isPopular: true, variants: [] },

  // MEAL DEALS
  { name: 'Crunch & Chill Combo', category: 'meal-deals', price: 199, description: 'Burger / Fries / Mojito', ingredients: ['Burger', 'Fries', 'Mojito'], image: '/images/meal-deal.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Laugh - A Byte Combo', category: 'meal-deals', price: 299, description: 'Loaded Fries / Milkshake', ingredients: ['Loaded Fries', 'Milkshake'], image: '/images/meal-deal.png', isSpicy: false, isPopular: false, variants: [] },
  { name: 'Korian Blast', category: 'meal-deals', price: 399, description: 'Burger / Popcorn / Fries / Mojito', ingredients: ['Burger', 'Popcorn', 'Fries', 'Mojito'], image: '/images/meal-deal.png', isSpicy: true, isPopular: true, variants: [] },
  { name: 'Collective Crunch', category: 'meal-deals', price: 666, description: 'Popcorn / Cheesy Quesadilla / Chicken Loaded / Milo Shake / Burger', ingredients: ['Popcorn', 'Cheesy Quesadilla', 'Chicken Loaded', 'Milo Shake', 'Burger'], image: '/images/meal-deal.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Chicken Crunch Duo', category: 'meal-deals', price: 169, description: 'Burger / Chicken Pop', ingredients: ['Burger', 'Chicken Pop'], image: '/images/meal-deal.png', isSpicy: false, isPopular: false, variants: [] },
  { name: 'Fried Chicken Delight', category: 'meal-deals', price: 219, description: 'Boneless Strips 3 PCS / Hot Wings 4 PCS', ingredients: ['Boneless Strips 3 PCS', 'Hot Wings 4 PCS'], image: '/images/meal-deal.png', isSpicy: true, isPopular: false, variants: [] },
  { name: 'Nashville Heat', category: 'meal-deals', price: 319, description: 'Burger / Hot Wings / Mojito', ingredients: ['Burger', 'Hot Wings', 'Mojito'], image: '/images/meal-deal.png', isSpicy: true, isPopular: true, variants: [] },
  { name: "Mingle N' Chunch", category: 'meal-deals', price: 777, description: "2 Hot Wings (3 PCS) / 2 Boneless Strips (6 PCS) / Hot N' Crispy Chicken (4 PCS)", ingredients: ['Hot Wings 3 PCS x2', 'Boneless Strips 6 PCS x2', "Hot N' Crispy Chicken 4 PCS"], image: '/images/meal-deal.png', isSpicy: true, isPopular: true, variants: [] },
  { name: 'Spice Pop Chicken', category: 'meal-deals', price: 199, description: 'Hot Wings / Chicken Pop', ingredients: ['Hot Wings', 'Chicken Pop'], image: '/images/meal-deal.png', isSpicy: true, isPopular: false, variants: [] },
  { name: 'Tastey Treat Chicken', category: 'meal-deals', price: 319, description: 'Brownie / Popcorn / Burger / Mojito', ingredients: ['Brownie', 'Popcorn', 'Burger', 'Mojito'], image: '/images/meal-deal.png', isSpicy: false, isPopular: false, variants: [] },
  { name: 'Squad Crunch Duo', category: 'meal-deals', price: 599, description: 'Wrap / Popcorn / Burger / Loaded Fries / Milo Shake', ingredients: ['Wrap', 'Popcorn', 'Burger', 'Loaded Fries', 'Milo Shake'], image: '/images/meal-deal.png', isSpicy: false, isPopular: true, variants: [] },

  // SPECIAL ITEMS
  { name: 'Kimichi Loaded', category: 'special-items', price: 199, description: 'Korean style kimchi loaded fries', ingredients: [], image: '/images/kimchi-loaded.png', isSpicy: true, isPopular: true, variants: [] },
  { name: '½ KG Jumbo Roll', category: 'special-items', price: 179, description: 'Half kilogram jumbo chicken roll', ingredients: [], image: '/images/jumbo-roll.png', isSpicy: false, isPopular: true, variants: [] },
  { name: 'Cheesy Quesadilla', category: 'special-items', price: 169, description: 'Cheesy chicken quesadilla', ingredients: [], image: '/images/quesadilla.png', isSpicy: false, isPopular: false, variants: [] },
  { name: '15 PCS Bucket', category: 'special-items', price: 399, description: '15 pieces of crispy fried chicken', ingredients: [], image: '/images/chicken-bucket.png', isSpicy: false, isPopular: true, variants: [] },
];

// Helper to seed DB if empty
const seedDBIfEmpty = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      console.log('Seeding initial menu data to MongoDB...');
      await MenuItem.insertMany(menuData);
      console.log('Menu seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to seed menu:', error);
  }
};

// Seed on module load
seedDBIfEmpty();

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) query.category = category;

    const items = await MenuItem.find(query);
    
    // Map _id to id for backwards compatibility with frontend
    const mappedItems = items.map(item => ({
      ...item.toObject(),
      id: item._id.toString()
    }));

    res.json({ success: true, data: mappedItems, count: mappedItems.length });
  } catch (error) {
    console.error('Fetch menu error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching menu' });
  }
});

// GET menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    const mappedItem = { ...item.toObject(), id: item._id.toString() };
    res.json({ success: true, data: mappedItem });
  } catch (error) {
    console.error('Fetch menu item error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching menu item' });
  }
});

// GET all categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching categories' });
  }
});

module.exports = router;
