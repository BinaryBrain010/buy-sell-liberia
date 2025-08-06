import { useState, useEffect } from "react";
import axios from "axios";

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
  fieldType: "text" | "number" | "select" | "boolean" | "textarea" | "date";
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

export function useCategories(
  includeProducts = false,
  limit?: number
): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (includeProducts) params.append("includeProducts", "true");
    if (limit) params.append("limit", limit.toString());
    try {
      const response = await axios.get(`/api/categories?${params.toString()}`);
      setCategories(response.data.categories || []);
    } catch (err: any) {
      setError("Failed to fetch categories");
      setCategories([]);
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
    refetch,
  };
}
