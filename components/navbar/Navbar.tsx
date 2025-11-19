'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { Button } from '@/components/ui/Button'
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  LogOut,
  ChevronDown,
  Settings,
  Package,
  Heart
} from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'
import Logo from '@/images/logo/logo.jpg'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const { cartItems } = useCart()
  const { wishlistItems } = useWishlist()
  const pathname = usePathname()
  const supabase = createClient()
  const [userRole, setUserRole] = useState<string | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const wishlistItemsCount = wishlistItems.length

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut()
      window.location.href = '/'
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch role for current user so we can distinguish admin vs customer
  useEffect(() => {
    let mounted = true
    const fetchRole = async () => {
      if (!user) {
        if (mounted) setUserRole(null)
        return
      }

      try {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (mounted) setUserRole(data?.role ?? null)
      } catch (err) {
        if (mounted) setUserRole(null)
      }
    }

    fetchRole()

    return () => {
      mounted = false
    }
  }, [user, supabase])

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg"><img src={Logo.src} alt="TVee Store Logo" className="w-full h-full object-contain" /></div>
            <span className="text-xl font-bold text-gray-900">TVee Store</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/store" className="text-gray-700 hover:text-green-600 transition-colors">
              Shop
            </Link>
            <Link href="/store?category=makeup" className="text-gray-700 hover:text-green-600 transition-colors">
              Makeup
            </Link>
            <Link href="/store?category=haircare" className="text-gray-700 hover:text-green-600 transition-colors">
              Haircare
            </Link>
            <Link href="/store?category=fragrance" className="text-gray-700 hover:text-green-600 transition-colors">
              Fragrance
            </Link>
            <Link href="/store?category=bodycare" className="text-gray-700 hover:text-green-600 transition-colors">
              BodyCare
            </Link>
            <Link href="/store?category=nailcare" className="text-gray-700 hover:text-green-600 transition-colors">
              Nailcare
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist Icon - Only show for customers */}
            {user && userRole !== 'admin' && (
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Wishlist Icon for non-logged in users */}
            {!user && (
              <Link href="/auth/login?callbackUrl=/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Cart Icon - Only show for customers */}
            {user && userRole !== 'admin' && (
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Cart Icon for non-logged in users */}
            {!user && (
              <Link href="/auth/login?callbackUrl=/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-32 truncate">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userRole === 'admin' ? 'Administrator' : 'Customer'}
                      </p>
                    </div>

                    {/* Admin Links */}
                    {userRole === 'admin' && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/products"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Manage Products</span>
                        </Link>
                      </>
                    )}

                    {/* Customer Links */}
                    {userRole !== 'admin' && (
                      <>
                        <Link
                          href="/wishlist"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          <span>My Wishlist {wishlistItemsCount > 0 && `(${wishlistItemsCount})`}</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </Link>
                      </>
                    )}

                    {/* Common Links */}
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/store" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                href="/store?category=makeup" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Makeup
              </Link>
              <Link 
                href="/store?category=haircare" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Haircare
              </Link>
              <Link 
                href="/store?category=fragrance" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Fragrance
              </Link>
              <Link 
                href="/store?category=bodycare" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                BodyCare
              </Link>
              <Link 
                href="/store?category=nailcare" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Nailcare
              </Link>
              
              {/* Wishlist for mobile */}
              <div className="pt-2">
                {user && userRole !== 'admin' ? (
                  <Link 
                    href="/wishlist" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist {wishlistItemsCount > 0 && `(${wishlistItemsCount})`}</span>
                  </Link>
                ) : (
                  <Link 
                    href="/auth/login?callbackUrl=/wishlist" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                )}
              </div>
              
              {/* Cart for mobile */}
              <div className="pt-2">
                {user && userRole !== 'admin' ? (
                  <Link 
                    href="/cart" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart {cartItemsCount > 0 && `(${cartItemsCount})`}</span>
                  </Link>
                ) : (
                  <Link 
                    href="/auth/login?callbackUrl=/cart" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart</span>
                  </Link>
                )}
              </div>
              
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="pb-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userRole === 'admin' ? 'Administrator' : 'Customer'}
                      </p>
                    </div>

                    {/* Admin Links */}
                    {userRole === 'admin' && (
                      <>
                        <Link 
                          href="/admin" 
                          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link 
                          href="/admin/products" 
                          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Manage Products</span>
                        </Link>
                      </>
                    )}

                    {/* Customer Links */}
                    {userRole !== 'admin' && (
                      <>
                        <Link 
                          href="/orders" 
                          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                        <Link 
                          href="/profile" 
                          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </Link>
                      </>
                    )}

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Link 
                      href="/auth/login" 
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}