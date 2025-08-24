import React from "react";
import { BookOpen, Users, Calendar, CreditCard, Shield, MessageCircle } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function Help() {
  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn how to create an account and start using our platform",
      topics: ["Account Setup", "First Booking", "Platform Navigation"]
    },
    {
      icon: Users,
      title: "Finding Tutors",
      description: "Discover how to search and filter tutors effectively",
      topics: ["Search Tips", "Tutor Profiles", "Subject Selection"]
    },
    {
      icon: Calendar,
      title: "Booking & Scheduling",
      description: "Understand how to book and manage your tutoring sessions",
      topics: ["Making Bookings", "Rescheduling", "Cancellations"]
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Learn about our pricing and payment methods",
      topics: ["Pricing", "Payment Methods", "Refunds"]
    },
    {
      icon: Shield,
      title: "Safety & Trust",
      description: "Information about our safety measures and policies",
      topics: ["Tutor Verification", "Safety Guidelines", "Privacy"]
    },
    {
      icon: MessageCircle,
      title: "Communication",
      description: "How to communicate with tutors and get support",
      topics: ["Messaging Tutors", "Support Channels", "Feedback"]
    }
  ];

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find help articles, tutorials, and support resources to get the most out of TutorMatch Chicago.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <BookOpen className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <category.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <ul className="space-y-1">
                {category.topics.map((topic, topicIndex) => (
                  <li key={topicIndex} className="text-sm text-gray-500">• {topic}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href={route("storefront.faq")}
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">FAQ</h3>
              <p className="text-sm text-gray-600">Common questions</p>
            </a>
            <a
              href={route("storefront.contact")}
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Contact Us</h3>
              <p className="text-sm text-gray-600">Get in touch</p>
            </a>
            <a
              href="#"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Video Tutorials</h3>
              <p className="text-sm text-gray-600">Step-by-step guides</p>
            </a>
            <a
              href="#"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Community</h3>
              <p className="text-sm text-gray-600">User forums</p>
            </a>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Help Articles</h2>
          <div className="space-y-4">
            {[
              "How to Book Your First Tutoring Session",
              "Understanding Tutor Pricing and Payment",
              "Tips for Finding the Right Tutor",
              "Managing Your Account and Bookings",
              "What to Expect During a Tutoring Session"
            ].map((article, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <a href="#" className="flex items-center justify-between">
                  <span className="text-gray-900 hover:text-blue-600">{article}</span>
                  <span className="text-blue-600 text-sm">Read →</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you with any questions or issues you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={route("storefront.contact")}>
                <Button variant="outline">Contact Support</Button>
              </a>
              <a href="#">
                <Button>Live Chat</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
