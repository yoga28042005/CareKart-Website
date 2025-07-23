// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import { CartProvider } from './contexts/CartContext';
import CheckoutPage from './pages/CheckoutPage'; 
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import BillingPage from './pages/BillingPage';
import { WishlistProvider } from './contexts/WishlistContext';
import WishlistPage from './pages/WishlistPage';
import OrderHistory from './pages/OrderHistory';
import About from './pages/About';
import Contact from './pages/Contact';

// Add this route



// adjust path if needed


function App() {
  return (
    <CartProvider>
      <WishlistProvider>
       <Router>
         <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products/:category" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/paymentsuccess" element={<PaymentSuccessPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
         </Routes>
       </Router>
     </WishlistProvider>
    </CartProvider>
  );
}

export default App;