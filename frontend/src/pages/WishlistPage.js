import React from "react";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaShoppingCart, FaCreditCard, FaArrowLeft, FaHeart } from "react-icons/fa";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    if (!isInCart(product.id)) {
      addToCart(product);
    }
    removeFromWishlist(product.id);
    navigate("/cart");
  };

  const handleCheckoutSingle = (item) => {
    const price = Number(item.price) || 0;
    navigate("/checkout", {
      state: {
        items: [item],
        totalPrice: (price * (item.quantity || 1)).toFixed(2),
      },
    });
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-pink-700 transition-colors bg-pink-100 rounded-lg hover:bg-pink-200"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-green-500">
            Your Wishlist
          </h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white shadow-sm rounded-xl">
            <FaHeart className="mb-4 text-5xl text-pink-200" />
            <h2 className="text-2xl font-medium text-gray-600">Your wishlist is empty</h2>
            <p className="mb-6 text-gray-500">Start saving your favorite items</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-pink-400 to-green-400 hover:from-pink-500 hover:to-green-500"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist Items */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((item) => (
                <div key={item.id} className="overflow-hidden transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg">
                  <div className="relative">
                    <img
                      src={item.image_url ? `http://localhost:3000/images/${item.image_url}` : "https://via.placeholder.com/300"}
                      alt={item.name}
                      className="object-cover w-full h-48"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute p-2 text-pink-600 transition-colors bg-white rounded-full shadow top-2 right-2 hover:bg-pink-100"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
                    <p className="mb-3 text-xl font-bold text-green-600">₹{Number(item.price || 0).toFixed(2)}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-green-700 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                      >
                        <FaShoppingCart /> Move to Cart
                      </button>
                      <button
                        onClick={() => handleCheckoutSingle(item)}
                        className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
                      >
                        <FaCreditCard /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Wishlist Button */}
            <div className="mt-8 text-center">
              <button
                onClick={clearWishlist}
                className="flex items-center justify-center gap-2 px-6 py-3 mx-auto text-pink-700 transition-colors bg-pink-100 rounded-lg hover:bg-pink-200"
              >
                <FaTrash /> Clear Wishlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;