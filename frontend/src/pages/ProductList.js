import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (category) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/products/${category}`)
        .then((res) => {
          setProducts(res.data);
          setFilteredProducts(res.data); // Initialize filtered products with all products
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          setLoading(false);
        });
    }
  }, [category]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const viewDetails = (id) => {
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-xl font-semibold text-pink-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 text-white shadow-lg bg-gradient-to-r from-pink-600 to-purple-600 h-14">
        <div
          className="text-2xl font-bold cursor-pointer font-logo hover:text-pink-200"
          onClick={() => navigate("/")}
        >
          CareKart
        </div>
        <div className="flex space-x-6 text-sm font-medium">
          <span
            onClick={() => navigate("/")}
            className="cursor-pointer hover:text-pink-200"
          >
            Home
          </span>
          <span
            onClick={() => navigate("/home")}
            className="cursor-pointer hover:text-pink-200"
          >
            Categories
          </span>
          <span
            onClick={() => navigate("/cart")}
            className="cursor-pointer hover:text-pink-200"
          >
            Cart
          </span>
          <span
            onClick={() => navigate("/wishlist")}
            className="cursor-pointer hover:text-pink-200"
          >
            Wishlist
          </span>
          <span
            onClick={() => navigate("/about")}
            className="cursor-pointer hover:text-pink-200"
          >
            About
          </span>
          <span
            onClick={() => navigate("/contact")}
            className="cursor-pointer hover:text-pink-200"
          >
            Contact Us
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="container px-4 pt-24 mx-auto">
        <h2 className="mb-6 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          {decodeURIComponent(category)} Products
        </h2>

        {/* Search Bar */}
        <div className="w-full max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden transition-all duration-300 transform bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2"
              >
                <div className="relative h-56 bg-gray-100 group">
                  <img
                    src={`http://localhost:3000/images/${product.image_url}`}
                    alt={product.name}
                    className="object-contain w-full h-full p-4 transition-opacity duration-300 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black opacity-0 bg-opacity-30 group-hover:opacity-100">
                    <button 
                      onClick={() => viewDetails(product.id)}
                      className="px-6 py-2 font-medium text-white bg-pink-600 rounded-full hover:bg-pink-700"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="h-12 mb-3 overflow-hidden text-sm text-gray-600">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                      ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <button 
                      onClick={() => viewDetails(product.id)}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 text-5xl">😕</div>
            <p className="text-xl font-medium text-gray-600">
              {searchTerm.trim() === "" 
                ? "No products found in this category." 
                : "No products match your search."}
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 mt-4 text-white rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Browse Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;