import React from "react";
import { useCart } from "../contexts/CartContext";
import { FaTrash, FaPlus, FaMinus, FaCreditCard, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const handleIncrease = (id, currentQuantity) => {
    updateQuantity(id, currentQuantity + 1);
  };

  const handleDecrease = (id, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    }
  };

  const handleCheckoutAll = () => {
    navigate("/checkout", {
      state: {
        items: cartItems,
        totalPrice: getCartTotal(),
      },
    });
  };

  const handleCheckoutSingle = (item) => {
    const price = Number(item.price) || 0;
    navigate("/checkout", {
      state: {
        items: [item],
        totalPrice: (price * item.quantity).toFixed(2),
      },
    });
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-pink-700 transition-colors bg-pink-100 rounded-lg hover:bg-pink-200"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-green-600">
            Your Shopping Cart
          </h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white shadow-sm rounded-xl">
            <FaShoppingCart className="mb-4 text-5xl text-gray-300" />
            <h2 className="text-2xl font-medium text-gray-600">Your cart is empty</h2>
            <p className="mb-6 text-gray-500">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-pink-500 to-green-500 hover:from-pink-600 hover:to-green-600"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items Table */}
            <div className="p-6 overflow-hidden bg-white shadow-lg rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-700 bg-gradient-to-r from-pink-100 to-green-100">
                    <th className="p-4 font-semibold rounded-tl-lg">Product</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Quantity</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const price = Number(item.price) || 0;
                    const total = (price * item.quantity).toFixed(2);

                    return (
                      <tr key={item.id} className="transition-colors border-b border-gray-100 hover:bg-gray-50">
                        <td className="flex items-center gap-4 p-4">
                          <img
                            src={item.image_url ? `http://localhost:3000/images/${item.image_url}` : "https://via.placeholder.com/100"}
                            alt={item.name}
                            className="object-cover w-16 h-16 rounded-lg shadow-sm"
                          />
                          <span className="font-medium text-gray-700">{item.name}</span>
                        </td>
                        <td className="p-4 font-semibold text-green-600">₹{price.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDecrease(item.id, item.quantity)}
                              className="flex items-center justify-center w-8 h-8 text-pink-600 transition-colors bg-pink-100 rounded-full hover:bg-pink-200"
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="w-8 text-center text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => handleIncrease(item.id, item.quantity)}
                              className="flex items-center justify-center w-8 h-8 text-pink-600 transition-colors bg-pink-100 rounded-full hover:bg-pink-200"
                            >
                              <FaPlus className="text-xs" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-green-700">₹{total}</td>
                        <td className="p-4 space-y-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                          >
                            <FaTrash className="text-sm" /> Remove
                          </button>
                          <button
                            onClick={() => handleCheckoutSingle(item)}
                            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm text-white transition-all rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          >
                            <FaCreditCard className="text-sm" /> Checkout
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cart Summary */}
            <div className="p-6 mt-8 bg-white shadow-lg rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">
                    Total Items: <span className="text-pink-600">{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                  </h2>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Grand Total: <span className="text-green-600">₹{getCartTotal().toFixed(2)}</span>
                  </h2>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 px-6 py-3 text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                  >
                    <FaTrash /> Clear Cart
                  </button>
                  <button
                    onClick={handleCheckoutAll}
                    className="flex items-center gap-2 px-6 py-3 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-pink-500 to-green-500 hover:from-pink-600 hover:to-green-600"
                  >
                    <FaCreditCard /> Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;