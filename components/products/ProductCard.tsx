'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useWishlist } from '@/hooks/useWishlist'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const isWishlisted = isInWishlist(product.id)

  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/images/placeholder-product.jpg'

  const hasDiscount = product.original_price && product.original_price > product.price

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
   
    if (!user) {
      window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname)
      return
    }
    
    addToCart(product, 1)
    console.log('Added to cart:', product.name)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname)
      return
    }

    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <Link href={`/store/${product.id}`}>
      <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageError ? '/images/placeholder-product.jpg' : mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {hasDiscount && (
              <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                Save {Math.round(((product.original_price! - product.price) / product.original_price!) * 100)}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-blue-500 text-white px-2 py-1 text-xs font-medium rounded">
                Featured
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 shadow-sm ${
                isWishlisted 
                  ? 'bg-red-50 hover:bg-red-100' 
                  : 'bg-white hover:bg-gray-100'
              }`}
              onClick={handleWishlist}
            >
              <Heart 
                className={`h-4 w-4 ${
                  isWishlisted 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600'
                }`} 
              />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              className="w-full bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
              size="sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">(42)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                Ksh{product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  Ksh{product.original_price!.toFixed(2)}
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
    </Link>
  )
}