'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, ArrowLeft } from 'lucide-react'

export default function EmptyCartState() {
  return (
    // Note: Removed min-h-screen and bg-gray-50 to integrate seamlessly if Navbar/Footer are used,
    // but kept them for a standalone component presentation.
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center py-16"> 
          
          {/* Main Icon (Styled like empty wishlist icon) */}
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />

          {/* Message */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet. Time to start shopping!
          </p>

          {/* Primary CTA (Styled like empty wishlist CTA) */}
          <Link href="/store">
            <Button className='bg-black hover:bg-gray-800'>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back to Store
            </Button>
          </Link>
          
          {/* Optional: Quick Categories (Retained from original cart for utility) */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">Popular Categories</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/store?category=makeup">
                <Button variant="outline" size="sm">
                  Makeup
                </Button>
              </Link>
              <Link href="/store?category=haircare">
                <Button variant="outline" size="sm">
                  Haircare
                </Button>
              </Link>
              <Link href="/store?category=fragrance">
                <Button variant="outline" size="sm">
                  Fragrance
                </Button>
              </Link>
              <Link href="/store?category=bodycare">
                <Button variant="outline" size="sm">
                  Body Care
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}