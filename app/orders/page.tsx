// app/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Eye, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/navbar/Navbar' 
import Footer from '@/components/footer/Footer'

interface Order {
  id: string
  order_number: string
  customer_info: any
  cart_items: any[]
  delivery_info: any
  subtotal: number
  delivery_cost: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled'
  order_status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  pesapal_transaction_id?: string
  created_at: string
}

export default function UserOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .not('pesapal_transaction_id', 'is', null) // Only fetch orders with pesapal_transaction_id
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />
      case 'shipped': return <Package className="h-5 w-5 text-blue-500" />
      default: return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      case 'shipped': return 'text-blue-600 bg-blue-50'
      case 'confirmed': return 'text-purple-600 bg-purple-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage your paid orders</p>
              <p className="text-sm text-gray-500 mt-1">
                Showing {orders.length} completed orders
              </p>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(order.created_at).toLocaleDateString()} • {order.cart_items.length} items
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      {getStatusIcon(order.order_status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        KSh {order.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery To</p>
                      <p className="text-gray-900">{order.delivery_info?.county}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className={`font-medium ${
                        order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.payment_status}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {order.cart_items.slice(0, 2).map(item => item.product_name).join(', ')}
                      {order.cart_items.length > 2 && ` and ${order.cart_items.length - 2} more`}
                    </div>
                    <Link href={`/order/status?orderId=${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed orders yet</h3>
                  <p className="text-gray-600 mb-6">Your paid orders will appear here once you complete a purchase</p>
                  <div className="space-y-3">
                    <Link href="/store">
                      <Button className="w-full">
                        Start Shopping
                      </Button>
                    </Link>
                    <Link href="/cart">
                      <Button variant="outline" className="w-full">
                        View Cart
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}