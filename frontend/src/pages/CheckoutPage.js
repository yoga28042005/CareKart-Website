import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FaRupeeSign, FaQrcode, FaCreditCard, FaMoneyBillWave, 
  FaMobileAlt, FaPlus, FaHospital, FaShieldAlt, 
  FaTruck, FaBoxOpen, FaCheckCircle, FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [], totalPrice = 0 } = location.state || {};
  
  // State management
  const [addresses, setAddresses] = useState([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [userDetails, setUserDetails] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    paymentMethod: 'creditCard',
    selectedAddressId: null
  });

  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    isDefault: false
  });

  const [upiPayment, setUpiPayment] = useState({
    show: false,
    link: '',
    showQR: false,
    qrData: '',
    transactionId: ''
  });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSelect = useCallback((address) => {
    setUserDetails(prev => ({
      ...prev,
      name: address.name,
      address: address.address,
      city: address.city,
      phone: address.phone,
      email: address.email || prev.email,
      selectedAddressId: address.id
    }));
  }, []);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  const handleSaveNewAddress = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      const isFirstAddress = addresses.length === 0;
      
      const response = await axios.post('http://localhost:5000/api/add-address', {
        userId,
        ...newAddress,
        isDefault: isFirstAddress
      });

      const updatedAddresses = [...addresses, response.data.address];
      setAddresses(updatedAddresses);
      handleAddressSelect(response.data.address);
      setShowNewAddressForm(false);
      
      setNewAddress({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        isDefault: false
      });

      if (isFirstAddress) {
        setIsFirstTimeUser(false);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpiPayment = async () => {
    try {
      setIsLoading(true);
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const response = await axios.post(
        'http://localhost:5000/api/generate-upi-link',
        {
          amount: totalPrice,
          orderId: `order_${Date.now()}`,
          transactionId
        }
      );

      setUpiPayment({
        show: true,   
        link: response.data.upiLink,
        qrData: response.data.qrData,
        showQR: false,
        transactionId
      });
    } catch (err) {
      console.error('UPI Error:', err);
      alert('Failed to generate UPI link. Please try another payment method.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsLoading(true);
      
      // Validate user details
      const requiredFields = ['name', 'address', 'city', 'phone', 'email'];
      const missingFields = requiredFields.filter(field => !userDetails[field]);

      if (missingFields.length > 0) {
        alert(`Please fill in: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Create order on backend
      const orderResponse = await axios.post('http://localhost:5000/api/create-order', {
        amount: totalPrice,
        receipt: `order_${Date.now()}`
      });

      if (!orderResponse.data.success) {
        throw new Error('Failed to create Razorpay order');
      }

      const options = {
        key: 'rzp_test_EH1UEwLILEPXCj',
        amount: orderResponse.data.order.amount,
        currency: orderResponse.data.order.currency,
        order_id: orderResponse.data.order.id,
        name: 'CareKart',
        description: 'Payment for your order',
        handler: async function(response) {
          try {
            // Place the order after successful payment
            await handlePlaceOrder(response.razorpay_payment_id);
          } catch (error) {
            console.error('Order placement error:', error);
            alert('Payment successful but order placement failed. Please contact support.');
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Razorpay error:', error);
      alert('Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async (transactionId = null) => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (isFirstTimeUser) {
        await axios.post('http://localhost:5000/api/add-address', {
          userId,
          name: userDetails.name,
          address: userDetails.address,
          city: userDetails.city,
          phone: userDetails.phone,
          email: userDetails.email,
          isDefault: true
        });
        setIsFirstTimeUser(false);
      }

      const payload = {
        userId,
        items: items.map(item => ({
          product: {
            id: (item.product || item).id,
            name: (item.product || item).name,
            price: (item.product || item).price
          },
          quantity: item.quantity || 1
        })),
        totalPrice,
        userDetails: {
          name: userDetails.name,
          address: userDetails.address,
          city: userDetails.city,
          phone: userDetails.phone,
          email: userDetails.email
        },
        paymentMethod: userDetails.paymentMethod,
        transactionId: transactionId || 
                      (userDetails.paymentMethod === 'upi' ? upiPayment.transactionId : null)
      };

      const response = await axios.post(
        'http://localhost:5000/api/place-order',
        payload
      );

      if (response.data.success) {
        // Update stock for each product
        for (const item of payload.items) {
          const productId = item.product?.id;
          const quantityPurchased = item.quantity || 1;

          if (productId && quantityPurchased > 0) {
            try {
              await axios.post('http://localhost:5000/api/update-stock', {
                productId,
                quantityPurchased,
              });
            } catch (err) {
              console.error(`Stock update failed for product ${productId}:`, err.message);
            }
          }
        }

        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/paymentsuccess', {
            state: {
              orderDetails: {
                ...response.data,
                items: payload.items,
                userDetails: payload.userDetails,
                paymentMethod: userDetails.paymentMethod,
                transactionId: payload.transactionId,
                totalPrice,
                date: new Date().toLocaleString(),
              },
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert(`Order failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const profileRes = await axios.get(`http://localhost:5000/api/user-profile/${userId}`);
          const userEmail = profileRes.data.email;
          
          const addressesRes = await axios.get(`http://localhost:5000/api/user-addresses/${userId}`);
          
          if (addressesRes.data.addresses.length === 0) {
            setIsFirstTimeUser(true);
            setUserDetails(prev => ({
              ...prev,
              email: userEmail || ''
            }));
          } else {
            setAddresses(addressesRes.data.addresses);
            handleAddressSelect(addressesRes.data.addresses[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [handleAddressSelect]);

  // Success animation
  if (orderSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 text-center"
        >
          <FaCheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
          <h2 className="mb-4 text-3xl font-bold text-gray-800">Order Placed Successfully!</h2>
          <p className="text-lg text-gray-600">Redirecting to order details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-50 to-teal-50 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={handleBackClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center mb-6 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </motion.button>

        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center mb-3 space-x-3">
            <FaHospital className="text-3xl text-blue-600 animate-pulse" />
            <h1 className="text-3xl font-bold text-transparent text-blue-800 bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              CareKart
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Checkout</h2>
          <div className="w-24 h-1 mx-auto mt-2 rounded-full bg-gradient-to-r from-blue-400 to-teal-400"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Summary Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 transition-shadow bg-white border border-blue-100 shadow-xl rounded-xl hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center text-xl font-semibold text-blue-800">
                <span className="p-2 mr-3 bg-blue-100 rounded-lg">
                  <FaBoxOpen className="w-6 h-6 text-blue-600" />
                </span>
                Order Summary
              </h2>
              <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            
            {items.length === 0 ? (
              <p className="italic text-gray-500">Your cart is empty</p>
            ) : (
              <div className="mb-4 space-y-3">
                {items.map((item, index) => {
                  const product = item.product || item;
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-3 border-b border-blue-50"
                    >
                      <div className="flex items-center">
                        <div className="p-2 mr-3 bg-blue-100 rounded-lg">
                          <FaHospital className="text-blue-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{product.name}</span>
                          <span className="ml-2 text-sm text-gray-500">(x{item.quantity || 1})</span>
                        </div>
                      </div>
                      <span className="font-medium text-blue-700">
                        ₹{(product.price || 0) * (item.quantity || 1)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-blue-100">
              <span className="font-semibold text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                ₹{totalPrice}
              </span>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <div className="flex items-center px-3 py-1 rounded-full bg-green-50">
                <FaShieldAlt className="mr-2 text-green-500" />
                <span className="text-sm text-green-700">Secure Checkout</span>
              </div>
              <div className="flex items-center px-3 py-1 rounded-full bg-purple-50">
                <FaTruck className="mr-2 text-purple-500" />
                <span className="text-sm text-purple-700">Fast Delivery</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Details Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.4 }}
            className="p-6 transition-shadow bg-white border border-blue-100 shadow-xl rounded-xl hover:shadow-2xl"
          >
            <h2 className="flex items-center mb-4 text-xl font-semibold text-blue-800">
              <span className="p-2 mr-3 bg-blue-100 rounded-lg">
                <FaTruck className="w-6 h-6 text-blue-600" />
              </span>
              Delivery Information
            </h2>

            {!isFirstTimeUser && (
              <div className="mb-6">
                <h3 className="mb-3 font-medium text-gray-700">Select Delivery Address</h3>
                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map(address => (
                      <motion.div 
                        key={address.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          userDetails.selectedAddressId === address.id 
                            ? 'border-teal-400 bg-teal-50 shadow-md' 
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <div className="flex items-start">
                          <div className={`mt-1 mr-3 h-5 w-5 rounded-full border flex items-center justify-center ${
                            userDetails.selectedAddressId === address.id 
                              ? 'bg-teal-500 border-teal-600' 
                              : 'bg-white border-gray-300'
                          }`}>
                            {userDetails.selectedAddressId === address.id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{address.name}</p>
                            <p className="text-gray-600">{address.address}</p>
                            <p className="text-gray-600">{address.city}</p>
                            <p className="text-gray-600">Phone: {address.phone}</p>
                            {address.email && <p className="text-gray-600">Email: {address.email}</p>}
                            {address.is_default && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-teal-100 text-teal-800 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-gray-500">No saved addresses found</p>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center w-full gap-2 p-3 mt-4 text-blue-600 transition-all border-2 border-blue-300 border-dashed rounded-lg hover:bg-blue-50"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                >
                  <FaPlus /> {showNewAddressForm ? 'Cancel' : 'Add New Address'}
                </motion.button>
              </div>
            )}

            <AnimatePresence>
              {(showNewAddressForm || isFirstTimeUser) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={isFirstTimeUser ? userDetails.name : newAddress.name}
                      onChange={isFirstTimeUser ? handleInputChange : handleNewAddressChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={isFirstTimeUser ? userDetails.address : newAddress.address}
                      onChange={isFirstTimeUser ? handleInputChange : handleNewAddressChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={isFirstTimeUser ? userDetails.city : newAddress.city}
                      onChange={isFirstTimeUser ? handleInputChange : handleNewAddressChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={isFirstTimeUser ? userDetails.phone : newAddress.phone}
                      onChange={isFirstTimeUser ? handleInputChange : handleNewAddressChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={isFirstTimeUser ? userDetails.email : newAddress.email}
                      onChange={isFirstTimeUser ? handleInputChange : handleNewAddressChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {!isFirstTimeUser && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleNewAddressChange}
                        id="defaultAddress"
                        className="w-5 h-5 mr-2 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <label htmlFor="defaultAddress" className="text-gray-700">
                        Set as default address
                      </label>
                    </div>
                  )}

                  {!isFirstTimeUser && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-colors bg-teal-600 rounded-lg shadow-md hover:bg-teal-700"
                      onClick={handleSaveNewAddress}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Address"
                      )}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Payment Method Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.6 }}
            className="p-6 transition-shadow bg-white border border-blue-100 shadow-xl rounded-xl lg:col-span-2 hover:shadow-2xl"
          >
            <h2 className="flex items-center mb-4 text-xl font-semibold text-blue-800">
              <span className="p-2 mr-3 bg-blue-100 rounded-lg">
                <FaCreditCard className="w-6 h-6 text-blue-600" />
              </span>
              Payment Method
            </h2>
            
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
              {/* Credit Card */}
              <motion.label 
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  userDetails.paymentMethod === "creditCard" ? 'border-teal-400 bg-teal-50 shadow-sm' : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="creditCard"
                  checked={userDetails.paymentMethod === "creditCard"}
                  onChange={handleInputChange}
                  className="w-5 h-5 mr-3 text-teal-600 focus:ring-teal-500"
                />
                <FaCreditCard className="mr-2 text-gray-700" />
                <span className="font-medium">Credit Card</span>
              </motion.label>

              {/* Debit Card */}
              <motion.label 
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  userDetails.paymentMethod === "debitCard" ? 'border-teal-400 bg-teal-50 shadow-sm' : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="debitCard"
                  checked={userDetails.paymentMethod === "debitCard"}
                  onChange={handleInputChange}
                  className="w-5 h-5 mr-3 text-teal-600 focus:ring-teal-500"
                />
                <FaCreditCard className="mr-2 text-gray-700" />
                <span className="font-medium">Debit Card</span>
              </motion.label>

              {/* UPI */}
              <motion.label 
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  userDetails.paymentMethod === "upi" ? 'border-teal-400 bg-teal-50 shadow-sm' : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={userDetails.paymentMethod === "upi"}
                  onChange={handleInputChange}
                  className="w-5 h-5 mr-3 text-teal-600 focus:ring-teal-500"
                />
                <FaMobileAlt className="mr-2 text-gray-700" />
                <span className="font-medium">UPI Payment</span>
              </motion.label>

              {/* Razorpay */}
              <motion.label 
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  userDetails.paymentMethod === "razorpay" ? 'border-teal-400 bg-teal-50 shadow-sm' : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={userDetails.paymentMethod === "razorpay"}
                  onChange={handleInputChange}
                  className="w-5 h-5 mr-3 text-teal-600 focus:ring-teal-500"
                />
                <FaCreditCard className="mr-2 text-gray-700" />
                <span className="font-medium">Razorpay</span>
              </motion.label>

              {/* Cash on Delivery */}
              <motion.label 
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  userDetails.paymentMethod === "cashOnDelivery" ? 'border-teal-400 bg-teal-50 shadow-sm' : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cashOnDelivery"
                  checked={userDetails.paymentMethod === "cashOnDelivery"}
                  onChange={handleInputChange}
                  className="w-5 h-5 mr-3 text-teal-600 focus:ring-teal-500"
                />
                <FaMoneyBillWave className="mr-2 text-gray-700" />
                <span className="font-medium">Cash on Delivery</span>
              </motion.label>
            </div>

            {/* UPI Payment Section */}
            {userDetails.paymentMethod === "upi" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpiPayment}
                  className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 md:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaRupeeSign /> Generate UPI Payment Link
                    </>
                  )}
                </motion.button>

                {upiPayment.show && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 space-y-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUpiPayment(p => ({ ...p, showQR: !p.showQR }))}
                      className="flex items-center justify-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
                    >
                      <FaQrcode /> {upiPayment.showQR ? "Hide QR Code" : "Show QR Code"}
                    </motion.button>

                    {upiPayment.showQR && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center p-6 border-2 border-teal-200 border-dashed bg-teal-50 rounded-xl"
                      >
                        <QRCodeSVG 
                          value={upiPayment.qrData} 
                          size={180} 
                          level="H" 
                          className="mb-4"
                        />
                        <p className="font-medium text-gray-700">Scan to Pay</p>
                        <p className="mt-1 text-sm text-gray-500">Amount: ₹{totalPrice}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Place Order Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center mt-8"
        >
          <motion.button
            whileHover={userDetails.paymentMethod === "upi" && !upiPayment.show ? {} : { scale: 1.05 }}
            whileTap={userDetails.paymentMethod === "upi" && !upiPayment.show ? {} : { scale: 0.95 }}
            onClick={() => {
              if (userDetails.paymentMethod === "razorpay") {
                handleRazorpayPayment();
              } else if (userDetails.paymentMethod === "upi" && upiPayment.show) {
                handlePlaceOrder();
              } else if (userDetails.paymentMethod !== "upi") {
                handlePlaceOrder();
              }
            }}
            disabled={
              (userDetails.paymentMethod === "upi" && !upiPayment.show) ||
              isLoading
            }
            className={`py-3 px-8 text-lg font-medium rounded-lg transition-all shadow-xl ${
              (userDetails.paymentMethod === "upi" && !upiPayment.show) || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : userDetails.paymentMethod === "upi" ? (
              upiPayment.show ? "Complete UPI Payment" : "Generate UPI Payment Link"
            ) : userDetails.paymentMethod === "razorpay" ? (
              "Pay with Razorpay"
            ) : (
              "Place Order"
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;