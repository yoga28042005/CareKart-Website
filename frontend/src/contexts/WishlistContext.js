import React, { createContext, useContext, useState, useEffect } from "react";

// Create Wishlist Context
const WishlistContext = createContext();

// Provider Component
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load wishlist from localStorage", error);
      return [];
    }
  });

  // Sync wishlist with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
    }
  }, [wishlist]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    if (!product || typeof product.id === "undefined") {
      console.error("Invalid product added to wishlist", product);
      return;
    }

    setWishlist((prevItems) => {
      const alreadyExists = prevItems.some((item) => item.id === product.id);
      if (alreadyExists) return prevItems;
      return [...prevItems, product];
    });
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Clear all wishlist items
  const clearWishlist = () => {
    setWishlist([]);
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the WishlistContext
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
