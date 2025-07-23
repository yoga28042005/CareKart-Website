import React, { createContext, useContext, useState, useEffect } from "react";

// Create the CartContext
const CartContext = createContext();

// CartProvider Component
export const CartProvider = ({ children }) => {
  // Initialize cart items from localStorage or an empty array
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to parse cart items from localStorage", error);
      return [];
    }
  });

  // Sync cart with localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart items to localStorage", error);
    }
  }, [cartItems]);

  // Add item to cart with quantity control
  const addToCart = (product, quantity = 1) => {
    if (!product || typeof product.id === "undefined") {
      console.error("Invalid product added to cart", product);
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        // Update quantity if the product already exists
        return prevItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, 99), // Limit to 99
              }
            : item
        );
      } else {
        // Add new product with validated quantity
        const validQuantity = Math.max(1, Math.min(quantity, 99));
        return [...prevItems, { ...product, quantity: validQuantity }];
      }
    });
  };

  // Update quantity of an item in the cart
  const updateQuantity = (productId, newQuantity) => {
    const validatedQuantity = Math.max(1, Math.min(Number(newQuantity), 99)); // Clamp between 1 and 99
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: validatedQuantity } : item
      )
    );
  };

  // Remove an item from the cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get the total number of items in the cart
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get the total price of items in the cart
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
  };

  // Check if a product is already in the cart
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  // Provide cart context to children components
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};