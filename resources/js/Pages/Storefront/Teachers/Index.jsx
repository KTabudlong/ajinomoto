import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Search, Filter, Star, MapPin, Clock } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Card, CardContent, CardFooter } from "@/Components/Card/Card";
import { Badge } from "@/Components/Badge/Badge";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function TeachersIndex({ teachers = [], filters = {} }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedSubject, setSelectedSubject] = useState(filters.subject || "");
  const [selectedRating, setSelectedRating] = useState(filters.rating || "");

  // Mock data for demonstration - this will come from your Laravel backend
  const mockTeachers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      subjects: ["Mathematics", "Physics", "Computer Science"],
      rating: 4.9,
      reviews: 124,
      location: "Chicago, IL",
      hourly_rate: 75,
      experience: "15+ years",
      availability: "Weekdays & Weekends",
      image: null,
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      subjects: ["Chemistry", "Biology", "Science"],
      rating: 4.8,
      reviews: 98,
      location: "Chicago, IL",
      hourly_rate: 70,
      experience: "12+ years",
      availability: "Weekdays",
      image: null,
    },
    {
      id: 3,
      name: "Ms. Emily Rodriguez",
      subjects: ["English Literature", "Writing", "Spanish"],
      rating: 4.9,
      reviews: 156,
      location: "Chicago, IL",
      hourly_rate: 65,
      experience: "8+ years",
      availability: "Weekends",
      image: null,
    },
    {
      id: 4,
      name: "Mr. David Thompson",
      subjects: ["History", "Political Science", "Geography"],
      rating: 4.7,
      reviews: 89,
      location: "Chicago, IL",
      hourly_rate: 60,
      experience: "10+ years",
      availability: "Weekdays & Weekends",
      image: null,
    },
  ];

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "English", "History", "Geography", "Spanish", "French", "Music", "Art"
  ];

  const ratings = [
    { value: "4.5", label: "4.5+ stars" },
    { value: "4.0", label: "4.0+ stars" },
    { value: "3.5", label: "3.5+ stars" },
  ];

  const filteredTeachers = mockTeachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || teacher.subjects.includes(selectedSubject);
    const matchesRating = !selectedRating || teacher.rating >= parseFloat(selectedRating);
    
    return matchesSearch && matchesSubject && matchesRating;
  });

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Tutor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our network of qualified teachers and find the perfect match for your learning goals.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers, subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              {/* Rating Filter */}
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Ratings</option>
                {ratings.map((rating) => (
                  <option key={rating.value} value={rating.value}>{rating.label}</option>
                ))}
              </select>

              {/* Clear Filters */}
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("");
                  setSelectedRating("");
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredTeachers.length} of {mockTeachers.length} teachers
          </p>
        </div>

        {/* Teachers Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">
                        {teacher.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <p className="text-sm">Profile Photo</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{teacher.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center text-yellow-500">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(teacher.rating) ? "fill-current" : "fill-none"}`}
                        />
                      ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {teacher.rating} ({teacher.reviews} reviews)
                  </span>
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {teacher.subjects.slice(0, 3).map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                  {teacher.subjects.length > 3 && (
                    <Badge variant="outline">+{teacher.subjects.length - 3} more</Badge>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{teacher.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{teacher.availability}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Experience: {teacher.experience}</span>
                    <span className="font-semibold text-blue-600">${teacher.hourly_rate}/hr</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <div className="flex gap-2 w-full">
                  <Link href={route("storefront.teachers.show", { id: teacher.id })} className="flex-1">
                    <Button variant="outline" className="w-full">View Profile</Button>
                  </Link>
                  <Link href={route("storefront.booking.create", { teacher_id: teacher.id })} className="flex-1">
                    <Button className="w-full">Book Session</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all subjects.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedSubject("");
                setSelectedRating("");
              }}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
