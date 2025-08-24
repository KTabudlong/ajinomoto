import React from "react";
import { Link } from "@inertiajs/react";
import { Users, Award, Clock, Heart } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function About() {
  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About TutorMatch Chicago
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting students with expert tutors for personalized learning experiences in the Chicago area.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              At TutorMatch Chicago, we believe that every student deserves access to quality education 
              and personalized learning experiences. Our platform connects students with experienced, 
              qualified tutors who are passionate about teaching and helping students achieve their goals.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Building a supportive learning community where students and tutors can thrive together.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">
                Maintaining high standards for our tutors and ensuring quality learning experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexibility</h3>
              <p className="text-gray-600">
                Providing flexible scheduling options to accommodate busy student and tutor schedules.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Passion</h3>
              <p className="text-gray-600">
                Fostering a love for learning and helping students discover their potential.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              TutorMatch Chicago was founded with a simple vision: to make quality tutoring accessible 
              to every student in the Chicago area. We recognized that traditional tutoring services 
              often had limited availability, high costs, and rigid scheduling requirements.
            </p>
            <p>
              Our platform was designed to solve these challenges by connecting students directly with 
              qualified tutors who can provide personalized instruction at times that work for both parties. 
              Whether you need help with math homework, want to improve your writing skills, or are 
              preparing for college entrance exams, we have tutors who can help.
            </p>
            <p>
              Today, we're proud to serve students across Chicago and the surrounding suburbs, helping 
              them build confidence, improve their academic performance, and develop a lifelong love of learning.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>
          <p className="text-gray-700 mb-6">
            Our team is made up of education professionals, technology experts, and passionate individuals 
            who are committed to improving the educational experience for students and tutors alike.
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 text-center">
              We're always looking for talented individuals who share our passion for education. 
              If you're interested in joining our team, please reach out to us.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-blue-600 text-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6">
              Join hundreds of students who are already benefiting from personalized tutoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={route("storefront.teachers")}>
                <Button variant="secondary" size="lg">Find a Tutor</Button>
              </Link>
              <Link href={route("storefront.contact")}>
                <Button variant="outline" size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
