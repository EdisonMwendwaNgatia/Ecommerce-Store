import { createClient } from './supabaseClient'

export interface CategoryCount {
  value: string
  label: string
  count: number
}

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const supabase = createClient()
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching products for category counts:', error)
      return []
    }

    const categoryCounts = products.reduce((acc, product) => {
      const category = product.category
      if (category) {
        acc[category] = (acc[category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const categories: CategoryCount[] = Object.entries(categoryCounts).map(([value, count]) => ({
      value: value.toLowerCase().replace(/\s+/g, '-'),
      label: value,
      count
    }))

    return categories
  } catch (error) {
    console.error('Error getting category counts:', error)
    return []
  }
}