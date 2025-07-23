import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  FaFilePdf,
  FaUser,
  FaBox,
  FaCreditCard,
  FaHome,
  FaPhone,
  FaArrowLeft,
  FaCheckCircle,
  FaShippingFast,
  FaFileInvoiceDollar,
  FaMobileAlt
} from "react-icons/fa";
import { GiMedicines } from "react-icons/gi";

function BillingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails } = location.state || {};

  const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => {
      const product = item.product || item;
      return sum + (product.price * (item.quantity || 1));
    }, 0);
  };

  const transactionDetails = {
    orderId: orderDetails?.orderId || `ORD-${Math.floor(Math.random() * 1000000)}`,
    trackingId: orderDetails?.trackingId || `TRK-${Math.floor(Math.random() * 1000000)}`,
    transactionId: orderDetails?.transactionId,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: orderDetails?.userDetails?.paymentMethod || 'Credit Card',
    items: orderDetails?.items || [
      { product: { id: 1, name: "Paracetamol 500mg", price: 15 }, quantity: 2 },
      { product: { id: 2, name: "Vitamin C Tablets", price: 120 }, quantity: 1 }
    ],
    total: calculateTotal(orderDetails?.items) || 150,
    userDetails: orderDetails?.userDetails || {
      name: "John Doe",
      address: "123 Medical St, Health Town",
      city: "Bangalore",
      phone: "9876543210",
      email: "john@example.com"
    },
    ...orderDetails
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerHeight = 30;

    // CareKart Header
    doc.setFontSize(24);
    doc.setTextColor(40, 180, 99);
    doc.setFont("helvetica", "bold");
    doc.text("CareKart", pageWidth / 2, y, { align: "center" });
    y += 10;
    
    // Invoice title
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text("INVOICE", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${transactionDetails.orderId}`, pageWidth - margin, y, { align: "right" });
    doc.text(`Date: ${transactionDetails.date}`, pageWidth - margin, y + 5, { align: "right" });
    y += 15;

    // Bill To section
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(transactionDetails.userDetails?.name || 'N/A', margin, y + 10);
    doc.text(transactionDetails.userDetails?.address || 'N/A', margin, y + 20);
    doc.text(`${transactionDetails.userDetails?.city || 'N/A'}`, margin, y + 30);
    doc.text(`Phone: ${transactionDetails.userDetails?.phone || 'N/A'}`, margin, y + 40);
    y += 50;

    // Payment and shipping info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Payment Method: ${transactionDetails.paymentMethod}`, margin, y);
    if (transactionDetails.paymentMethod.toLowerCase() === 'upi') {
      doc.text(`Transaction ID: ${transactionDetails.transactionId || 'N/A'}`, margin, y + 10);
    }
    doc.text(`Shipping Method: Standard Delivery`, pageWidth - margin, y, { align: "right" });
    doc.text(`Tracking ID: ${transactionDetails.trackingId}`, pageWidth - margin, y + 10, { align: "right" });
    y += 20;

    // Items table header
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, pageWidth - 2 * margin, 10, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Description", margin + 5, y + 7);
    doc.text("Qty", 120, y + 7, { align: "right" });
    doc.text("Unit Price", 150, y + 7, { align: "right" });
    doc.text("Amount", pageWidth - margin, y + 7, { align: "right" });
    y += 15;

    // Items rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const items = transactionDetails.items || [];
    
    for (const item of items) {
      const product = item.product || item;
      const price = Number(product.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const total = price * quantity;
      
      // Check if we need a new page
      if (y > pageHeight - footerHeight - 50) {
        doc.addPage();
        y = margin;
        
        // Redraw table header on new page
        doc.setDrawColor(200);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y, pageWidth - 2 * margin, 10, "F");
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("Description", margin + 5, y + 7);
        doc.text("Qty", 120, y + 7, { align: "right" });
        doc.text("Unit Price", 150, y + 7, { align: "right" });
        doc.text("Amount", pageWidth - margin, y + 7, { align: "right" });
        y += 15;
      }
      
      doc.text(product.name, margin + 5, y + 7);
      doc.text(`${quantity}`, 120, y + 7, { align: "right" });
      doc.text(`₹${price.toFixed(2)}`, 150, y + 7, { align: "right" });
      doc.text(`₹${total.toFixed(2)}`, pageWidth - margin, y + 7, { align: "right" });
      y += 10;
      
      doc.setDrawColor(220);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 5;
    }

    // Ensure space for totals
    if (y > pageHeight - footerHeight - 30) {
      doc.addPage();
      y = margin;
    }

    // Total section
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - margin - 70, y, 70, 30, "F");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", pageWidth - margin - 70, y + 10);
    doc.text("Tax (5%):", pageWidth - margin - 70, y + 20);
    doc.text("Total:", pageWidth - margin - 70, y + 30);
    
    const subtotal = Number(transactionDetails.total) || 0;
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - margin, y + 10, { align: "right" });
    doc.text(`₹${tax.toFixed(2)}`, pageWidth - margin, y + 20, { align: "right" });
    doc.setFontSize(14);
    doc.text(`₹${total.toFixed(2)}`, pageWidth - margin, y + 30, { align: "right" });
    y += 40;

    // Thank you message at bottom of last page
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with CareKart!", pageWidth / 2, pageHeight - 20, { align: "center" });
    doc.text("For any queries, please contact: kathiryoga137@gmail.com", pageWidth / 2, pageHeight - 15, { align: "center" });

    doc.save(`CareKart_Invoice_${transactionDetails.orderId}.pdf`);
  };

  const getStatusColor = () => {
    return {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <FaCheckCircle className="text-green-500" />
    };
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-cyan-50 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 transition-all bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-x-1"
          >
            <FaArrowLeft />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-transparent md:text-4xl bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              <FaFileInvoiceDollar className="inline mb-1 mr-3" />
              Order Invoice
            </h1>
            <p className="mt-1 text-gray-500">Your order details and receipt</p>
          </div>
          
          <div className="w-8"></div>
        </div>

        <div className={`${getStatusColor().bg} ${getStatusColor().text} rounded-xl p-4 mb-8 flex items-center justify-between shadow-md`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getStatusColor().icon}
            </div>
            <div>
              <h3 className="font-bold">Order Confirmed</h3>
              <p className="text-sm">Your order has been successfully placed</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 text-sm font-medium bg-white rounded-full">
            <FaShippingFast />
            <span>Tracking ID: {transactionDetails.trackingId}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="p-4 text-white bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm">
                  <FaUser className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Customer Details</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{transactionDetails.userDetails?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                    <FaHome />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">{transactionDetails.userDetails?.address}</p>
                    <p className="text-gray-600">{transactionDetails.userDetails?.city}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{transactionDetails.userDetails?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="p-4 text-white bg-gradient-to-r from-teal-500 to-teal-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm">
                  <FaBox className="text-xl" />
                </div>
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono font-medium text-blue-600">{transactionDetails.orderId}</span>
                </div>
                
                {transactionDetails.paymentMethod.toLowerCase() === 'upi' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono font-medium text-blue-600">{transactionDetails.transactionId}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time:</span>
                  <span className="font-medium">
                    {transactionDetails.date} at {transactionDetails.time}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="flex items-center gap-2 font-medium">
                    {transactionDetails.paymentMethod === 'upi' ? (
                      <FaMobileAlt className="text-purple-500" />
                    ) : (
                      <FaCreditCard className="text-blue-500" />
                    )}
                    {transactionDetails.paymentMethod}
                  </span>
                </div>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Items Total:</span>
                    <span className="font-medium">₹{transactionDetails.total}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-500">Delivery:</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                    <span className="font-bold">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">₹{transactionDetails.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
          <div className="p-4 text-white bg-gradient-to-r from-indigo-500 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg bg-opacity-20 backdrop-blur-sm">
                <GiMedicines className="text-xl" />
              </div>
              <h2 className="text-xl font-semibold">Order Items</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-sm font-semibold text-left text-gray-600 uppercase">Product</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right text-gray-600 uppercase">Quantity</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right text-gray-600 uppercase">Unit Price</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right text-gray-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactionDetails.items?.map((item, index) => {
                  const product = item.product || item;
                  return (
                    <tr key={index} className="transition-colors hover:bg-blue-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                            <GiMedicines />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">{item.quantity || 1}</td>
                      <td className="px-6 py-4 text-right">₹{product.price}</td>
                      <td className="px-6 py-4 font-medium text-right">₹{product.price * (item.quantity || 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 font-bold text-right text-gray-700">Total Amount:</td>
                  <td className="px-6 py-4 text-xl font-bold text-right text-blue-600">₹{transactionDetails.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={downloadInvoice}
            className="flex items-center justify-center gap-3 px-8 py-4 text-white transition-all transform shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-1"
          >
            <FaFilePdf className="text-xl" />
            <span className="font-semibold">Download Invoice</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 px-8 py-4 text-white transition-all transform shadow-lg bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl hover:from-teal-600 hover:to-teal-700 hover:shadow-xl hover:-translate-y-1"
          >
            <FaHome className="text-xl" />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>

        <div className="p-6 mt-12 text-center bg-white border border-gray-200 bg-opacity-70 backdrop-blur-sm rounded-xl">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Need help with your order?</h3>
          <p className="mb-4 text-gray-600">Our customer support team is available 24/7</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a href="tel:+917339088173" className="px-4 py-2 text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200">
              Call Support: +91 7339088173
            </a>
            <a href="mailto:kathiryoga137@gmail.com" className="px-4 py-2 text-teal-600 transition-colors bg-teal-100 rounded-lg hover:bg-teal-200">
              Email: kathiryoga137@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingPage;