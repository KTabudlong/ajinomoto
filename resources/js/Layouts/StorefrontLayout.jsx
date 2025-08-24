import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Bell, Menu, Search, User, X } from "lucide-react";
import { isAdmin } from "@/constants/roles";

import { Button } from "@/Components/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/Avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/DropdownMenu/DropdownMenu";

export default function StorefrontLayout({ children, user = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!user;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mr-4 md:hidden bg-transparent border border-gray-300 rounded-md p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </button>

          {/* Logo */}
          <Link href={route("home")} className="flex items-center gap-2 font-semibold">
            <span className="text-xl">TutorMatch</span>
            <span className="text-sm text-gray-500">Chicago</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="mx-6 hidden items-center space-x-4 md:flex md:space-x-6 lg:space-x-8">
            <Link href={route("home")} className="text-sm font-medium hover:text-blue-600">
              Home
            </Link>
            <Link href={route("storefront.teachers")} className="text-sm font-medium hover:text-blue-600">
              Find Teachers
            </Link>
            <Link href={route("storefront.subjects")} className="text-sm font-medium hover:text-blue-600">
              Subjects
            </Link>
            <Link href={route("storefront.about")} className="text-sm font-medium hover:text-blue-600">
              About Us
            </Link>
            <Link href={route("storefront.contact")} className="text-sm font-medium hover:text-blue-600">
              Contact
            </Link>
          </nav>

          {/* Right side - Search, Notifications, User */}
          <div className="ml-auto flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers, subjects..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_photo_url} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-gray-500">{user.email}</p>
                      {isAdmin(user.role_id) && (
                        <p className="text-xs text-indigo-600 font-medium">
                          {user.role_id === 1 ? 'Super Admin' : 'Tutor'}
                        </p>
                      )}
                                             <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs text-gray-500">
                           {user.timezone || "America/Chicago"}
                         </span>
                         <a
                           href={route("home")}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-xs text-blue-600 hover:text-blue-800 underline"
                           title="Open storefront in new tab"
                         >
                           🏠 Storefront
                         </a>
                       </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={route("storefront.bookings")}>My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={route("storefront.favorites")}>Favorites</Link>
                  </DropdownMenuItem>
                  
                  {/* Show Admin Panel link for tutors and super admins */}
                  {isAdmin(user.role_id) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={route("admin.dashboard")} className="text-indigo-600 font-medium">
                          🎛️ Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={route("logout")} method="post" as="button">
                      Log out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={route("login")}>
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href={route("register")}>
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="flex flex-col space-y-2 p-4">
              <Link
                href={route("home")}
                className="px-3 py-2 text-sm font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href={route("storefront.teachers")}
                className="px-3 py-2 text-sm font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Teachers
              </Link>
              <Link
                href={route("storefront.subjects")}
                className="px-3 py-2 text-sm font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Subjects
              </Link>
              <Link
                href={route("storefront.about")}
                className="px-3 py-2 text-sm font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href={route("storefront.contact")}
                className="px-3 py-2 text-sm font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teachers, subjects..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Auth links in mobile menu */}
              {!isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link
                    href={route("login")}
                    className="px-3 py-2 text-sm font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href={route("register")}
                    className="px-3 py-2 text-sm font-medium hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TutorMatch Chicago</h3>
              <p className="text-gray-600 text-sm">
                Connecting students with expert tutors for personalized learning experiences.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={route("storefront.teachers")} className="text-gray-600 hover:text-blue-600">Find Teachers</Link></li>
                <li><Link href={route("storefront.subjects")} className="text-gray-600 hover:text-blue-600">Subjects</Link></li>
                <li><Link href={route("storefront.about")} className="text-gray-600 hover:text-blue-600">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={route("storefront.contact")} className="text-gray-600 hover:text-blue-600">Contact</Link></li>
                <li><Link href={route("storefront.faq")} className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
                <li><Link href={route("storefront.help")} className="text-gray-600 hover:text-blue-600">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={route("storefront.privacy")} className="text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href={route("storefront.terms")} className="text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 TutorMatch Chicago. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
