import axiosInstance from './BaseService';

// Define interfaces for category-related data
interface Subcategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  customFields?: any[];
  products?: Product[];
  productsPagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Category {
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  subcategories: Subcategory[];
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  category_id: string;
  subcategory_id?: string;
  condition: string;
  images: string[];
  status: string;
  expires_at: string;
}

interface CategoryResponse {
  message: string;
  category?: Category;
  categories?: Category[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CategoryQueryParams {
  includeProducts?: boolean;
  limit?: number;
  page?: number;
  categoryId?: string;
  slug?: string;
}

export class CategoryService {
  /**
   * Fetches categories or a specific category with optional products
   */
  async getCategories(params: CategoryQueryParams = {}): Promise<CategoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.includeProducts) queryParams.append('includeProducts', 'true');
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.slug) queryParams.append('slug', params.slug);

      const response = await axiosInstance.get(`/categories?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch categories');
    }
  }

  /**
   * Creates a new category
   */
  async createCategory(categoryData: {
    name: string;
    slug: string;
    icon: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    subcategories: Array<{
      name: string;
      slug: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
      customFields?: any[];
    }>;
  }): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.post('/categories', categoryData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create category');
    }
  }

  /**
   * Updates an existing category
   */
  async updateCategory(
    identifier: { categoryId?: string; slug?: string },
    updateData: Partial<{
      name: string;
      slug: string;
      icon: string;
      description: string;
      isActive: boolean;
      sortOrder: number;
      subcategories: Array<{
        name: string;
        slug: string;
        description?: string;
        isActive?: boolean;
        sortOrder?: number;
        customFields?: any[];
      }>;
    }>
  ): Promise<CategoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (identifier.categoryId) queryParams.append('categoryId', identifier.categoryId);
      if (identifier.slug) queryParams.append('slug', identifier.slug);

      const response = await axiosInstance.put(`/categories?${queryParams.toString()}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update category');
    }
  }

  /**
   * Deletes a category
   */
  async deleteCategory(identifier: { categoryId?: string; slug?: string }): Promise<CategoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (identifier.categoryId) queryParams.append('categoryId', identifier.categoryId);
      if (identifier.slug) queryParams.append('slug', identifier.slug);

      const response = await axiosInstance.delete(`/categories?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete category');
    }
  }

  /**
   * Add a new subcategory to a category
   */
  async addSubcategory(categoryId: string, subcategoryData: {
    name: string;
    description?: string;
    isActive?: boolean;
    customFields?: any[];
  }): Promise<{ subcategory: Subcategory; message: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('categoryId', categoryId);
      queryParams.append('action', 'add');

      const response = await axiosInstance.patch(`/categories?${queryParams.toString()}`, subcategoryData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add subcategory');
    }
  }

  /**
   * Update a subcategory
   */
  async updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    updateData: Partial<{
      name: string;
      description: string;
      isActive: boolean;
      sortOrder: number;
      customFields: any[];
    }>
  ): Promise<{ subcategory: Subcategory; message: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('categoryId', categoryId);
      queryParams.append('subcategoryId', subcategoryId);
      queryParams.append('action', 'update');

      const response = await axiosInstance.patch(`/categories?${queryParams.toString()}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update subcategory');
    }
  }

  /**
   * Delete a subcategory
   */
  async deleteSubcategory(categoryId: string, subcategoryId: string): Promise<{ message: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('categoryId', categoryId);
      queryParams.append('subcategoryId', subcategoryId);
      queryParams.append('action', 'delete');

      const response = await axiosInstance.patch(`/categories?${queryParams.toString()}`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete subcategory');
    }
  }

  /**
   * Reorder subcategories within a category
   */
  async reorderSubcategories(
    categoryId: string,
    subcategories: Array<{ _id: string; sortOrder?: number }>
  ): Promise<{ subcategories: Subcategory[]; message: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('categoryId', categoryId);
      queryParams.append('action', 'reorder');

      const response = await axiosInstance.patch(`/categories?${queryParams.toString()}`, { subcategories });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reorder subcategories');
    }
  }
}