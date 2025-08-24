import React from "react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function Privacy() {
  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <p className="text-gray-700 mb-6">
            At TutorMatch Chicago, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, and protect your personal information when you use our platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            book a tutoring session, or contact our support team.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to provide, maintain, and improve our services, 
            communicate with you, and ensure the security of our platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-6">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@tutormatchchicago.com" className="text-blue-600 hover:text-blue-700">
              privacy@tutormatchchicago.com
            </a>
          </p>
        </div>
      </div>
    </StorefrontLayout>
  );
}
