// app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './auth-provider'
import { CartProvider } from '@/hooks/useCart' 
import { WishlistProvider } from '@/hooks/useWishlist'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TVee Store - Your Favorite Cosmetics',
  description: 'Discover premium cosmetics and beauty products at amazing prices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider> 
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}