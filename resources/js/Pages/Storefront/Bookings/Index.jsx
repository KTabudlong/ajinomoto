import React from "react";
import { Link } from "@inertiajs/react";
import { Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Badge } from "@/Components/Badge/Badge";
import StorefrontLayout from "@/Layouts/StorefrontLayout";

export default function BookingsIndex() {
  // Mock data for demonstration - this will come from your Laravel backend
  const bookings = [
    {
      id: 1,
      teacher: "Dr. Sarah Johnson",
      subject: "Mathematics",
      topic: "Calculus",
      date: "2025-01-20",
      time: "14:00",
      duration: "1 hour",
      status: "upcoming",
      location: "Online",
      price: 75,
    },
    {
      id: 2,
      teacher: "Prof. Michael Chen",
      subject: "Chemistry",
      topic: "Organic Chemistry",
      date: "2025-01-18",
      time: "10:00",
      duration: "1 hour",
      status: "completed",
      location: "In-person",
      price: 70,
    },
    {
      id: 3,
      teacher: "Ms. Emily Rodriguez",
      subject: "English Literature",
      topic: "Essay Writing",
      date: "2025-01-15",
      time: "16:00",
      duration: "1 hour",
      status: "completed",
      location: "Online",
      price: 65,
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      upcoming: { variant: "default", label: "Upcoming" },
      completed: { variant: "secondary", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      rescheduled: { variant: "outline", label: "Rescheduled" },
    };
    
    const config = variants[status] || variants.upcoming;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Bookings
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your tutoring sessions and track your learning progress.
          </p>
        </div>

        {bookings.length > 0 ? (
          <>
            {/* Bookings Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                You have {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
              </p>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {booking.subject} - {booking.topic}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {booking.teacher}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            ${booking.price}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{formatTime(booking.time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{booking.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{booking.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                      {booking.status === 'upcoming' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Book Again
                        </Button>
                      )}
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <div className="bg-blue-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready for Your Next Session?
                </h2>
                <p className="text-gray-600 mb-6">
                  Book a new tutoring session or explore our available subjects and teachers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={route("storefront.teachers")}>
                    <Button variant="outline">Find Teachers</Button>
                  </Link>
                  <Link href={route("storefront.subjects")}>
                    <Button>Browse Subjects</Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Bookings Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't booked any tutoring sessions yet. Start your learning journey by 
              finding a teacher and booking your first session.
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
