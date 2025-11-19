import { NextRequest, NextResponse } from 'next/server';
import { pesapal } from '@/lib/supabase/pesapal';
import { createClient } from '@/lib/supabaseClient';

// Generate order number function
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const { orderId, cartItems, deliveryInfo, totalAmount, customerInfo } = await request.json();

    // Validate required fields
    if (!cartItems || !cartItems.length || !totalAmount || !customerInfo) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: cart items, total amount, and customer info are required' 
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, address } = customerInfo;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing customer information' 
        },
        { status: 400 }
      );
    }

    console.log('🛒 Creating ecommerce order for:', {
      email,
      totalAmount,
      itemsCount: cartItems.length
    });

    // Generate order description from cart items
    const itemNames = cartItems.map((item: any) => item.product.name).join(', ');
    const description = `Ecommerce Purchase: ${itemNames.substring(0, 100)}${itemNames.length > 100 ? '...' : ''}`;

    // First, save the order to Supabase with pending status
    const orderNumber = generateOrderNumber();
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: customerInfo.userId, // Make sure to pass userId from the client
        order_number: orderNumber,
        customer_info: customerInfo,
        cart_items: cartItems.map((item: any) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          quantity: item.quantity,
          images: item.product.images,
          category: item.product.category,
          item_total: item.product.price * item.quantity
        })),
        delivery_info: deliveryInfo,
        subtotal: parseFloat(totalAmount) - (deliveryInfo?.deliveryCost || 0),
        delivery_cost: deliveryInfo?.deliveryCost || 0,
        total_amount: parseFloat(totalAmount),
        payment_status: 'pending',
        order_status: 'processing'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Database order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('✅ Order saved to database:', {
      order_id: orderData.id,
      order_number: orderData.order_number
    });

    // Proceed with PesaPal payment integration (your existing code)
    const order = {
      currency: 'KES',
      amount: parseFloat(totalAmount),
      description: description,
      callback_url: `${process.env.PESAPAL_CALLBACK_URL}?type=ecommerce&order_id=${orderData.id}`,
      notification_id: process.env.PESAPAL_IPN_URL!,
      billing_address: {
        email_address: email,
        phone_number: phone,
        country_code: 'KE',
        first_name: firstName,
        last_name: lastName,
      },
    };

    const paymentResponse = await pesapal.submitOrder(order);

    console.log('✅ Ecommerce order created:', {
      order_tracking_id: paymentResponse.order_tracking_id,
      redirect_url: paymentResponse.redirect_url ? 'Yes' : 'No',
      db_order_id: orderData.id
    });

    // Update the order with PesaPal tracking ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        pesapal_transaction_id: paymentResponse.order_tracking_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderData.id);

    if (updateError) {
      console.error('❌ Failed to update order with PesaPal ID:', updateError);
      // Don't throw error here as the payment was successful
    }

    return NextResponse.json({
      success: true,
      data: {
        ...paymentResponse,
        orderId: orderData.id,
        orderNumber: orderData.order_number
      },
    });

  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    
    // Return specific error messages without exposing sensitive data
    const errorMessage = error.message?.includes('Failed to create order') 
      ? 'Failed to save order. Please try again.'
      : 'Failed to create checkout order';

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}