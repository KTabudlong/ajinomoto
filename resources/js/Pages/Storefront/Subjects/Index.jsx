import React from "react";
import { Link } from "@inertiajs/react";
import { BookOpen, Users, Clock } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Card, CardContent, CardFooter } from "@/Components/Card/Card";
import { Badge } from "@/Components/Badge/Badge";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function SubjectsIndex() {
  // Mock data for demonstration - this will come from your Laravel backend
  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      description: "Algebra, Calculus, Geometry, Statistics, and more",
      teacherCount: 15,
      topicCount: 45,
      difficulty: "All Levels",
      category: "STEM",
      image: null,
    },
    {
      id: 2,
      name: "Physics",
      description: "Mechanics, Thermodynamics, Electromagnetism, Quantum Physics",
      teacherCount: 8,
      topicCount: 32,
      difficulty: "High School & College",
      category: "STEM",
      image: null,
    },
    {
      id: 3,
      name: "Chemistry",
      description: "Organic Chemistry, Inorganic Chemistry, Physical Chemistry",
      teacherCount: 12,
      topicCount: 38,
      difficulty: "High School & College",
      category: "STEM",
      image: null,
    },
    {
      id: 4,
      name: "English Literature",
      description: "Classic Literature, Modern Literature, Poetry, Writing",
      teacherCount: 18,
      topicCount: 52,
      difficulty: "All Levels",
      category: "Humanities",
      image: null,
    },
    {
      id: 5,
      name: "History",
      description: "World History, American History, European History, Ancient Civilizations",
      teacherCount: 14,
      topicCount: 41,
      difficulty: "All Levels",
      category: "Humanities",
      image: null,
    },
    {
      id: 6,
      name: "Computer Science",
      description: "Programming, Data Structures, Algorithms, Web Development",
      teacherCount: 20,
      topicCount: 65,
      difficulty: "All Levels",
      category: "STEM",
      image: null,
    },
    {
      id: 7,
      name: "Spanish",
      description: "Conversational Spanish, Grammar, Literature, Culture",
      teacherCount: 10,
      topicCount: 28,
      difficulty: "Beginner to Advanced",
      category: "Languages",
      image: null,
    },
    {
      id: 8,
      name: "Music",
      description: "Piano, Guitar, Voice, Music Theory, Composition",
      teacherCount: 16,
      topicCount: 35,
      difficulty: "All Levels",
      category: "Arts",
      image: null,
    },
  ];

  const categories = ["All", "STEM", "Humanities", "Languages", "Arts"];

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Subjects
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover a wide range of subjects and find the perfect tutor for your learning journey.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BookOpen className="h-16 w-16 mx-auto mb-2" />
                    <p className="text-sm">{subject.name}</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{subject.name}</h3>
                  <Badge variant="default">{subject.category}</Badge>
                </div>
                
                <p className="text-gray-600 mb-4">{subject.description}</p>
                
                {/* Stats */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{subject.teacherCount} teachers available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{subject.topicCount} topics covered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Difficulty: {subject.difficulty}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <div className="flex gap-2 w-full">
                  <Link href={route("storefront.subjects.show", { subject: subject.name.toLowerCase().replace(" ", "-") })} className="flex-1">
                    <Button variant="outline" className="w-full">Explore Topics</Button>
                  </Link>
                  <Link href={route("storefront.teachers", { subject: subject.name })} className="flex-1">
                    <Button className="w-full">Find Teachers</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're constantly expanding our subject offerings. Contact us if you need a specific subject or topic that's not currently available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={route("storefront.contact")}>
                <Button variant="outline">Contact Us</Button>
              </Link>
              <Link href={route("storefront.teachers")}>
                <Button>Browse All Teachers</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
