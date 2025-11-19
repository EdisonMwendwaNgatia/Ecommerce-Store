export interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  merchantId?: string;
  environment: 'sandbox' | 'live';
}

export interface IPNRegistration {
  url: string;
  ipn_notification_type: 'GET' | 'POST';
}

export interface IPNRegistrationResponse {
  url: string;
  created_date: string;
  ipn_id: string;
  notification_type: number;
  ipn_notification_type_description: string;
  ipn_status: number;
  ipn_status_description: string;
  error: any;
  status: string;
}

export interface PesapalOrder {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string; 
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code: string;
    first_name: string;
    last_name: string;
  };
}

export interface PesapalPaymentResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  status: string;
  message: string;
}

class PesapalAPI {
  private baseURL: string;
  private config: PesapalConfig;
  private ipnId: string | null = null;

  constructor(config: PesapalConfig) {
    this.config = config;
    this.baseURL = config.environment === 'sandbox' 
      ? 'https://cybqa.pesapal.com/pesapalv3'
      : 'https://pay.pesapal.com/v3';
  }

  private async getAccessToken(): Promise<string> {
    console.log('🔐 Getting access token from Pesapal...');
    
    const response = await fetch(`${this.baseURL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('No token received from Pesapal');
    }
    
    console.log('✅ Successfully obtained access token');
    return data.token;
  }

  async registerIPN(ipnData: IPNRegistration): Promise<IPNRegistrationResponse> {
    const token = await this.getAccessToken();

    console.log('📝 Registering IPN URL:', ipnData.url);

    const response = await fetch(`${this.baseURL}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(ipnData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to register IPN: ${response.status} - ${errorText}`);
    }

    const result: IPNRegistrationResponse = await response.json();
    
    if (result.error) {
      throw new Error(`IPN registration error: ${result.error.message || 'Unknown error'}`);
    }

    this.ipnId = result.ipn_id;
    
    console.log('✅ IPN registered successfully. IPN ID:', result.ipn_id);
    return result;
  }

  async submitOrder(order: Omit<PesapalOrder, 'id'>): Promise<PesapalPaymentResponse> {
    const token = await this.getAccessToken();
    
    if (!this.ipnId) {
      console.log('🔄 No IPN ID found. Registering IPN URL first...');
      await this.registerIPN({
        url: process.env.PESAPAL_IPN_URL!,
        ipn_notification_type: 'POST'
      });
    }

    const orderData = {
      ...order,
      id: this.generateOrderId(),
      notification_id: this.ipnId!, 
    };

    console.log('🛒 Submitting order to Pesapal:', {
      amount: orderData.amount,
      currency: orderData.currency,
      notification_id: orderData.notification_id,
    });

    const response = await fetch(`${this.baseURL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit order: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(`Order submission error: ${result.error.message || 'Unknown error'}`);
    }

    console.log('✅ Order submitted successfully');
    return result;
  }

  async getOrderStatus(orderTrackingId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseURL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get order status: ${response.status}`);
    }

    return response.json();
  }

  private generateOrderId(): string {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentIPNId(): string | null {
    return this.ipnId;
  }
}

// Initialize Pesapal instance
export const pesapal = new PesapalAPI({
  consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
  environment: (process.env.PESAPAL_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
});