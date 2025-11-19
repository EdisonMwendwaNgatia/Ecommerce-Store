// lib/store-settings.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getStoreSettings() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single() // Remove the .eq() filter since we want the first row

    if (error) {
      // If no rows found, create default settings
      if (error.code === 'PGRST116') {
        console.log('No store settings found, using defaults')
        return getDefaultStoreSettings()
      }
      console.error('Supabase error fetching store settings:', error)
      return getDefaultStoreSettings()
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching store settings:', error)
    return getDefaultStoreSettings()
  }
}

function getDefaultStoreSettings() {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    store_name: 'TVee Store',
    store_description: 'Your favorite electronics store',
    maintenance_mode: false, // Default to false
    allow_registrations: true,
    store_email: 'admin@tvee-store.com',
    store_phone: '+1 (555) 123-4567',
    store_address: '123 Electronics St, Tech City, TC 12345',
    currency: 'KES',
    tax_rate: '8.5',
    shipping_enabled: true,
    free_shipping_threshold: '50',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    theme_colors: {
      accent: '#5CE65C',
      primary: '#3b82f6', 
      secondary: '#6b7280',
      background: '#ffffff'
    },
    payment_methods: {
      cod: true,
      paypal: false,
      stripe: false
    },
    shipping_methods: [
      {
        name: 'Standard Shipping',
        price: 4.99,
        enabled: true,
        description: '5-7 business days'
      },
      {
        name: 'Express Shipping',
        price: 9.99,
        enabled: true,
        description: '2-3 business days'
      },
      {
        name: 'Overnight Shipping',
        price: 19.99,
        enabled: false,
        description: 'Next business day'
      }
    ]
  }
}