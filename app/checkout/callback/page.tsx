'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Package, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface PaymentStatus {
  status: 'loading' | 'success' | 'error' | 'pending';
  message: string;
  orderTrackingId?: string;
  amount?: number;
}

export default function CheckoutCallback() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'loading',
    message: 'Verifying your payment...'
  });

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');

    if (orderTrackingId) {
      verifyPaymentStatus(orderTrackingId);
    } else {
      setPaymentStatus({
        status: 'error',
        message: 'No order tracking information found.'
      });
    }
  }, [searchParams]);

  const verifyPaymentStatus = async (orderTrackingId: string) => {
    try {
      // Poll for status (Pesapal might take a few seconds to update)
      const pollStatus = async (attempts = 0): Promise<void> => {
        if (attempts >= 10) { // Max 10 attempts (30 seconds)
          setPaymentStatus({
            status: 'pending',
            message: 'Payment status is taking longer than expected. We will notify you via email once confirmed.'
          });
          return;
        }

        const response = await fetch(`/api/orders/${orderTrackingId}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to verify payment status');
        }

        const data = await response.json();

        if (data.payment_status_description === 'Completed') {
          setPaymentStatus({
            status: 'success',
            message: 'Your payment was processed successfully!',
            orderTrackingId,
            amount: data.amount
          });
        } else if (data.payment_status_description === 'Failed') {
          setPaymentStatus({
            status: 'error',
            message: 'Payment processing failed. Please try again.',
            orderTrackingId
          });
        } else {
          // Still processing, poll again after 3 seconds
          setTimeout(() => pollStatus(attempts + 1), 3000);
          setPaymentStatus({
            status: 'loading',
            message: 'Payment is being processed...'
          });
        }
      };

      await pollStatus();
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus({
        status: 'error',
        message: 'Error verifying payment status. Please check your email for confirmation or contact support.'
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Package className="w-16 h-16 text-orange-500" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {paymentStatus.status === 'loading' && 'Processing Payment'}
            {paymentStatus.status === 'success' && 'Payment Successful!'}
            {paymentStatus.status === 'error' && 'Payment Failed'}
            {paymentStatus.status === 'pending' && 'Payment Processing'}
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {paymentStatus.message}
          </p>

          {paymentStatus.orderTrackingId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order Reference</p>
              <p className="font-mono text-sm font-semibold text-gray-900">
                {paymentStatus.orderTrackingId}
              </p>
            </div>
          )}

          {paymentStatus.amount && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-600">Amount Paid</p>
              <p className="text-xl font-bold text-green-900">
                KSh {paymentStatus.amount.toLocaleString()}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {paymentStatus.status === 'success' && (
              <>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/orders">
                    View Your Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/store">
                    Continue Shopping
                  </Link>
                </Button>
              </>
            )}
            
            {paymentStatus.status === 'error' && (
              <>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/cart">
                    Try Again
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/store">
                    Continue Shopping
                  </Link>
                </Button>
              </>
            )}
            
            {paymentStatus.status === 'pending' && (
              <>
                <div className="flex items-center justify-center text-orange-600 mb-4">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="text-sm">We'll email you confirmation</span>
                </div>
                <Button asChild className="w-full">
                  <Link href="/store">
                    Continue Shopping
                  </Link>
                </Button>
              </>
            )}
          </div>

          {(paymentStatus.status === 'error' || paymentStatus.status === 'pending') && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@yourstore.com" className="font-semibold hover:underline">
                  support@yourstore.com
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}