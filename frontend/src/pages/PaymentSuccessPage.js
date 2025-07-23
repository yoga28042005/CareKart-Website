import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaReceipt,
  FaUser,
  FaRupeeSign,
  FaListAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaHome,
  FaFileInvoiceDollar
} from "react-icons/fa";
import { motion } from "framer-motion";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderDetails } = location.state || {};

  const handleViewBilling = () => {
    navigate("/billing", { state: { orderDetails } });
  };

  const handleContinueShopping = () => {
    navigate("/home");
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Back Button */}
      <motion.button
        onClick={handleBackClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute flex items-center px-4 py-2 text-blue-600 transition-colors rounded-lg left-4 top-4 hover:bg-blue-100 sm:left-8 sm:top-8"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </motion.button>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl p-8 border shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl border-white/20"
      >
        {/* Success Header */}
        <div className="flex flex-col items-center mb-6">
          <FaCheckCircle className="w-16 h-16 mb-4 text-green-500" />
          <h1 className="mb-2 text-3xl font-bold text-center text-gray-800 md:text-4xl">
            Order Confirmed!
          </h1>
          <p className="text-lg text-center text-gray-600">
            Your payment was successful and your order has been placed.
          </p>
          <div className="w-24 h-1 mt-4 rounded-full bg-gradient-to-r from-blue-400 to-pink-400"></div>
        </div>

        {/* Order Summary Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-6 mb-8 space-y-4 bg-white shadow-lg rounded-xl"
        >
          <div className="flex items-center p-3 mb-4 rounded-lg bg-blue-50">
            <FaUser className="w-5 h-5 mr-3 text-blue-500" />
            <div>
              <h3 className="font-medium text-gray-700">Customer Details</h3>
              <p className="text-gray-600">{orderDetails?.userDetails?.name}</p>
            </div>
          </div>

          {orderDetails?.paymentMethod === "upi" &&
            orderDetails?.transactionId && (
              <div className="flex items-center p-3 mb-4 rounded-lg bg-purple-50">
                <FaReceipt className="w-5 h-5 mr-3 text-purple-500" />
                <div>
                  <h3 className="font-medium text-gray-700">Transaction ID</h3>
                  <p className="text-sm text-gray-600">{orderDetails.transactionId}</p>
                </div>
              </div>
            )}

          <div className="p-3 mb-4 rounded-lg bg-green-50">
            <div className="flex items-center mb-2">
              <FaListAlt className="w-5 h-5 mr-3 text-green-500" />
              <h3 className="font-medium text-gray-700">Order Items</h3>
            </div>
            <ul className="pl-2 space-y-2">
              {orderDetails?.items?.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span className="text-gray-700">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{(item.product.price || 0) * (item.quantity || 1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between p-3 mt-6 rounded-lg bg-yellow-50">
            <div className="flex items-center">
              <FaRupeeSign className="w-5 h-5 mr-3 text-yellow-500" />
              <h3 className="font-medium text-gray-700">Total Amount</h3>
            </div>
            <span className="text-xl font-bold text-gray-800">₹{orderDetails?.totalPrice}</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 mt-6 sm:flex-row">
          <motion.button
            onClick={handleViewBilling}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
          >
            <FaFileInvoiceDollar className="mr-2" />
            View Invoice
          </motion.button>
          
          <motion.button
            onClick={handleContinueShopping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 font-medium text-white transition-colors rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <FaHome className="mr-2" />
            Continue Shopping
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default PaymentSuccessPage;