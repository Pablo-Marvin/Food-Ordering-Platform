import { createContext, useContext, useReducer, useEffect } from 'react';
import { generateCartItemId } from '../utils/helpers';

const CartContext = createContext();

const STORAGE_KEY = 'crispiest-chicken-cart';

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save cart:', e);
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, variant } = action.payload;
      const cartId = generateCartItemId(item.id, variant?.name);
      const existingIndex = state.items.findIndex(i => i.cartId === cartId);

      let newItems;
      if (existingIndex > -1) {
        newItems = state.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        const newItem = {
          cartId,
          menuItemId: item.id,
          name: item.name,
          variant: variant?.name || '',
          price: variant?.price || item.price,
          image: item.image,
          quantity: 1,
        };
        newItems = [...state.items, newItem];
      }
      return { ...state, items: newItems };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(i => i.cartId !== action.payload);
      return { ...state, items: newItems };
    }

    case 'UPDATE_QUANTITY': {
      const { cartId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.cartId !== cartId) };
      }
      const newItems = state.items.map(i =>
        i.cartId === cartId ? { ...i, quantity } : i
      );
      return { ...state, items: newItems };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen };

    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true };

    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false };

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: loadCartFromStorage(),
    isDrawerOpen: false,
  });

  // Persist cart to localStorage
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  const addItem = (item, variant = null) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, variant } });
  };

  const removeItem = (cartId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartId });
  };

  const updateQuantity = (cartId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleDrawer = () => dispatch({ type: 'TOGGLE_DRAWER' });
  const openDrawer = () => dispatch({ type: 'OPEN_DRAWER' });
  const closeDrawer = () => dispatch({ type: 'CLOSE_DRAWER' });

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = {
    items: state.items,
    isDrawerOpen: state.isDrawerOpen,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    openDrawer,
    closeDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
