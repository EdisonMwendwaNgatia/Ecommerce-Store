// app/order/status/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Clock, ShoppingBag, Truck, Package, MapPin, User, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

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
  updated_at: string
}

export default function OrderStatusPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (orderId && user) {
      fetchOrderStatus(orderId)
    }
  }, [orderId, user])

  const fetchOrderStatus = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!order) return <Clock className="h-16 w-16 text-yellow-500" />
    
    switch (order.order_status) {
      case 'delivered':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-16 w-16 text-red-500" />
      case 'shipped':
        return <Truck className="h-16 w-16 text-blue-500" />
      case 'confirmed':
        return <Package className="h-16 w-16 text-purple-500" />
      default:
        return <Clock className="h-16 w-16 text-yellow-500" />
    }
  }

  const getStatusMessage = () => {
    if (!order) {
      return {
        title: 'Order Not Found',
        message: 'We could not find your order. Please check your order ID.',
        buttonText: 'Continue Shopping'
      }
    }

    switch (order.order_status) {
      case 'delivered':
        return {
          title: 'Order Delivered!',
          message: 'Your order has been successfully delivered. Thank you for shopping with us!',
          buttonText: 'Continue Shopping'
        }
      case 'shipped':
        return {
          title: 'Order Shipped!',
          message: 'Your order is on the way. You can track your package with the provided tracking information.',
          buttonText: 'Continue Shopping'
        }
      case 'confirmed':
        return {
          title: 'Order Confirmed!',
          message: 'Your order has been confirmed and is being processed for shipping.',
          buttonText: 'Continue Shopping'
        }
      case 'cancelled':
        return {
          title: 'Order Cancelled',
          message: 'This order has been cancelled. Please contact support if you have any questions.',
          buttonText: 'Continue Shopping'
        }
      default:
        return {
          title: 'Processing Order',
          message: 'Your order is being processed. We will update you once it is confirmed.',
          buttonText: 'Continue Shopping'
        }
    }
  }

  const getProgressSteps = () => {
    if (!order) return []
    
    const steps = [
      { status: 'processing', label: 'Processing', description: 'Order received' },
      { status: 'confirmed', label: 'Confirmed', description: 'Order confirmed' },
      { status: 'shipped', label: 'Shipped', description: 'On the way' },
      { status: 'delivered', label: 'Delivered', description: 'Order complete' }
    ]
    
    const currentIndex = steps.findIndex(step => step.status === order.order_status)
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    )
  }

  const status = getStatusMessage()
  const progressSteps = getProgressSteps()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{status.title}</h1>
                <p className="text-blue-100">{status.message}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Order Number</p>
                <p className="text-lg font-mono font-bold">{order?.order_number}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress Tracker */}
            {order && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Progress</h3>
                <div className="flex justify-between relative">
                  {progressSteps.map((step, index) => (
                    <div key={step.status} className="flex flex-col items-center flex-1 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : step.current
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                      {index < progressSteps.length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} style={{ zIndex: 1 }}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Details */}
            {order && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {order.customer_info?.firstName} {order.customer_info?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </p>
                      <p className="font-medium">{order.customer_info?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone
                      </p>
                      <p className="font-medium">{order.customer_info?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Delivery Address
                      </p>
                      <p className="font-medium">{order.customer_info?.address}</p>
                      <p className="text-sm text-gray-600">{order.delivery_info?.county}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h3>
                  <div className="space-y-3">
                    {order.cart_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.images?.[0] || '/images/placeholder-product.jpg'}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900">
                          KSh {(item.product_price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>KSh {order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span>KSh {order.delivery_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>KSh {order.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Link href="/store" className="flex-1">
                <Button size="lg" className="w-full">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {status.buttonText}
                </Button>
              </Link>
              
              <Link href="/orders" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Order History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}