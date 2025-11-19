'use client'

import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoading } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})

  const handleAddToCart = (product: any) => {
    if (!user) {
      window.location.href = '/login?callbackUrl=/wishlist'
      return
    }
    addToCart(product, 1)
  }

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
    <Navbar/>
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {wishlistItems.length} items
            </span>
          )}
        </div>

        {wishlistItems.length > 0 && (
          <Button
            variant="outline"
            onClick={clearWishlist}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding products you love to your wishlist!</p>
          <Link href="/store">
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={imageErrors[product.id] ? '/images/placeholder-product.jpg' : (product.images?.[0] || '/images/placeholder-product.jpg')}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(product.id)}
                />
                
                {/* Remove from Wishlist Button */}
                <div className="absolute top-3 right-3">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white hover:bg-red-50 shadow-sm text-red-600 hover:text-red-700"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.inventory === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/store/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    product.inventory > 10 
                      ? 'bg-green-100 text-green-800'
                      : product.inventory > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inventory > 10 ? 'In Stock' : product.inventory > 0 ? 'Low Stock' : 'Out of Stock'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <Footer/>
    </div>
  )
}