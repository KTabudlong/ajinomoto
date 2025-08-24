import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, GraduationCap, Clock, Star } from "lucide-react";

import { Button } from "@/Components/Button/Button";
import { Card, CardContent, CardFooter } from "@/Components/Card/Card";
import { FeaturedTeachers } from "@/Components/Storefront/FeaturedTeachers";

export default function StorefrontHome() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Find Your Perfect Tutor in Chicago
                </h1>
                <p className="text-gray-600 md:text-xl">
                  Connect with expert teachers for personalized learning experiences tailored to your needs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href={route("storefront.teachers")}>
                  <Button size="lg" className="gap-1">
                    Find a Teacher <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline">
                    How It Works
                  </Button>
                </Link>
              </div>

              {/* Demo Navigation - Easy access to auth pages */}
              <div className="mt-8 p-4 bg-gray-100 rounded-lg border">
                <p className="text-sm font-medium mb-3">🔗 Quick Access (Demo):</p>
                <div className="flex flex-wrap gap-2">
                  <Link href={route("login")}>
                    <Button variant="outline" size="sm">
                      Login Page
                    </Button>
                  </Link>
                  <Link href={route("register")}>
                    <Button variant="outline" size="sm">
                      Register Page
                    </Button>
                  </Link>
                  <Link href={route("password.request")}>
                    <Button variant="outline" size="sm">
                      Forgot Password
                    </Button>
                  </Link>
                  <Link href={route("storefront.about")}>
                    <Button variant="outline" size="sm">
                      About Page
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative h-[350px] lg:h-[500px] rounded-lg overflow-hidden bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <GraduationCap className="h-24 w-24 mx-auto mb-4" />
                  <p className="text-lg font-medium">Teacher helping student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Teachers Section */}
      <section className="w-full py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Featured Teachers</h2>
              <p className="text-gray-600 md:text-xl">
                Our top-rated tutors ready to help you excel in your studies
              </p>
            </div>
          </div>
          <div className="mt-8">
            <FeaturedTeachers />
          </div>
          <div className="flex justify-center mt-8">
            <Link href={route("storefront.teachers")}>
              <Button variant="outline" size="lg">
                View All Teachers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-12 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How It Works</h2>
              <p className="text-gray-600 md:text-xl">Simple steps to find and book your perfect tutor</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold">1. Find a Teacher</h3>
                <p className="text-gray-600 mt-2">
                  Browse our catalog of qualified teachers based on subject and expertise.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold">2. Book a Session</h3>
                <p className="text-gray-600 mt-2">
                  Select a time that works for you and book your tutoring session.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold">3. Learn & Succeed</h3>
                <p className="text-gray-600 mt-2">
                  Meet with your tutor and take your knowledge to the next level.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="w-full py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Popular Subjects</h2>
              <p className="text-gray-600 md:text-xl">Discover tutoring across a wide range of subjects</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
            {[
              "Mathematics",
              "Science",
              "English",
              "History",
              "Computer Science",
              "Languages",
              "Music",
              "Art",
              "Physics",
              "Chemistry",
              "Biology",
              "Economics",
            ].map((subject) => (
              <Card key={subject} className="bg-white">
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium">{subject}</h3>
                </CardContent>
                <CardFooter className="p-0">
                  <Link href={route("storefront.subjects.show", { subject: subject.toLowerCase().replace(" ", "-") })} className="w-full">
                    <Button variant="ghost" className="w-full rounded-t-none">
                      Explore
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Start Learning?</h2>
              <p className="md:text-xl">Join hundreds of students in Chicago who are achieving their academic goals.</p>
            </div>
            <Link href={route("storefront.teachers")}>
              <Button size="lg" variant="secondary" className="gap-1">
                Find Your Teacher Today <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
