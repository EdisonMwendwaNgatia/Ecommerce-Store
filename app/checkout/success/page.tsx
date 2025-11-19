'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');

  useEffect(() => {
    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        if (orderTrackingId) {
          // You would typically verify with your backend
          // const response = await fetch(`/api/orders/status?orderId=${orderTrackingId}`);
          // const data = await response.json();
          
          // For now, we'll simulate a successful payment
          setTimeout(() => {
            setStatus('success');
            setOrderDetails({
              orderId: orderTrackingId,
              amount: '2,500', // This would come from your API
              items: 3 // This would come from your API
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('failed');
      }
    };

    checkPaymentStatus();
  }, [orderTrackingId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-blue-600 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Your Order</h1>
              <p className="text-gray-600 mb-8 text-lg">
                We're verifying your payment. This may take a few moments...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
              <p className="text-gray-600 mb-6 text-lg">
                Thank you for your purchase. Your order has been confirmed.
              </p>
              
              {orderDetails && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">KSh {orderDetails.amount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold">{orderDetails.items} items</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Link href="/store" className="block">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Package className="mr-2 h-5 w-5" />
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/orders" className="block">
                  <Button variant="outline" className="w-full">
                    View My Orders
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
              <p className="text-gray-600 mb-8 text-lg">
                There was an issue processing your payment. Please try again.
              </p>
              <div className="space-y-4">
                <Link href="/cart" className="block">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    Try Again
                  </Button>
                </Link>
                <Link href="/store" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}