import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Please enter username";
    if (!form.email.trim()) {
      newErrors.email = "Please enter email";
    } else if (!/^[\w.-]+@[\w-]+\.[a-z]{2,4}$/i.test(form.email)) {
      newErrors.email = "Please enter a valid email (e.g., user@gmail.com)";
    }
    if (!form.password.trim()) newErrors.password = "Please enter password";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error when typing
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post('http://56.228.36.23/signup', form);
      alert('Signup successful');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-r from-pink-200 to-purple-200">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-3xl font-bold text-center text-purple-700">Signup</h2>
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white transition bg-purple-600 rounded hover:bg-purple-700"
          >
            Signup
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
