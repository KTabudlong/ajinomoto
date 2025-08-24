import React from "react";
import { Link } from "@inertiajs/react";
import { Heart, Star, MapPin, Clock, Trash2 } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Card, CardContent, CardFooter } from "@/Components/Card/Card";
import { Badge } from "@/Components/Badge/Badge";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function Favorites() {
  // Mock data for demonstration - this will come from your Laravel backend
  const favorites = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      subjects: ["Mathematics", "Physics", "Computer Science"],
      rating: 4.9,
      reviews: 124,
      location: "Chicago, IL",
      hourly_rate: 75,
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
      availability: "Weekends",
      image: null,
    },
  ];

  const removeFavorite = (id) => {
    // Handle removing from favorites - this will be connected to your Laravel backend
    console.log("Remove favorite:", id);
  };

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Favorites
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Keep track of your favorite tutors and easily book sessions with them.
          </p>
        </div>

        {favorites.length > 0 ? (
          <>
            {/* Favorites Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                You have {favorites.length} favorite {favorites.length === 1 ? 'tutor' : 'tutors'}
              </p>
            </div>

            {/* Favorites Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((teacher) => (
                <Card key={teacher.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFavorite(teacher.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

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
                        <span>Experience: 10+ years</span>
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

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <div className="bg-blue-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Learn?
                </h2>
                <p className="text-gray-600 mb-6">
                  Book a session with one of your favorite tutors or discover new ones.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={route("storefront.teachers")}>
                    <Button variant="outline">Browse All Teachers</Button>
                  </Link>
                  <Link href={route("storefront.subjects")}>
                    <Button>Explore Subjects</Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your list of favorite tutors by browsing our available teachers and 
              clicking the heart icon to save them to your favorites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={route("storefront.teachers")}>
                <Button>Find Teachers</Button>
              </Link>
              <Link href={route("storefront.subjects")}>
                <Button variant="outline">Browse Subjects</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
