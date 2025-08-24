import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Star, MapPin, Clock, BookOpen, Calendar, MessageCircle } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Badge } from "@/Components/Badge/Badge";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function TeacherShow({ id }) {
  // Mock data for demonstration - this will come from your Laravel backend
  const teacher = {
    id: id,
    name: "Dr. Sarah Johnson",
    subjects: ["Mathematics", "Physics", "Computer Science"],
    rating: 4.9,
    reviews: 124,
    location: "Chicago, IL",
    hourly_rate: 75,
    experience: "15+ years",
    availability: "Weekdays & Weekends",
    education: "Ph.D. in Mathematics, University of Chicago",
    bio: "Dr. Sarah Johnson is a passionate educator with over 15 years of experience teaching mathematics and physics. She specializes in helping students understand complex concepts through real-world applications and interactive problem-solving approaches.",
    image: null,
  };

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href={route("home")} className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href={route("storefront.teachers")} className="hover:text-blue-600">Teachers</Link></li>
            <li>/</li>
            <li className="text-gray-900">{teacher.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Teacher Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="text-center text-gray-500">
                    <span className="text-3xl font-bold text-gray-600">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{teacher.name}</h1>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center text-yellow-500">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(teacher.rating) ? "fill-current" : "fill-none"}`}
                          />
                        ))}
                    </div>
                    <span className="ml-2 text-gray-600">
                      {teacher.rating} ({teacher.reviews} reviews)
                    </span>
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{teacher.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{teacher.availability}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{teacher.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">${teacher.hourly_rate}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {teacher.name}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{teacher.bio}</p>
              <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
              <p className="text-gray-700">{teacher.education}</p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Student Reviews</h2>
              <div className="space-y-4">
                {[
                  { name: "Alex M.", rating: 5, comment: "Dr. Johnson is amazing! She made calculus so much easier to understand." },
                  { name: "Sarah K.", rating: 5, comment: "Very patient and explains concepts clearly. Highly recommend!" },
                  { name: "Mike R.", rating: 4, comment: "Great tutor, helped me improve my physics grade significantly." }
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{review.name}</span>
                      <div className="flex items-center text-yellow-500">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "fill-none"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Book a Session</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>

                <div className="pt-4">
                  <Button className="w-full mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>Session duration: 1 hour</p>
                  <p>Rate: ${teacher.hourly_rate}/hour</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
