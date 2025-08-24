import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission - this will be connected to your Laravel backend
    console.log("Form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">info@tutormatchchicago.com</p>
                  <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="text-gray-600">(312) 555-0123</p>
                  <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM CST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Office</h3>
                  <p className="text-gray-600">
                    123 Learning Street<br />
                    Chicago, IL 60601
                  </p>
                  <p className="text-sm text-gray-500">By appointment only</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Frequently Asked Questions</h3>
              <p className="text-gray-600 mb-4">
                Check out our FAQ page for quick answers to common questions.
              </p>
              <a href={route("storefront.faq")} className="text-blue-600 hover:text-blue-700 font-medium">
                View FAQ →
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="tutoring">Tutoring Services</option>
                  <option value="billing">Billing & Payment</option>
                  <option value="technical">Technical Support</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>

            {/* Response Time */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Response Time:</strong> We typically respond to all inquiries within 24 hours 
                during business days. For urgent matters, please call us directly.
              </p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Find Us</h2>
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Interactive Map</p>
              <p className="text-sm">123 Learning Street, Chicago, IL 60601</p>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
