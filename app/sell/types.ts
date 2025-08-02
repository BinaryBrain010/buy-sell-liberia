// types.ts

// Reusable condition type
export type Condition = "new" | "like-new" | "good" | "fair" | "poor";

export const CONDITIONS: {
  value: Condition;
  label: string;
  description: string;
}[] = [
  {
    value: "new",
    label: "New",
    description: "Never used, in original packaging",
  },
  {
    value: "like-new",
    label: "Like New",
    description: "Barely used, no visible wear",
  },
  {
    value: "good",
    label: "Good",
    description: "Normal wear, fully functional",
  },
  { value: "fair", label: "Fair", description: "Some wear but works well" },
  { value: "poor", label: "Poor", description: "Heavy wear, may need repair" },
];

// Basic types
export interface Location {
  city: string;
  state: string;
  country: string;
}

export interface SubCategory {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  subcategories?: SubCategory[];
}

// Main form data structure
export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  condition: Condition;
  negotiable: boolean;
  images: File[];
  location: Location;
  tags: string[];
  specifications: Record<string, string>;
  showPhoneNumber: boolean;
}

// Form error structure (generic)
export interface FormErrors {
  [key: string]: string;
}

// Step 1 props
export interface Step1BasicInfoProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

// Step 2 props
export interface Step2ImagesLocationProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  imagePreview: string[];
  setImagePreview: React.Dispatch<React.SetStateAction<string[]>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

// Step 3 props
export interface Step3AdditionalDetailsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  tagInput: string;
  setTagInput: React.Dispatch<React.SetStateAction<string>>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

// ReviewCard props
export interface ReviewCardProps {
  formData: ProductFormData;
}
