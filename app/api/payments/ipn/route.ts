import { NextRequest, NextResponse } from 'next/server';
import { pesapal } from '@/lib/supabase/pesapal';

export async function POST(request: NextRequest) {
  try {
    const ipnData = await request.json();
    
    console.log('📨 IPN Received (Ecommerce):', {
      OrderTrackingId: ipnData.OrderTrackingId,
      OrderMerchantReference: ipnData.OrderMerchantReference,
      Status: ipnData.Status,
      Type: ipnData.Type
    });

    // Verify the payment status with Pesapal
    const orderStatus = await pesapal.getOrderStatus(ipnData.OrderTrackingId);

    console.log('🔍 Order status from Pesapal:', orderStatus);

    // Handle different types of payments (donation vs ecommerce)
    const url = new URL(request.url);
    const isEcommerce = url.searchParams.get('type') === 'ecommerce';

    if (isEcommerce) {
      // Update ecommerce order in database
      console.log('🛒 Processing ecommerce order update');
      
      // Here you would update your ecommerce order in the database
      // await updateOrderStatus({
      //   pesapalOrderId: ipnData.OrderTrackingId,
      //   status: ipnData.Status,
      //   pesapalData: orderStatus
      // });

      // Example response for ecommerce order
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pesapalOrderId: ipnData.OrderTrackingId,
          status: ipnData.Status, // 'COMPLETED', 'FAILED', etc.
          pesapalData: orderStatus // Full Pesapal response
        }),
      });

      if (updateResponse.ok) {
        console.log('✅ Ecommerce order status updated successfully');
      } else {
        console.error('❌ Failed to update ecommerce order status');
      }
    } else {
      // Handle donation (your existing logic)
      console.log('💰 Processing donation update');
      
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/donations`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationId: ipnData.OrderMerchantReference,
          status: ipnData.Status,
          pesapalData: orderStatus
        }),
      });

      const updateResult = await updateResponse.json();

      if (!updateResult.success) {
        console.error('❌ Failed to update donation status:', updateResult.error);
      } else {
        console.log('✅ Donation status updated successfully');
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'IPN processed successfully',
      type: isEcommerce ? 'ecommerce' : 'donation'
    });

  } catch (error: any) {
    console.error('💥 IPN error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'IPN processing failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}