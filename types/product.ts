export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category: string;
  inventory: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category: string;
  inventory: number;
  is_featured: boolean;
  is_active: boolean;
}