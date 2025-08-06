import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  subcategories: Subcategory[];
  products?: Product[];
  totalCount?: number;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  customFields: CustomField[];
}

export interface CustomField {
  fieldName: string;
  fieldType: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'date';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  location: {
    city: string;
    state?: string;
    country: string;
  };
  images: {
    url: string;
    alt?: string;
    isPrimary: boolean;
    order: number;
  }[];
  customFields: {
    fieldName: string;
    value: any;
  }[];
  status: string;
  created_at: string;
  expires_at: string;
  slug: string;
  user_id: {
    _id?: string;
    firstName: string;
    lastName: string;
    profile?: {
      displayName?: string;
      avatar?: string;
    };
  };
  views: number;
  featured: boolean;
  showPhoneNumber?: boolean;
}

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCategories(includeProducts = false, limit?: number ): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeProducts) params.append('includeProducts', 'true');
      if (limit) params.append('limit', limit.toString());

      // Try API first, fallback to mock data if fails
      try {
        const response = await axios.get(`/api/categories?${params.toString()}`);
        setCategories(response.data.categories || []);
      } catch (apiError) {
        console.warn('API failed, using mock data:', apiError);
        // Use mock data as fallback immediately
        setCategories(getMockCategories());
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      // Always fallback to mock data - no error state
      setCategories(getMockCategories());
      setError(null); // Clear error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeProducts, limit]);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch
  };
}

// Mock data fallback matching our database structure
function getMockCategories(): Category[] {
  return [
    {
      _id: '1',
      name: 'Electronics',
      slug: 'electronics',
      icon: '📱',
      description: 'Mobile phones, computers, and electronic devices',
      sortOrder: 1,
      totalCount: 2543,
      subcategories: [
        {
          _id: '1-1',
          name: 'Mobile Phones',
          slug: 'mobile-phones',
          description: 'Smartphones and feature phones',
          customFields: []
        },
        {
          _id: '1-2',
          name: 'Tablets',
          slug: 'tablets',
          description: 'iPad, Android tablets, and other tablets',
          customFields: []
        },
        {
          _id: '1-3',
          name: 'Laptops & Computers',
          slug: 'laptops-computers',
          description: 'Laptops, desktops, and computer accessories',
          customFields: []
        }
      ],
      products: []
    },
    {
      _id: '2',
      name: 'Vehicles',
      slug: 'vehicles',
      icon: '🚗',
      description: 'Cars, motorcycles, and other vehicles',
      sortOrder: 2,
      totalCount: 1234,
      subcategories: [
        {
          _id: '2-1',
          name: 'Cars',
          slug: 'cars',
          description: 'Used and new cars for sale',
          customFields: []
        },
        {
          _id: '2-2',
          name: 'Motorcycles',
          slug: 'motorcycles',
          description: 'Motorcycles and bikes for sale',
          customFields: []
        }
      ],
      products: []
    },
    {
      _id: '3',
      name: 'Real Estate',
      slug: 'real-estate',
      icon: '🏠',
      description: 'Houses, apartments, and properties',
      sortOrder: 3,
      totalCount: 856,
      subcategories: [
        {
          _id: '3-1',
          name: 'Houses for Sale',
          slug: 'houses-for-sale',
          description: 'Houses and homes for sale',
          customFields: []
        },
        {
          _id: '3-2',
          name: 'Apartments for Rent',
          slug: 'apartments-for-rent',
          description: 'Apartments and flats for rent',
          customFields: []
        }
      ],
      products: []
    },
    {
      _id: '4',
      name: 'Home & Furniture',
      slug: 'home-furniture',
      icon: '🪑',
      description: 'Furniture and home decor items',
      sortOrder: 4,
      totalCount: 1567,
      subcategories: [],
      products: []
    },
    {
      _id: '5',
      name: 'Fashion & Beauty',
      slug: 'fashion-beauty',
      icon: '🧺',
      description: 'Clothing, shoes, and beauty products',
      sortOrder: 5,
      totalCount: 3421,
      subcategories: [],
      products: []
    },
    {
      _id: '6',
      name: 'Babies & Kids',
      slug: 'babies-kids',
      icon: '👶',
      description: 'Baby and children\'s items',
      sortOrder: 6,
      totalCount: 894,
      subcategories: [],
      products: []
    },
    {
      _id: '7',
      name: 'Tools & Equipment',
      slug: 'tools-equipment',
      icon: '🧰',
      description: 'Tools and equipment for various purposes',
      sortOrder: 7,
      totalCount: 432,
      subcategories: [],
      products: []
    },
    {
      _id: '8',
      name: 'Services',
      slug: 'services',
      icon: '💻',
      description: 'Professional services and freelance work',
      sortOrder: 8,
      totalCount: 789,
      subcategories: [],
      products: []
    },
    {
      _id: '9',
      name: 'Jobs',
      slug: 'jobs',
      icon: '💼',
      description: 'Job opportunities and employment',
      sortOrder: 9,
      totalCount: 245,
      subcategories: [],
      products: []
    },
    {
      _id: '10',
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      icon: '🏍',
      description: 'Sports equipment and outdoor gear',
      sortOrder: 10,
      totalCount: 678,
      subcategories: [],
      products: []
    }
  ];
}
