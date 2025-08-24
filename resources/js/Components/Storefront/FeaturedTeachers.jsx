import React from "react";
import { Link } from "@inertiajs/react";
import { Star } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/Components/Card/Card";
import { Button } from "@/Components/Button/Button";
import { Badge } from "@/Components/Badge/Badge";

// Mock data for featured teachers - this will come from your Laravel backend
const featuredTeachers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    subjects: ["Mathematics", "Physics", "Computer Science"],
    rating: 4.9,
    reviews: 124,
    image: null, // Will use placeholder for now
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    subjects: ["Chemistry", "Biology", "Science"],
    rating: 4.8,
    reviews: 98,
    image: null,
  },
  {
    id: 3,
    name: "Ms. Emily Rodriguez",
    subjects: ["English Literature", "Writing", "Spanish"],
    rating: 4.9,
    reviews: 156,
    image: null,
  },
];

export function FeaturedTeachers() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featuredTeachers.map((teacher) => (
        <Card key={teacher.id} className="overflow-hidden">
          <div className="relative h-48 w-full bg-gray-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">
                    {teacher.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <p className="text-sm">Profile Photo</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold">{teacher.name}</h3>
            <div className="flex items-center mt-2 text-yellow-500">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(teacher.rating) ? "fill-current" : "fill-none"}`}
                  />
                ))}
              <span className="ml-2 text-sm text-gray-500">
                {teacher.rating} ({teacher.reviews} reviews)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {teacher.subjects.slice(0, 3).map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href={route("storefront.teachers.show", { id: teacher.id })} className="w-full">
              <Button className="w-full">View Profile</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
