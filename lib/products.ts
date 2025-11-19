import { createClient } from './supabaseClient'
import { Product } from '@/types/product'

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(8)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching featured products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}