import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import ProductDetails from '@/components/store/ProductDetails'
import RelatedProducts from '@/components/store/RelatedProducts'
import { getProductById, getAllProducts } from '@/lib/products'
import { Product } from '@/types/product'

interface Props {
  params: Promise<{ id: string }>
}

export default async function StoreProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  // Get related products (same category)
  const allProducts = await getAllProducts()
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ProductDetails product={product} />
        <RelatedProducts products={relatedProducts} />
      </main>
      <Footer />
    </div>
  )
}

// Generate static params for better performance
export async function generateStaticParams() {
  const products = await getAllProducts()
  
  return products.map((product) => ({
    id: product.id,
  }))
}