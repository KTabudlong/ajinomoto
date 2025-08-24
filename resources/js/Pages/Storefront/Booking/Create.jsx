import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Calendar, Clock, MapPin, User, BookOpen, ArrowLeft } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Badge } from "@/Components/Badge/Badge";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function BookingCreate({ teacher_id }) {
  // Mock data for demonstration - this will come from your Laravel backend
  const teacher = {
    id: teacher_id || 1,
    name: "Dr. Sarah Johnson",
    subjects: ["Mathematics", "Physics", "Computer Science"],
    rating: 4.9,
    reviews: 124,
    location: "Chicago, IL",
    hourly_rate: 75,
    availability: "Weekdays & Weekends",
    image: null,
  };

  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    date: "",
    time: "",
    duration: "1",
    location: "online",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission - this will be connected to your Laravel backend
    console.log("Booking form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const subjects = ["Mathematics", "Physics", "Computer Science"];
  const topics = {
    "Mathematics": ["Algebra", "Calculus", "Geometry", "Statistics", "Trigonometry"],
    "Physics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Physics"],
    "Computer Science": ["Programming", "Data Structures", "Algorithms", "Web Development"],
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href={route("home")} className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href={route("storefront.teachers")} className="hover:text-blue-600">Teachers</Link></li>
            <li>/</li>
            <li><Link href={route("storefront.teachers.show", { id: teacher.id })} className="hover:text-blue-600">{teacher.name}</Link></li>
            <li>/</li>
            <li className="text-gray-900">Book Session</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Book a Session</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Selection */}
                {formData.subject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic *
                    </label>
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a topic</option>
                      {topics[formData.subject]?.map((topic) => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date and Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration and Location */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="0.5">30 minutes</option>
                      <option value="1">1 hour</option>
                      <option value="1.5">1.5 hours</option>
                      <option value="2">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="online">Online (Video Call)</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any specific topics you'd like to cover, questions you have, or other details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Teacher Info & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Teacher Information</h3>
              
              {/* Teacher Card */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                    <p className="text-sm text-gray-600">{teacher.subjects.join(", ")}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{teacher.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{teacher.availability}</span>
                  </div>
                </div>
              </div>

              {/* Session Summary */}
              {formData.subject && formData.topic && formData.date && formData.time && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Session Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-medium">{formData.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Topic:</span>
                      <span className="font-medium">{formData.topic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{formData.duration} hour{formData.duration !== '1' ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium capitalize">{formData.location}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-blue-600">${teacher.hourly_rate * parseFloat(formData.duration)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="mt-6">
                <Link href={route("storefront.teachers.show", { id: teacher.id })}>
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Teacher Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
