// Enhanced Tailwind CSS version of ProductDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/product/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;
    navigate('/checkout', {
      state: {
        items: [{ ...product, quantity }],
        totalPrice: product.price * quantity,
      },
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    alert(`Added ${quantity} ${product.name}(s) to cart`);
  };

  const handleStarClick = (star) => {
    setRating((prev) => (prev === star ? 0 : star));
  };

  const handleImageClick = () => {
    if (product?.image_url) {
      setFullscreenImage(`http://localhost:3000/images/${product.image_url}`);
    }
  };

  const isInWishlist = wishlist.some((item) => item.id === product?.id);

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist) {
      removeFromWishlist(product.id);
      alert('Removed from Wishlist');
    } else {
      addToWishlist(product);
      alert('Added to Wishlist');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-xl font-semibold text-pink-600">Loading product details...</div>
    </div>
  );
  
  if (!product) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-xl font-semibold text-red-500">Product not found</div>
    </div>
  );

  const price = Number(product.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 text-white shadow-lg bg-gradient-to-r from-pink-600 to-purple-600 h-14">
        <div 
          className="text-2xl font-bold cursor-pointer font-logo hover:text-pink-200" 
          onClick={() => navigate('/')}
        >
          CareKart
        </div>
        <div className="flex space-x-6 text-sm font-medium">
          <span className="cursor-pointer hover:text-pink-200" onClick={() => navigate('/')}>Home</span>
          <span className="cursor-pointer hover:text-pink-200" onClick={() => navigate('/home')}>Categories</span>
          <span className="cursor-pointer hover:text-pink-200" onClick={() => navigate('/cart')}>Cart</span>
          <span className="cursor-pointer hover:text-pink-200" onClick={() => navigate('/wishlist')}>Wishlist</span>
          <span className="cursor-pointer hover:text-pink-200" onClick={() => navigate('/about')}>About</span>
          <span className="cursor-pointer hover:text-pink-200" onClick={() => navigate('/contact')}>Contact Us</span>
        </div>
      </nav>

      <div className="container px-4 py-6 mx-auto mt-20">
        <h1 className="mb-10 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          {product.name}
        </h1>

        <div className="flex flex-col gap-10 md:flex-row">
          {/* Product Image */}
          <div className="flex items-center justify-center w-full p-8 transition-shadow duration-300 bg-white rounded-lg shadow-lg md:w-1/2 hover:shadow-xl">
            <img
              src={product.image_url ? `http://localhost:3000/images/${product.image_url}` : 'https://via.placeholder.com/300'}
              alt={product.name}
              className="object-contain transition-transform duration-300 cursor-pointer h-80 hover:scale-105"
              onClick={handleImageClick}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col w-full gap-6 p-6 transition-shadow duration-300 bg-white rounded-lg shadow-lg md:w-1/2 hover:shadow-xl">
            <p className="text-lg leading-relaxed text-gray-700">{product.description}</p>

            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                ₹{isNaN(price) ? 'N/A' : price.toFixed(2)}
              </span>
              <span className={`text-lg font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Add to wishlist:</span>
                <span
                  className={`text-3xl cursor-pointer select-none transition-transform hover:scale-110 ${isInWishlist ? 'text-pink-600' : 'text-gray-300'}`} 
                  onClick={handleWishlistToggle}
                >
                  ♥
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-pink-50">
              <label className="text-base font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center justify-center w-8 h-8 text-lg text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1 text-lg font-medium bg-white border rounded-md">{quantity}</span>
                <button
                  className="flex items-center justify-center w-8 h-8 text-lg text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700"
                  onClick={() =>
                    setQuantity((q) =>
                      product.stock_quantity ? Math.min(product.stock_quantity, q + 1) : q + 1
                    )
                  }
                  disabled={product.stock_quantity && quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="p-4 rounded-lg bg-pink-50">
              <label className="block mb-2 font-medium text-gray-700">Rate this product:</label>
              <div className="flex gap-1 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-3xl transition-transform hover:scale-125 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                className="flex-1 px-6 py-3 text-white transition-all rounded-lg shadow bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:shadow-lg"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                className="flex-1 px-6 py-3 text-white transition-all rounded-lg shadow bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 hover:shadow-lg"
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0}
              >
                Buy Now
              </button>
            </div>

            <div className="mt-2">
              <button
                className="w-full px-6 py-3 text-pink-600 transition-colors bg-white border border-pink-600 rounded-lg shadow hover:bg-pink-50"
                onClick={handleWishlistToggle}
              >
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            <p className="mt-4 text-sm italic text-center text-pink-600">Enjoy anywhere & anytime</p>
          </div>
        </div>
      </div>

      {/* Fullscreen Image View */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Zoomed"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export default ProductDetails;