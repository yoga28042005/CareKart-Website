import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      alert("Please login to view order history.");
      navigate("/login");
      return;
    }

    axios.get(`http://56.228.36.23/api/user-profile/${userId}`)
      .then(res => {
        setProfile(res.data);
        if (res.data.profileImage) {
          setImagePreview(`http://56.228.36.23/uploads/${res.data.profileImage}`);
        }
      })
      .catch(err => console.error("Profile fetch error:", err));

    axios.get(`http://56.228.36.23/api/order-history/${userId}`)
      .then(res => {
        if (res.data.success) {
          setOrders(res.data.orders);
          if (res.data.orders.length > 0) {
            const { customer_name, customer_address, customer_city, customer_phone } = res.data.orders[0];
            setShippingInfo({ customer_name, customer_address, customer_city, customer_phone });
          }
        }
      })
      .catch(err => console.error("Order fetch error:", err));
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    alert("Logged out successfully.");
    navigate("/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('customer_name', shippingInfo.customer_name);
      formData.append('customer_address', shippingInfo.customer_address);
      formData.append('customer_city', shippingInfo.customer_city);
      formData.append('customer_phone', shippingInfo.customer_phone);
      formData.append('email', profile.email);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const res = await axios.put(`http://56.228.36.23/api/update-user/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        alert("✅ Profile updated successfully");
        setIsEditing(false);
        if (res.data.profileImage) {
          setImagePreview(`http://56.228.36.23/uploads/${res.data.profileImage}`);
        }
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert("Something went wrong: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-rose-100 via-lime-100 to-sky-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <h2 className="text-4xl font-extrabold text-center text-pink-600">📦 Your Order History</h2>
          <div className="w-24"></div>
        </div>

        {/* Profile Section */}
        {profile && (
          <div className="p-6 mb-10 bg-white border border-pink-200 shadow-xl rounded-xl">
            <h3 className="mb-4 text-2xl font-semibold text-violet-700">👤 My Profile</h3>

            <div className="flex flex-col gap-6 md:flex-row">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center">
                {!isEditing ? (
                  <div className="w-32 h-32 mb-4 overflow-hidden rounded-full shadow-md">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4 overflow-hidden rounded-full shadow-md">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile Preview" className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label className="px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                      📷 Change Photo
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Profile Info Section */}
              <div className="flex-1">
                {!isEditing ? (
                  <>
                    <div className="grid gap-2 text-gray-700">
                      <p><strong>👨‍💼 Username:</strong> {profile.username}</p>
                      <p><strong>📧 Email:</strong> {profile.email}</p>
                      {shippingInfo ? (
                        <>
                          <p><strong>🧾 Name:</strong> {shippingInfo.customer_name}</p>
                          <p><strong>🏡 Address:</strong> {shippingInfo.customer_address}, {shippingInfo.customer_city}</p>
                          <p><strong>📱 Phone:</strong> {shippingInfo.customer_phone}</p>
                        </>
                      ) : (
                        <p className="text-sm italic text-gray-400">No shipping info yet. Place your first order!</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-6">
                      {shippingInfo && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-5 py-2 font-medium text-yellow-900 transition bg-yellow-200 rounded-md shadow hover:bg-yellow-300"
                        >
                          ✏️ Edit Profile
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="px-5 py-2 font-medium text-red-900 transition bg-red-200 rounded-md shadow hover:bg-red-300"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-4 text-gray-700 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1 font-medium">Full Name</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={shippingInfo.customer_name}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, customer_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Address</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={shippingInfo.customer_address}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, customer_address: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">City</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={shippingInfo.customer_city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, customer_city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Phone</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={shippingInfo.customer_phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, customer_phone: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                          type="email"
                          className="w-full p-2 border rounded"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={handleSaveProfile}
                        className="px-5 py-2 font-medium text-green-900 transition bg-green-200 rounded-md shadow hover:bg-green-300"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2 font-medium text-gray-800 transition bg-gray-200 rounded-md shadow hover:bg-gray-300"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">🫙 No orders yet.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order, index) => (
              <div
                key={index}
                className="p-6 transition-all bg-white border shadow rounded-xl border-sky-200 hover:shadow-lg"
              >
                <h3 className="mb-2 text-lg font-bold text-sky-600">🛒 Order ID: {order.order_id}</h3>
                <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                  <p><strong>📦 Tracking:</strong> {order.tracking_id}</p>
                  <p><strong>💳 Payment:</strong> {order.payment_method}</p>
                  <p><strong>💰 Amount:</strong> ₹{order.total_amount}</p>
                  <p><strong>📅 Placed On:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  <p><strong>📍 Status:</strong> <span className="font-medium text-emerald-600">{order.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;