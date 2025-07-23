import React, { useState } from 'react';
import { FaArrowLeft, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Using Formspree service (you need to sign up at formspree.io)
      const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {submitStatus === 'success' ? (
          <div className="p-6 mb-6 text-center bg-white rounded-lg shadow-sm">
            <div className="inline-block p-3 mb-4 text-green-500 bg-green-100 rounded-full">
              <FaPaperPlane className="text-2xl" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-green-600">Message Sent!</h2>
            <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
            <button
              onClick={() => setSubmitStatus(null)}
              className="px-4 py-2 mt-4 text-white bg-pink-600 rounded hover:bg-pink-700"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-pink-800">Send us a message</h2>
              
              {submitStatus === 'error' && (
                <div className="p-3 mb-4 text-red-600 bg-red-100 rounded">
                  There was an error sending your message. Please try again later.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-pink-700">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-pink-200 rounded focus:ring-2 focus:ring-pink-300"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-pink-700">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-pink-200 rounded focus:ring-2 focus:ring-pink-300"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-pink-700">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-2 border border-pink-200 rounded focus:ring-2 focus:ring-pink-300"
                    rows="4"
                    placeholder="Your message..."
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 text-white rounded hover:bg-pink-700 ${
                    isSubmitting ? 'bg-pink-400' : 'bg-pink-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="inline w-5 h-5 mr-2 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="inline mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
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
        )}
      </div>
    </div>
  );
}

export default Contact;