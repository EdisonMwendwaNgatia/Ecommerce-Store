'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Sparkles, Leaf, Truck, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import slide1 from '@/images/hero/slide1.jpg'
import slide2 from '@/images/hero/slide2.jpg'
import slide3 from '@/images/hero/slide3.jpg'
import slide4 from '@/images/hero/slide4.jpg'
import slide5 from '@/images/hero/slide5.jpg'    

const slides = [
  {
    id: 1,
    image: slide1,
    alt: 'Natural Skincare Collection',
    title: 'Pure Natural Beauty',
    subtitle: 'Organic skincare for radiant skin'
  },
  {
    id: 2,
    image: slide2,
    alt: 'Luxury Makeup Products',
    title: 'Luxury Makeup',
    subtitle: 'Premium cosmetics with organic ingredients'
  },
  {
    id: 3,
    image: slide3,
    alt: 'Body Care Products',
    title: 'Body Care Essentials',
    subtitle: 'Nourish your skin naturally'
  },
  {
    id: 4,
    image: slide4,
    alt: 'Hair Care Collection',
    title: 'Hair Care Range',
    subtitle: 'Organic solutions for healthy hair'
  },
  {
    id: 5,
    image: slide5,
    alt: 'Gift Sets',
    title: 'Perfect Gift Sets',
    subtitle: 'Curated collections for loved ones'
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="relative h-screen max-h-[800px] overflow-hidden">
      {/* Slideshow Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30"></div>
            
            <div className="relative container mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}
                  <span className="block text-green-200 mt-2">
                    {slide.subtitle}
                  </span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-100">
                  {index === 0 && "Discover our range of organic, cruelty-free cosmetics"}
                  {index === 1 && "Elegant makeup that cares for your skin"}
                  {index === 2 && "Natural formulations for daily wellness"}
                  {index === 3 && "Transform your hair with organic care"}
                  {index === 4 && "Thoughtful gifts for special moments"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/products">
                    <Button size="lg" className="bg-green-700 hover:bg-green-700 text-white border-green-700">
                      Shop Collection
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="bg-green-700 border-white text-white hover:bg-white/10">
                      <Leaf className="mr-2 h-5 w-5" />
                      Our Story
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-green-400 w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Features Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center space-x-3">
              <Leaf className="h-6 w-6 text-green-600" />
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-gray-900">100% Natural</h3>
                <p className="text-gray-600 text-sm">Organic Ingredients</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-gray-900">Cruelty Free</h3>
                <p className="text-gray-600 text-sm">Never Tested on Animals</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Truck className="h-6 w-6 text-green-600" />
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-gray-600 text-sm">On orders over $50</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}