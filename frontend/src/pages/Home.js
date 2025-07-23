import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaShoppingCart, FaHeart, FaUser, FaHome, FaInfoCircle, FaPhoneAlt, FaSignInAlt, FaSearch } from "react-icons/fa";

function Home() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => {
        setCategories(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat &&
      typeof cat === "string" &&
      cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pastelColors = [
    "bg-pink-100 text-pink-800 hover:bg-pink-200",
    "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "bg-green-100 text-green-800 hover:bg-green-200",
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    "bg-teal-100 text-teal-800 hover:bg-teal-200",
    "bg-orange-100 text-orange-800 hover:bg-orange-200",
  ];

  return (
    <div className="w-full min-h-screen bg-pink-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full h-16 px-6 py-3 text-white bg-pink-600 shadow-sm">
        <div className="flex items-center text-xl font-bold text-white">
          <img
            src="/images/carekart-logo.jpeg"
            alt="CareKart Logo"
            className="object-cover w-12 h-12 mr-2 rounded-full"
          />
          <span className="hidden sm:inline">CareKart</span>
        </div>

        <div className="flex items-center space-x-4 text-sm font-medium text-white">
          <a href="/" className="flex items-center px-3 py-1 transition-all rounded hover:bg-pink-700">
            <FaHome className="mr-1" /> Home
          </a>
          <a href="/cart" className="flex items-center px-3 py-1 transition-all rounded hover:bg-pink-700">
            <FaShoppingCart className="mr-1" /> Cart
          </a>
          <a href="/order-history" className="flex items-center px-3 py-1 transition-all rounded hover:bg-pink-700">
            <FaUser className="mr-1" /> My Profile
          </a>
          <a href="/wishlist" className="flex items-center px-3 py-1 transition-all rounded hover:bg-pink-700">
            <FaHeart className="mr-1" /> Wishlist
          </a>
          <a href="/about" className="items-center hidden px-3 py-1 transition-all rounded md:flex hover:bg-pink-700">
            <FaInfoCircle className="mr-1" /> About
          </a>
          <a href="/contact" className="items-center hidden px-3 py-1 transition-all rounded md:flex hover:bg-pink-700">
            <FaPhoneAlt className="mr-1" /> Contact
          </a>
          <a href="/login" className="flex items-center px-3 py-1 text-pink-600 transition-all bg-white rounded hover:bg-gray-100">
            <FaSignInAlt className="mr-1" /> Login
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-4 pb-12 pt-28 md:px-8 lg:px-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            Welcome to{" "}
            <span
              className="text-pink-600 inline-block animate-[zoomInOut_2s_ease-in-out_infinite]"
              style={{
                animation: "zoomInOut 2s ease-in-out infinite",
              }}
            >
              CareKart
            </span>
          </h1>
          <style jsx>{`
            @keyframes zoomInOut {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
          <p className="max-w-2xl text-lg text-gray-600">
            Your trusted healthcare partner. Quality medical products delivered with care.
          </p>
        </div>

        {/* Search */}
        <div className="relative flex justify-center mb-12">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full px-5 py-3 pl-12 pr-5 text-lg bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-300 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute text-xl text-gray-400 transform -translate-y-1/2 left-5 top-1/2" />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">
            Browse Categories
          </h2>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-pink-300 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredCategories.map((cat, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/products/${encodeURIComponent(cat)}`)}
                  className={`px-6 py-4 text-lg font-medium rounded-lg shadow-sm transition-all hover:shadow-md ${
                    pastelColors[index % pastelColors.length]
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm">
              <p className="text-gray-600">No categories found matching your search.</p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 mt-4 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Health Tip */}
        <div className="p-6 mb-12 text-gray-800 bg-white border border-gray-100 rounded-lg shadow-sm">
          <h3 className="mb-2 text-xl font-semibold">Health Tip</h3>
          <p className="mb-4">Regular hand washing is one of the best ways to prevent the spread of infections.</p>
          <button className="px-4 py-2 text-sm font-medium text-pink-600 bg-white border border-pink-200 rounded-lg hover:bg-pink-50">
            View More Tips
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 text-white bg-pink-600">
        <div className="container px-4 mx-auto md:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-wrap justify-center gap-8 mb-6">
              <a href="/" className="hover:text-pink-200">Home</a>
              <a href="/about" className="hover:text-pink-200">About Us</a>
              <a href="/contact" className="hover:text-pink-200">Contact</a>
            </div>
            <div className="text-sm text-center text-pink-200">
              © {new Date().getFullYear()} CareKart. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
