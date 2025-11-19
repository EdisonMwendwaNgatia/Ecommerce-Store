import { Suspense } from 'react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import ProductGrid from '@/components/products/ProductGrid'
import StoreFilters from '@/components/store/StoreFilters'
import { getAllProducts } from '@/lib/products'
import { Button } from '@/components/ui/Button'
import { Filter, Grid, List } from 'lucide-react'

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  page?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
}

interface StorePageProps {
  searchParams: Promise<SearchParams>
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams
  const { category, search, sort, minPrice, maxPrice, inStock } = params
  
  // Fetch all products
  const products = await getAllProducts()
  
  // Apply filters
  let filteredProducts = products
  
  if (category) {
    filteredProducts = products.filter(product => 
      product.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
    )
  }
  
  if (search) {
    filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Price filter
  if (minPrice && maxPrice) {
    const min = Number(minPrice)
    const max = Number(maxPrice)
    filteredProducts = filteredProducts.filter(product => 
      product.price >= min && product.price <= max
    )
  }

  // Stock filter
  if (inStock === 'true') {
    filteredProducts = filteredProducts.filter(product => product.inventory > 0)
  }

  // Apply sorting
  if (sort === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price)
  } else if (sort === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price)
  } else if (sort === 'name') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Check if we have any active filters
  const hasActiveFilters = category || search || minPrice || maxPrice || inStock

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Store Header */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Our Store
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our complete collection of premium beauty products
              </p>
            </div>
          </div>
        </section>

        {/* Store Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Only show if we have products or active filters */}
              {(products.length > 0 || hasActiveFilters) && (
                <aside className="lg:w-64 flex-shrink-0">
                  <StoreFilters 
                    currentCategory={category}
                    currentSort={sort}
                  />
                </aside>
              )}

              {/* Main Content - Full width when no filters or no products */}
              <div className={`${(products.length > 0 || hasActiveFilters) ? 'flex-1' : 'w-full'}`}>
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <p className="text-gray-600">
                      Showing {filteredProducts.length} of {products.length} products
                      {category && (
                        <span className="font-medium"> in {category.replace(/-/g, ' ')}</span>
                      )}
                      {search && (
                        <span className="font-medium"> for "{search}"</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* View Toggle */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Mobile Filter Button */}
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                {/* Products Grid */}
                <Suspense fallback={<ProductsLoading />}>
                  <ProductGrid products={filteredProducts} />
                </Suspense>

                {/* No Results */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {products.length === 0 
                        ? "We don't have any products in our store yet. Please check back later."
                        : "Try adjusting your search or filter criteria"
                      }
                    </p>
                    {products.length > 0 && (
                      <Button asChild>
                        <a href="/store">
                          Clear Filters
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}