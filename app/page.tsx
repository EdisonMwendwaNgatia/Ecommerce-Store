// app/page.tsx
import Navbar from '@/components/navbar/Navbar'
import HeroBanner from '@/components/hero/HeroBanner'
import ProductGrid from '@/components/products/ProductGrid'
import Footer from '@/components/footer/Footer'
import MaintenanceMode from '@/components/maintenance/maintenanceMode'
import { getFeaturedProducts } from '@/lib/products'
import { getStoreSettings } from '@/lib/store-settings'

export default async function HomePage() {
  // Fetch store settings and featured products in parallel
  const [storeSettings, featuredProducts] = await Promise.all([
    getStoreSettings(),
    getFeaturedProducts()
  ])

  // If maintenance mode is enabled, show maintenance screen
  if (storeSettings?.maintenance_mode) {
    return <MaintenanceMode />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our carefully selected range of premium electronics
              </p>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}