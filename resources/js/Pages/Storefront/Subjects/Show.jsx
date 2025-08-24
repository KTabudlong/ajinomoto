import React from "react";
import { Link } from "@inertiajs/react";
import { BookOpen, Users, Clock, Star } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Card, CardContent, CardFooter } from "@/Components/Card/Card";
import { Badge } from "@/Components/Badge/Badge";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function SubjectShow({ subject }) {
  // Mock data for demonstration - this will come from your Laravel backend
  const subjectData = {
    name: subject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: "Comprehensive tutoring in this subject area with experienced educators.",
    teacherCount: 12,
    topicCount: 35,
    difficulty: "All Levels",
    category: "STEM",
    topics: [
      "Basic Concepts", "Advanced Theory", "Problem Solving", "Practical Applications",
      "Exam Preparation", "Homework Help", "Concept Review", "Skill Building"
    ],
    teachers: [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        rating: 4.9,
        reviews: 124,
        hourly_rate: 75,
        subjects: ["Mathematics", "Physics"],
        image: null,
      },
      {
        id: 2,
        name: "Prof. Michael Chen",
        rating: 4.8,
        reviews: 98,
        hourly_rate: 70,
        subjects: ["Chemistry", "Biology"],
        image: null,
      },
      {
        id: 3,
        name: "Ms. Emily Rodriguez",
        rating: 4.9,
        reviews: 156,
        hourly_rate: 65,
        subjects: ["English Literature", "Writing"],
        image: null,
      },
    ]
  };

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href={route("home")} className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href={route("storefront.subjects")} className="hover:text-blue-600">Subjects</Link></li>
            <li>/</li>
            <li className="text-gray-900">{subjectData.name}</li>
          </ol>
        </nav>

        {/* Subject Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{subjectData.name}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">{subjectData.description}</p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">{subjectData.teacherCount} teachers available</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">{subjectData.topicCount} topics covered</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Difficulty: {subjectData.difficulty}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Badge variant="default">{subjectData.category}</Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Topics Covered */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Topics Covered</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {subjectData.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Teachers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Teachers</h2>
              <div className="space-y-4">
                {subjectData.teachers.map((teacher) => (
                  <Card key={teacher.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-gray-600">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{teacher.name}</h3>
                          
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
                          <div className="flex flex-wrap gap-2 mb-3">
                            {teacher.subjects.map((subject) => (
                              <Badge key={subject} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-blue-600">${teacher.hourly_rate}/hr</span>
                            <Link href={route("storefront.teachers.show", { id: teacher.id })}>
                              <Button variant="outline" size="sm">View Profile</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link href={route("storefront.teachers", { subject: subjectData.name })}>
                  <Button>View All Teachers for {subjectData.name}</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Get Started</h3>
              
              <div className="space-y-4">
                <Link href={route("storefront.teachers", { subject: subjectData.name })} className="w-full">
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Find a Teacher
                  </Button>
                </Link>
                
                <Link href={route("storefront.contact")} className="w-full">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ask Questions
                  </Button>
                </Link>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Link href={route("storefront.contact")}>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
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
