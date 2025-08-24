import React from "react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function Terms() {
  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <p className="text-gray-700 mb-6">
            These Terms of Service govern your use of the TutorMatch Chicago platform. 
            By using our services, you agree to these terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using our platform, you agree to be bound by these Terms of Service 
            and all applicable laws and regulations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Accounts</h2>
          <p className="text-gray-700 mb-4">
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Service Description</h2>
          <p className="text-gray-700 mb-4">
            TutorMatch Chicago provides a platform for connecting students with qualified tutors. 
            We facilitate the connection but are not responsible for the quality of tutoring services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Payment Terms</h2>
          <p className="text-gray-700 mb-4">
            Payment for tutoring sessions is processed through our secure payment system. 
            All fees are non-refundable except as specified in our refund policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Prohibited Activities</h2>
          <p className="text-gray-700 mb-4">
            You agree not to use our platform for any unlawful purpose or to violate any 
            applicable laws or regulations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            TutorMatch Chicago shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages arising from your use of our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-6">
            If you have any questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:legal@tutormatchchicago.com" className="text-blue-600 hover:text-blue-700">
              legal@tutormatchchicago.com
            </a>
          </p>
        </div>
      </div>
    </StorefrontLayout>
  );
}
