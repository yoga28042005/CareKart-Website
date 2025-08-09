import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaBars, FaTimes, FaHome, FaUser, FaShoppingCart, FaHeart,
  FaInfoCircle, FaPhoneAlt
} from 'react-icons/fa';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [base64Image, setBase64Image] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const API_URL = process.env.REACT_APP_API_URL || 'http://56.228.36.23';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/product/${id}`);
        setProduct(res.data);
        if (res.data?.image_url) {
          try {
            const imgRes = await axios.get(`${API_URL}/api/image-base64/${res.data.image_url}`);
            setBase64Image(imgRes.data.image);
          } catch {
            setBase64Image('https://via.placeholder.com/300');
          }
        } else {
          setBase64Image('https://via.placeholder.com/300');
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, API_URL]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`🛒 Added ${quantity} ${product.name}(s) to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    toast.info('🚀 Redirecting to checkout...');
    setTimeout(() => {
      navigate('/checkout', {
        state: { items: [{ ...product, quantity }], totalPrice: product.price * quantity },
      });
    }, 800);
  };

  const handleStarClick = (star) => setRating(prev => (prev === star ? 0 : star));

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.info('💔 Removed from Wishlist');
    } else {
      addToWishlist(product);
      toast.success('❤️ Added to Wishlist');
    }
  };

  const isInWishlist = wishlist.some(item => item.id === product?.id);
  const price = Number(product?.price || 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-xl font-semibold text-pink-600">Loading...</div>
    </div>
  );
  if (!product) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-xl font-semibold text-red-500">Product not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <ToastContainer position="top-center" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 text-white shadow-md bg-gradient-to-r from-pink-600 to-purple-600 h-14">
        <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>CareKart</div>
        <div className="hidden space-x-6 text-sm font-medium md:flex">
          <span onClick={() => navigate('/')} className="flex items-center cursor-pointer hover:text-pink-200"><FaHome className="mr-1" /> Home</span>
          <span onClick={() => navigate('/order-history')} className="flex items-center cursor-pointer hover:text-pink-200"><FaUser className="mr-1" /> Profile</span>
          <span onClick={() => navigate('/cart')} className="flex items-center cursor-pointer hover:text-pink-200"><FaShoppingCart className="mr-1" /> Cart</span>
          <span onClick={() => navigate('/wishlist')} className="flex items-center cursor-pointer hover:text-pink-200"><FaHeart className="mr-1" /> Wishlist</span>
          <span onClick={() => navigate('/about')} className="flex items-center cursor-pointer hover:text-pink-200"><FaInfoCircle className="mr-1" /> About</span>
          <span onClick={() => navigate('/contact')} className="flex items-center cursor-pointer hover:text-pink-200"><FaPhoneAlt className="mr-1" /> Contact</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden"><FaBars size={22} /></button>
      </nav>

      {/* Sidebar for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative z-50 flex flex-col w-64 h-full p-6 space-y-4 text-white bg-gradient-to-b from-pink-600 to-purple-600">
            <button onClick={() => setIsSidebarOpen(false)} className="self-end mb-4"><FaTimes size={22} /></button>
            <span onClick={() => { navigate('/'); setIsSidebarOpen(false); }} className="flex items-center cursor-pointer hover:text-pink-200"><FaHome className="mr-2" /> Home</span>
            <span onClick={() => { navigate('/order-history'); setIsSidebarOpen(false); }} className="flex items-center cursor-pointer hover:text-pink-200"><FaUser className="mr-2" /> Profile</span>
            <span onClick={() => { navigate('/cart'); setIsSidebarOpen(false); }} className="flex items-center cursor-pointer hover:text-pink-200"><FaShoppingCart className="mr-2" /> Cart</span>
            <span onClick={() => { navigate('/wishlist'); setIsSidebarOpen(false); }} className="flex items-center cursor-pointer hover:text-pink-200"><FaHeart className="mr-2" /> Wishlist</span>
            <span onClick={() => { navigate('/about'); setIsSidebarOpen(false); }} className="flex items-center cursor-pointer hover:text-pink-200"><FaInfoCircle className="mr-2" /> About</span>
            <span onClick={() => { navigate('/contact'); setIsSidebarOpen(false); }} className="flex items-center cursor-pointer hover:text-pink-200"><FaPhoneAlt className="mr-2" /> Contact</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container px-4 py-6 mx-auto mt-20">
        <h1 className="mb-10 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">{product.name}</h1>
        <div className="flex flex-col gap-10 md:flex-row">
          {/* Image */}
          <div className="flex items-center justify-center w-full p-8 bg-white rounded-lg shadow-lg md:w-1/2 hover:shadow-xl">
            <img src={base64Image} alt={product.name} onClick={() => setFullscreenImage(base64Image)} className="object-contain cursor-pointer h-80 hover:scale-105" />
          </div>
          {/* Info */}
          <div className="flex flex-col w-full gap-6 p-6 bg-white rounded-lg shadow-lg md:w-1/2 hover:shadow-xl">
            <p className="text-lg text-gray-700">{product.description}</p>
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">₹{price.toFixed(2)}</span>
            <span className={`text-lg font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Add to wishlist:</span>
              <span onClick={handleWishlistToggle} className={`text-3xl cursor-pointer ${isInWishlist ? 'text-pink-600' : 'text-gray-300'}`}>♥</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-pink-50">
              <label className="text-base font-medium text-gray-700">Quantity:</label>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="w-8 h-8 text-lg text-white bg-pink-600 rounded-full hover:bg-pink-700">-</button>
              <span className="px-4 py-1 bg-white border rounded-md">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))} disabled={quantity >= product.stock_quantity} className="w-8 h-8 text-lg text-white bg-pink-600 rounded-full hover:bg-pink-700">+</button>
            </div>

            {/* Rating */}
            <div className="p-4 rounded-lg bg-pink-50">
              <label className="block mb-2 font-medium text-gray-700">Rate this product:</label>
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map(star => (
                <span key={star} onClick={() => handleStarClick(star)} className={`text-3xl cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}</div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-4">
              <button onClick={handleAddToCart} className="flex-1 px-6 py-3 text-white rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">Add to Cart</button>
              <button onClick={handleBuyNow} disabled={product.stock_quantity === 0} className="flex-1 px-6 py-3 text-white rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">Buy Now</button>
            </div>

            {/* Enjoy text */}
            <p className="mt-4 text-sm italic text-center text-pink-600">Enjoy anywhere & anytime</p>
          </div>
        </div>
      </div>

      {/* Fullscreen image */}
      {fullscreenImage && (
        <div onClick={() => setFullscreenImage(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <img src={fullscreenImage} alt="Zoom" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
