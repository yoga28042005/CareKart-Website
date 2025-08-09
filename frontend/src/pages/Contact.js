import React from 'react';
import { FaArrowLeft, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Contact() {
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
        <h1 className="text-3xl font-bold text-pink-800 md:text-4xl">Contact Us</h1>
        <p className="max-w-2xl mx-auto mt-2 text-pink-600">We're here to help you</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl px-4 py-8 mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Info */}
          <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-pink-800">Our Information</h2>
            <div className="space-y-4">
              {[
                { icon: <FaMapMarkerAlt className="text-pink-600" />, 
                  title: "Address", 
                  text: "123 Health Street, Chennai - 600001" },
                { icon: <FaPhoneAlt className="text-pink-600" />, 
                  title: "Phone", 
                  text: "+91 7339088173" },
                { icon: <FaEnvelope className="text-pink-600" />, 
                  title: "Email", 
                  text: "kathiryoga137@gmail.com" },
                { icon: <FaClock className="text-pink-600" />, 
                  title: "Hours", 
                  text: "Mon-Sun: 8AM - 10PM" }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-1">{item.icon}</div>
                  <div>
                    <h3 className="font-medium text-pink-800">{item.title}</h3>
                    <p className="text-pink-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Simple Map Placeholder */}
            <div className="p-4 mt-6 text-center text-pink-700 bg-pink-100 rounded-lg">
              [Map Location Placeholder]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;