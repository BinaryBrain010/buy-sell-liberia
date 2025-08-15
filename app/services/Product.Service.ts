import axiosInstance from './BaseService';

interface Price {
  amount: number;
  currency: string;
  negotiable: boolean;
}

interface Location {
  city: string;
  state?: string;
  country?: string;
}

interface ContactInfo {
  phone?: string;
  email?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: Price;
  category_id: string;
  subcategory_id?: string;
  condition: string;
  images: string[];
  status: string;
  createdAt: string;
  featured: boolean;
}

interface ProductFilters {
  category_id?: string;
  subcategory_id?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  search?: string;
  seller?: string;
  status?: string;
  tags?: string[];
  customField?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface SortOptions {
  [key: string]: 1 | -1;
}

interface ProductResponse {
  message: string;
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export class ProductService {
  /**
   * Creates a new product with the provided data and images
   */
  async createProduct(formData: {
    title: string;
    description: string;
    price: Price;
    category_id: string;
    subcategory_id?: string;
    condition: string;
    images: File[];
    titleImageIndex?: number;
    location: Location;
    contactInfo?: ContactInfo;
    tags?: string[];
    specifications?: Record<string, any>;
    showPhoneNumber?: boolean;
  }): Promise<Product> {
    try {
      const form = new FormData();
      
      // Append images
      formData.images.forEach((image, index) => {
        form.append('images', image, `image-${index}.${image.name.split('.').pop()}`);
      });

      // Append form data as a JSON string
      form.append('formData', JSON.stringify({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        condition: formData.condition,
        titleImageIndex: formData.titleImageIndex,
        location: formData.location,
        contactInfo: formData.contactInfo,
        tags: formData.tags,
        specifications: formData.specifications,
        showPhoneNumber: formData.showPhoneNumber,
      }));

      const response = await axiosInstance.post('/products', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.product;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  }

  /**
   * Fetches products based on provided filters, sort options, and pagination
   */
  async getProducts(
    filters: ProductFilters = {},
    sortOptions: SortOptions = {},
    pagination: PaginationOptions = {}
  ): Promise<ProductResponse> {
    try {
      // Construct query parameters
      const params = new URLSearchParams();

      // Add filters
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.condition) params.append('condition', filters.condition.join(','));
      if (filters.search) params.append('search', filters.search);
      if (filters.seller) params.append('seller', filters.seller);
      if (filters.status) params.append('status', filters.status);
      if (filters.tags) params.append('tags', filters.tags.join(','));
      if (filters.customField) params.append('customField', filters.customField);
      
      // Add location filters
      if (filters.location) {
        if (filters.location.city) params.append('city', filters.location.city);
        if (filters.location.state) params.append('state', filters.location.state);
        if (filters.location.country) params.append('country', filters.location.country);
      }

      // Add sort options
      if (Object.keys(sortOptions).length > 0) {
        const sortBy = Object.keys(sortOptions)[0];
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOptions[sortBy] === 1 ? 'asc' : 'desc');
      }

      // Add pagination
      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.limit) params.append('limit', pagination.limit.toString());

      const response = await axiosInstance.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  }
}