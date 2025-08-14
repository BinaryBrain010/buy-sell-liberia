// Product-related type definitions

export interface Price {
  amount: number
  currency?: string
  negotiable?: boolean
}

export interface ProductLocation {
  city: string
  state?: string
  country: string
}

export interface ProductImage {
  url: string
  alt?: string
}

export interface Product {
  _id: string
  title: string
  description: string
  price: Price
  category: string
  subCategory: string
  condition: string
  images: ProductImage[]
  titleImageIndex: number
  location: ProductLocation
  contactInfo: object
  seller: string
  status: string
  tags: string[]
  negotiable: boolean
  showPhoneNumber: boolean
  views: number
  featured: boolean
  createdAt: string
  updatedAt: string
}
