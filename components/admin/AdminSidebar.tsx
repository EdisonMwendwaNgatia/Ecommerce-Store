// components/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  LogOut 
} from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      console.log('Attempting to sign out...')
      
      await signOut()
      console.log('Sign out successful')
      
      // Force a hard redirect to ensure complete sign out
      window.location.href = '/auth/login'
      
    } catch (error) {
      console.error('Error during sign out:', error)
      // Fallback: try direct Supabase sign out
      try {
        const { createClient } = await import('@/lib/supabaseClient')
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/auth/login'
      } catch (fallbackError) {
        console.error('Fallback sign out also failed:', fallbackError)
        // Last resort - hard redirect
        window.location.href = '/auth/login'
      }
    } finally {
      setIsSigningOut(false)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-sm text-gray-600 mt-1">Store Management</p>
      </div>
      
      <nav className="flex-1 mt-6">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          onClick={handleSignOut}
          variant="outline"
          disabled={isSigningOut}
          className="flex items-center w-full justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  )
}