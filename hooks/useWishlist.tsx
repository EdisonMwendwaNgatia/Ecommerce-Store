'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Product } from '@/types/product'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabaseClient'

interface WishlistContextType {
  wishlistItems: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  // Load wishlist from database
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlistItems([])
        setIsLoading(false)
        return
      }

      try {
        // First get the wishlist items with product IDs
        const { data: wishlistData, error } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', user.id)

        if (error) throw error

        if (!wishlistData || wishlistData.length === 0) {
          setWishlistItems([])
          setIsLoading(false)
          return
        }

        // Then fetch the actual products
        const productIds = wishlistData.map(item => item.product_id)
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)

        if (productsError) throw productsError

        // Type assertion for products data
        const products = (productsData || []) as Product[]
        setWishlistItems(products)
      } catch (error) {
        console.error('Error loading wishlist:', error)
        setWishlistItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [user, supabase])

  const addToWishlist = async (product: Product) => {
    if (!user) {
      window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname)
      return
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: product.id
        })

      if (error) {
        // If it's a unique constraint violation, the item is already in wishlist
        if (error.code === '23505') {
          console.log('Product already in wishlist')
          return
        }
        throw error
      }

      setWishlistItems(prev => [...prev, product])
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error

      setWishlistItems(prev => prev.filter(item => item.id !== productId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const clearWishlist = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setWishlistItems([])
    } catch (error) {
      console.error('Error clearing wishlist:', error)
    }
  }

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}