'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, CreditCard, Loader2, User, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import { createClient } from '@/lib/supabaseClient'
import EmptyCartState from '@/components/cart/EmptyCartState'

// Kenyan counties and their distance from Nairobi (for delivery calculation)
const KENYAN_COUNTIES = [
  { name: 'Nairobi (Store Pickup)', distance: 0, deliveryBase: 0 },
  { name: 'Kiambu', distance: 20, deliveryBase: 200 },
  { name: 'Machakos', distance: 60, deliveryBase: 400 },
  { name: 'Kajiado', distance: 80, deliveryBase: 500 },
  { name: 'Nakuru', distance: 160, deliveryBase: 800 },
  { name: 'Mombasa', distance: 485, deliveryBase: 1500 },
  { name: 'Kisumu', distance: 345, deliveryBase: 1200 },
  { name: 'Eldoret', distance: 310, deliveryBase: 1100 },
  { name: 'Thika', distance: 45, deliveryBase: 300 },
  { name: 'Nyeri', distance: 150, deliveryBase: 700 },
]

const DELIVERY_OPTIONS = [
  { name: 'Standard (5-7 days)', multiplier: 1, description: 'Most economical' },
  { name: 'Express (2-3 days)', multiplier: 1.5, description: 'Faster delivery' },
  { name: 'Overnight (Next day)', multiplier: 2, description: 'Priority shipping' }
]

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export default function CartPage() {
  const { user } = useAuth()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const [selectedCounty, setSelectedCounty] = useState(KENYAN_COUNTIES[0])
  const [selectedDelivery, setSelectedDelivery] = useState(DELIVERY_OPTIONS[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setCustomerInfo(prev => ({
            ...prev,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            phone: data.phone || '',
            address: data.address || ''
          }))

          // Auto-select county from profile if available
          if (data.county) {
            const profileCounty = KENYAN_COUNTIES.find(c =>
              c.name.toLowerCase().includes(data.county.toLowerCase()) ||
              data.county.toLowerCase().includes(c.name.toLowerCase())
            )
            if (profileCounty) {
              setSelectedCounty(profileCounty)
            }
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [user, supabase])

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your shopping cart and continue with your purchase.</p>
          <Link href="/login" className="block w-full">
            <Button size="lg" className="w-full">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <EmptyCartState />
        <Footer />
      </>
    )
  }

  const subtotal = getCartTotal()
  const deliveryCost = subtotal > 5000 ? 0 : selectedCounty.deliveryBase * selectedDelivery.multiplier
  const total = subtotal + deliveryCost

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateCustomerInfo = (): boolean => {
    const { firstName, lastName, email, phone, address } = customerInfo

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in all customer information fields')
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address')
      return false
    }

    // Basic phone validation for Kenya
    const phoneRegex = /^(?:254|\+254|0)?(7[0-9]{8})$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      alert('Please enter a valid Kenyan phone number')
      return false
    }

    return true
  }

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (!validateCustomerInfo()) {
      return
    }

    setIsProcessing(true)
    let orderData: any = null; // Store order data for cleanup if needed

    try {
      const deliveryInfo = {
        county: selectedCounty.name,
        address: customerInfo.address,
        distance: selectedCounty.distance,
        deliveryOption: selectedDelivery.name,
        customer: customerInfo,
        deliveryCost: deliveryCost
      }

      // Generate order number
      const orderNumber = generateOrderNumber()

      // First, save the order to Supabase with pending status
      const { data: savedOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          customer_info: customerInfo,
          cart_items: cartItems.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            product_price: item.product.price,
            quantity: item.quantity,
            images: item.product.images,
            category: item.product.category,
            item_total: item.product.price * item.quantity
          })),
          delivery_info: deliveryInfo,
          subtotal: subtotal,
          delivery_cost: deliveryCost,
          total_amount: total,
          payment_status: 'pending',
          order_status: 'processing'
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error saving order:', orderError)
        throw new Error('Failed to create order. Please try again.')
      }

      orderData = savedOrder; // Store for potential cleanup
      console.log('Order saved successfully:', orderData)

      // Then proceed with payment
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.id,
          orderNumber: orderNumber,
          cartItems,
          deliveryInfo: deliveryInfo,
          totalAmount: total,
          customerInfo: {
            ...customerInfo,
            userId: user.id
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Delete the order if payment initiation fails
        await supabase
          .from('orders')
          .delete()
          .eq('id', orderData.id)

        throw new Error(errorData.error || 'Checkout failed')
      }

      const data = await response.json()

      if (!data.success || !data.data?.redirect_url) {
        // Delete the order if no redirect URL
        await supabase
          .from('orders')
          .delete()
          .eq('id', orderData.id)

        throw new Error('No redirect URL received from payment gateway')
      }

      // Redirect to PesaPal payment page
      window.location.href = data.data.redirect_url

    } catch (error) {
      console.error('Checkout error:', error)

      // If we have order data but an error occurred, try to clean up
      if (orderData) {
        try {
          await supabase
            .from('orders')
            .delete()
            .eq('id', orderData.id)
        } catch (cleanupError) {
          console.error('Failed to clean up order:', cleanupError)
        }
      }

      alert(error instanceof Error ? error.message : 'Failed to process checkout. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h2>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Update Profile
                  </Button>
                </Link>
              </div>

              {isLoadingProfile ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading your profile...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="07XX XXX XXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Delivery Address *
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-xl shadow-sm border">
              {cartItems.map((item, index) => (
                <div key={item.product.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || '/images/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {item.product.name}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1 capitalize">{item.product.category}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-3">
                            KSh {item.product.price.toLocaleString()}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">Quantity:</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 rounded-full"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="w-12 text-center font-semibold text-gray-900 bg-gray-50 py-1 rounded-md">
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-full"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">Item Total</p>
                          <p className="text-xl font-bold text-gray-900">
                            KSh {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border p-4 text-center">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Free Shipping</h4>
                <p className="text-sm text-gray-600">On orders over KSh 5,000</p>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Secure Payment</h4>
                <p className="text-sm text-gray-600">100% secure payment</p>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Easy Returns</h4>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Order Summary</h2>

              <div className="space-y-4">
                {/* Delivery Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Delivery County
                  </label>
                  <select
                    value={selectedCounty.name}
                    onChange={(e) => {
                      const county = KENYAN_COUNTIES.find(c => c.name === e.target.value)
                      if (county) setSelectedCounty(county)
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {KENYAN_COUNTIES.map((county) => (
                      <option key={county.name} value={county.name}>
                        {county.name} {county.distance > 0 && `(${county.distance}km)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Speed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Delivery Speed
                  </label>
                  <div className="space-y-2">
                    {DELIVERY_OPTIONS.map((option) => (
                      <label key={option.name} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          value={option.name}
                          checked={selectedDelivery.name === option.name}
                          onChange={() => setSelectedDelivery(option)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{option.name}</span>
                            <span className="text-sm font-semibold text-blue-600">
                              ×{option.multiplier}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-semibold text-gray-900">KSh {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery</span>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {subtotal > 5000 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `KSh ${deliveryCost.toLocaleString()}`
                        )}
                      </span>
                      {selectedCounty.distance > 0 && subtotal <= 5000 && (
                        <p className="text-xs text-gray-500">
                          {selectedCounty.distance}km × {selectedDelivery.multiplier}x
                        </p>
                      )}
                    </div>
                  </div>

                  {subtotal > 5000 && (
                    <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg">
                      <span className="font-medium">Free Shipping Applied!</span>
                      <span className="font-semibold">-KSh {(selectedCounty.deliveryBase * selectedDelivery.multiplier).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-lg font-bold pt-3 border-t">
                    <span>Total Amount</span>
                    <span className="text-2xl text-blue-600">KSh {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                    onClick={handleCheckout}
                    disabled={isProcessing || cartItems.length === 0 || isLoadingProfile}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </Button>

                  <Link href="/store">
                    <Button variant="outline" className="w-full py-3">
                      Continue Shopping
                    </Button>
                  </Link>

                  <Link href="/orders">
                    <Button variant="outline" className="w-full py-3 mt-3">
                      Track your Orders
                    </Button>
                  </Link>
                </div>

                {/* Payment Methods & Security Notice */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">We Accept:</p>
                  <div className="flex justify-center space-x-4 mb-3">
                    <div className="bg-green-100 px-3 py-1 rounded-lg">
                      <span className="text-green-800 font-semibold text-sm">M-Pesa</span>
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded-lg">
                      <span className="text-blue-800 font-semibold text-sm">Visa</span>
                    </div>
                    <div className="bg-red-100 px-3 py-1 rounded-lg">
                      <span className="text-red-800 font-semibold text-sm">Mastercard</span>
                    </div>
                    <div className="bg-yellow-100 px-3 py-1 rounded-lg">
                      <span className="text-yellow-800 font-semibold text-sm">Airtel Money</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    🔒 Powered by PesaPal - Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Secure Checkout
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ SSL Encrypted Connection</li>
                <li>✓ PCI DSS Compliant</li>
                <li>✓ No card details stored</li>
                <li>✓ Instant payment confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}