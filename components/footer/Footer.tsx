import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Heart, Leaf, Sprout,Truck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Tivee Organics</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Pure, natural beauty from nature's finest ingredients. Cruelty-free, organic cosmetics for your radiant glow.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/store?category=skincare" className="text-gray-400 hover:text-green-300 transition-colors flex items-center">
                  <Sprout className="h-3 w-3 mr-2" />
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/store?category=makeup" className="text-gray-400 hover:text-green-300 transition-colors flex items-center">
                  <Heart className="h-3 w-3 mr-2" />
                  Makeup
                </Link>
              </li>
              <li>
                <Link href="/store?category=haircare" className="text-gray-400 hover:text-green-300 transition-colors">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link href="/store?category=bodycare" className="text-gray-400 hover:text-green-300 transition-colors">
                  Body Care
                </Link>
              </li>
              <li>
                <Link href="/store?category=nailcare" className="text-gray-400 hover:text-green-300 transition-colors">
                  Nail Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Care</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors">
                  Our Ingredients
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-300 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Join Our Community</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get beauty tips, exclusive offers, and 15% off your first order.
            </p>
            <form className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r-lg transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </form>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-400 text-sm">
                <Leaf className="h-4 w-4 mr-2 text-green-400" />
                100% Natural Ingredients
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Heart className="h-4 w-4 mr-2 text-green-400" />
                Cruelty Free & Vegan
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Sprout className="h-4 w-4 mr-2 text-green-400" />
                Eco-Friendly Packaging
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="text-gray-400">
              <div className="flex justify-center mb-2">
                <Truck className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs">On orders over $50</p>
            </div>
            <div className="text-gray-400">
              <div className="flex justify-center mb-2">
                <Leaf className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm font-medium">Natural</p>
              <p className="text-xs">Organic Ingredients</p>
            </div>
            <div className="text-gray-400">
              <div className="flex justify-center mb-2">
                <Heart className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm font-medium">Cruelty Free</p>
              <p className="text-xs">Never Tested on Animals</p>
            </div>
            <div className="text-gray-400">
              <div className="flex justify-center mb-2">
                <Sprout className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm font-medium">Eco Friendly</p>
              <p className="text-xs">Sustainable Packaging</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Tivee Organics. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/" className="text-gray-400 hover:text-green-300 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-gray-400 hover:text-green-300 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="text-gray-400 hover:text-green-300 text-sm transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}