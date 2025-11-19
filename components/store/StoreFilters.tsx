'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Search, X } from 'lucide-react'
import { getCategoryCounts, CategoryCount } from '@/lib/categories'

interface StoreFiltersProps {
  currentCategory?: string
  currentSort?: string
}

export default function StoreFilters({ currentCategory, currentSort }: StoreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ]

  useEffect(() => {
    const loadCategories = async () => {
      const categoryData = await getCategoryCounts()
      setCategories(categoryData)
      setIsLoading(false)
    }

    loadCategories()
  }, [])

  // Get current price filters from URL
  useEffect(() => {
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)])
    }
  }, [searchParams])

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`/store?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    updateSearchParams({ category: category === currentCategory ? null : category })
  }

  const handleSortChange = (sort: string) => {
    updateSearchParams({ sort })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({ search: searchQuery || null })
  }

  const handlePriceFilter = () => {
    updateSearchParams({ 
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString()
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setPriceRange([0, 1000])
    // Clear all URL parameters
    router.push('/store')
  }

  const hasActiveFilters = currentCategory || searchParams.get('search') || currentSort || searchParams.get('minPrice')

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <form onSubmit={handleSearch} className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div>
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Sort By */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Sort By</Label>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                currentSort === option.value
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Categories</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`flex justify-between items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  currentCategory === category.value
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{category.label}</span>
                <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                  ({category.count})
                </span>
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-sm px-3 py-2">No categories found</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </Label>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handlePriceFilter}
          >
            Apply Price Filter
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Availability</Label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="rounded border-gray-300" 
              checked={searchParams.get('inStock') === 'true'}
              onChange={(e) => updateSearchParams({ 
                inStock: e.target.checked ? 'true' : null 
              })}
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
          <div className="space-y-2">
            {currentCategory && (
              <div className="flex items-center justify-between text-sm">
                <span>Category: {categories.find(c => c.value === currentCategory)?.label || currentCategory}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSearchParams({ category: null })}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {searchParams.get('minPrice') && searchParams.get('maxPrice') && (
              <div className="flex items-center justify-between text-sm">
                <span>Price: ${searchParams.get('minPrice')} - ${searchParams.get('maxPrice')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSearchParams({ minPrice: null, maxPrice: null })}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {searchParams.get('search') && (
              <div className="flex items-center justify-between text-sm">
                <span>Search: "{searchParams.get('search')}"</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSearchParams({ search: null })}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {searchParams.get('inStock') === 'true' && (
              <div className="flex items-center justify-between text-sm">
                <span>In Stock Only</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSearchParams({ inStock: null })}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}