import { Product } from '@/types/product'
import ProductGrid from '@/components/products/ProductGrid'

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Related Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            You might also like these similar products
          </p>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  )
}