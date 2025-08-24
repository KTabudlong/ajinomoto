import React from "react";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set([0]));

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqs = [
    {
      question: "How does TutorMatch Chicago work?",
      answer: "TutorMatch Chicago connects students with qualified tutors in the Chicago area. Students can browse available tutors, view their profiles and subjects, and book sessions directly through our platform. All tutors are vetted and experienced in their respective subjects."
    },
    {
      question: "What subjects do you offer tutoring for?",
      answer: "We offer tutoring in a wide range of subjects including Mathematics, Science, English, History, Computer Science, Languages, Music, and Art. Our tutors specialize in various levels from elementary school to college and beyond."
    },
    {
      question: "How much do tutoring sessions cost?",
      answer: "Tutoring session costs vary depending on the tutor's experience, subject, and session length. Most tutors charge between $40-$80 per hour. You can view each tutor's hourly rate on their profile before booking."
    },
    {
      question: "How do I book a tutoring session?",
      answer: "To book a session, first browse our available tutors and subjects. Once you find a tutor you'd like to work with, click 'Book Session' on their profile. You'll be able to select a date and time that works for both you and the tutor."
    },
    {
      question: "Can I cancel or reschedule a session?",
      answer: "Yes, you can cancel or reschedule sessions up to 24 hours before the scheduled time without any penalty. Cancellations made within 24 hours may be subject to the tutor's cancellation policy."
    },
    {
      question: "What if I'm not satisfied with my tutor?",
      answer: "We want you to have a great learning experience. If you're not satisfied with your tutor after the first session, please contact us and we'll help you find a better match or provide a refund."
    },
    {
      question: "Do you offer online tutoring?",
      answer: "Yes, many of our tutors offer both in-person and online tutoring sessions. You can filter tutors by their preferred method of instruction when searching."
    },
    {
      question: "How do I become a tutor on your platform?",
      answer: "We're always looking for qualified tutors to join our platform. To apply, please visit our tutor application page or contact us directly. We require all tutors to have relevant education and teaching experience."
    }
  ];

  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our tutoring services and platform.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openItems.has(index) ? (
                  <Minus className="h-5 w-5 text-gray-500" />
                ) : (
                  <Plus className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {openItems.has(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Please contact our support team and we'll get back to you as soon as possible.
            </p>
            <a
              href={route("storefront.contact")}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
