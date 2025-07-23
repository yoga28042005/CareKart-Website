import React from 'react';
import { FaArrowLeft, FaClinicMedical, FaShippingFast, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute p-2 text-pink-700 top-4 left-4 hover:text-pink-900"
      >
        <FaArrowLeft className="text-xl" />
      </button>

      {/* Header */}
      <div className="py-16 text-center bg-pink-100">
        <h1 className="text-3xl font-bold text-pink-800 md:text-4xl">About CareKart</h1>
        <p className="max-w-2xl mx-auto mt-2 text-pink-600">Your trusted healthcare partner</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl px-4 py-8 mx-auto">
        {/* Features */}
        <div className="grid gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <FaClinicMedical className="text-3xl text-pink-600" />, 
              title: "Quality Products", 
              desc: "Sourced from trusted manufacturers" },
            { icon: <FaShippingFast className="text-3xl text-pink-600" />, 
              title: "Fast Delivery", 
              desc: "Reliable shipping to your doorstep" },
            { icon: <FaShieldAlt className="text-3xl text-pink-600" />, 
              title: "Safety First", 
              desc: "Verified and safe medical supplies" },
            { icon: <FaUsers className="text-3xl text-pink-600" />, 
              title: "Customer Care", 
              desc: "24/7 support for your needs" }
          ].map((item, index) => (
            <div key={index} className="p-5 text-center bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-pink-800">{item.title}</h3>
              <p className="text-pink-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Simple Mission Section */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-center text-pink-800">Our Mission</h2>
          <p className="text-pink-700">
            We're dedicated to providing high-quality medical supplies with convenience and care. 
            Our goal is to make healthcare accessible to everyone with reliable service and 
            authentic products you can trust.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;