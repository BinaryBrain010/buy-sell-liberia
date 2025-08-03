import mongoose from "mongoose";
import Category from "../models/Category";

// Helper function to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Category data with custom fields
interface CustomField {
  fieldName: string;
  fieldType: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validation?: Record<string, any>;
}

interface Subcategory {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  customFields: CustomField[];
}

interface CategoryType {
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  subcategories: Subcategory[];
}

const categoriesData: CategoryType[] = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "📱",
    description: "Mobile phones, computers, and electronic devices",
    sortOrder: 1,
    subcategories: [
      {
        name: "Mobile Phones",
        slug: "mobile-phones",
        description: "Smartphones and feature phones",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "brand",
            fieldType: "select",
            label: "Brand",
            required: true,
            options: [
              "Apple",
              "Samsung",
              "Huawei",
              "Xiaomi",
              "OnePlus",
              "Oppo",
              "Vivo",
              "Realme",
              "Nokia",
              "Other",
            ],
          },
          {
            fieldName: "model",
            fieldType: "text",
            label: "Model",
            required: true,
            placeholder: "e.g. iPhone 13 Pro",
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Poor"],
          },
          {
            fieldName: "storage",
            fieldType: "select",
            label: "Storage",
            options: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
          },
          {
            fieldName: "color",
            fieldType: "text",
            label: "Color",
            placeholder: "e.g. Space Gray",
          },
          {
            fieldName: "boxPack",
            fieldType: "boolean",
            label: "Original Box & Accessories",
          },
          {
            fieldName: "warranty",
            fieldType: "select",
            label: "Warranty",
            options: ["No Warranty", "Company Warranty", "Shop Warranty"],
          },
        ],
      },
      {
        name: "Tablets",
        slug: "tablets",
        description: "iPad, Android tablets, and other tablets",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "brand",
            fieldType: "select",
            label: "Brand",
            required: true,
            options: ["Apple", "Samsung", "Huawei", "Lenovo", "Other"],
          },
          {
            fieldName: "model",
            fieldType: "text",
            label: "Model",
            required: true,
          },
          {
            fieldName: "screenSize",
            fieldType: "text",
            label: "Screen Size",
            placeholder: "e.g. 10.9 inch",
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Poor"],
          },
          {
            fieldName: "storage",
            fieldType: "select",
            label: "Storage",
            options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
          },
        ],
      },
      {
        name: "Laptops & Computers",
        slug: "laptops-computers",
        description: "Laptops, desktops, and computer accessories",
        sortOrder: 3,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: ["Laptop", "Desktop", "All-in-One"],
          },
          {
            fieldName: "brand",
            fieldType: "select",
            label: "Brand",
            required: true,
            options: [
              "Dell",
              "HP",
              "Lenovo",
              "Asus",
              "Acer",
              "Apple",
              "MSI",
              "Other",
            ],
          },
          {
            fieldName: "model",
            fieldType: "text",
            label: "Model",
            required: true,
          },
          {
            fieldName: "processor",
            fieldType: "text",
            label: "Processor",
            placeholder: "e.g. Intel i5 10th Gen",
          },
          {
            fieldName: "ram",
            fieldType: "select",
            label: "RAM",
            options: ["4GB", "8GB", "16GB", "32GB", "64GB"],
          },
          {
            fieldName: "storage",
            fieldType: "text",
            label: "Storage",
            placeholder: "e.g. 512GB SSD",
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Poor"],
          },
        ],
      },
    ],
  },
  {
    name: "Vehicles",
    slug: "vehicles",
    icon: "🚗",
    description: "Cars, motorcycles, and other vehicles",
    sortOrder: 2,
    subcategories: [
      {
        name: "Cars",
        slug: "cars",
        description: "Used and new cars for sale",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "make",
            fieldType: "select",
            label: "Make",
            required: true,
            options: [
              "Toyota",
              "Honda",
              "Suzuki",
              "Hyundai",
              "KIA",
              "Nissan",
              "Mitsubishi",
              "Ford",
              "Chevrolet",
              "Other",
            ],
          },
          {
            fieldName: "model",
            fieldType: "text",
            label: "Model",
            required: true,
            placeholder: "e.g. Corolla",
          },
          {
            fieldName: "year",
            fieldType: "number",
            label: "Year",
            required: true,
            validation: { min: 1990, max: 2024 },
          },
          {
            fieldName: "mileage",
            fieldType: "number",
            label: "Mileage (KM)",
            placeholder: "e.g. 50000",
          },
          {
            fieldName: "fuelType",
            fieldType: "select",
            label: "Fuel Type",
            options: ["Petrol", "Diesel", "CNG", "Hybrid", "Electric"],
          },
          {
            fieldName: "transmission",
            fieldType: "select",
            label: "Transmission",
            options: ["Manual", "Automatic"],
          },
          {
            fieldName: "engineCapacity",
            fieldType: "text",
            label: "Engine Capacity",
            placeholder: "e.g. 1300cc",
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            options: ["Excellent", "Good", "Fair", "Needs Work"],
          },
          { fieldName: "color", fieldType: "text", label: "Color" },
        ],
      },
      {
        name: "Motorcycles",
        slug: "motorcycles",
        description: "Motorcycles and bikes for sale",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "make",
            fieldType: "select",
            label: "Make",
            required: true,
            options: [
              "Honda",
              "Yamaha",
              "Suzuki",
              "KTM",
              "Kawasaki",
              "BMW",
              "Harley Davidson",
              "Other",
            ],
          },
          {
            fieldName: "model",
            fieldType: "text",
            label: "Model",
            required: true,
          },
          {
            fieldName: "year",
            fieldType: "number",
            label: "Year",
            required: true,
            validation: { min: 1990, max: 2024 },
          },
          {
            fieldName: "engineCapacity",
            fieldType: "text",
            label: "Engine Capacity",
            placeholder: "e.g. 125cc",
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            options: ["Excellent", "Good", "Fair", "Needs Work"],
          },
          { fieldName: "mileage", fieldType: "number", label: "Mileage (KM)" },
        ],
      },
    ],
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    icon: "🏠",
    description: "Houses, apartments, and properties",
    sortOrder: 3,
    subcategories: [
      {
        name: "Houses for Sale",
        slug: "houses-for-sale",
        description: "Houses and homes for sale",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "bedrooms",
            fieldType: "number",
            label: "Bedrooms",
            required: true,
            validation: { min: 1, max: 10 },
          },
          {
            fieldName: "bathrooms",
            fieldType: "number",
            label: "Bathrooms",
            required: true,
            validation: { min: 1, max: 10 },
          },
          {
            fieldName: "area",
            fieldType: "number",
            label: "Area",
            required: true,
            placeholder: "Enter area",
          },
          {
            fieldName: "areaUnit",
            fieldType: "select",
            label: "Area Unit",
            options: ["Sq Ft", "Sq Meter", "Marla", "Kanal"],
          },
          {
            fieldName: "propertyType",
            fieldType: "select",
            label: "Property Type",
            options: ["House", "Villa", "Bungalow", "Townhouse"],
          },
          {
            fieldName: "furnished",
            fieldType: "select",
            label: "Furnished",
            options: ["Furnished", "Semi-Furnished", "Unfurnished"],
          },
          {
            fieldName: "parking",
            fieldType: "number",
            label: "Parking Spaces",
            validation: { min: 0, max: 10 },
          },
          {
            fieldName: "age",
            fieldType: "select",
            label: "Property Age",
            options: [
              "Under Construction",
              "New",
              "1-5 Years",
              "5-10 Years",
              "10+ Years",
            ],
          },
        ],
      },
      {
        name: "Apartments for Rent",
        slug: "apartments-for-rent",
        description: "Apartments and flats for rent",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "bedrooms",
            fieldType: "number",
            label: "Bedrooms",
            required: true,
          },
          {
            fieldName: "bathrooms",
            fieldType: "number",
            label: "Bathrooms",
            required: true,
          },
          {
            fieldName: "area",
            fieldType: "number",
            label: "Area (Sq Ft)",
            required: true,
          },
          {
            fieldName: "furnished",
            fieldType: "select",
            label: "Furnished",
            options: ["Furnished", "Semi-Furnished", "Unfurnished"],
          },
          { fieldName: "floor", fieldType: "number", label: "Floor" },
          {
            fieldName: "totalFloors",
            fieldType: "number",
            label: "Total Floors in Building",
          },
          {
            fieldName: "amenities",
            fieldType: "text",
            label: "Amenities",
            placeholder: "e.g. Gym, Pool, Security",
          },
        ],
      },
    ],
  },
  {
    name: "Home & Furniture",
    slug: "home-furniture",
    icon: "🪑",
    description: "Furniture and home decor items",
    sortOrder: 4,
    subcategories: [
      {
        name: "Beds & Mattresses",
        slug: "beds-mattresses",
        description: "Beds, mattresses, and bedroom furniture",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Single Bed",
              "Double Bed",
              "King Size",
              "Queen Size",
              "Mattress Only",
            ],
          },
          {
            fieldName: "material",
            fieldType: "select",
            label: "Material",
            options: ["Wood", "Metal", "Upholstered", "Other"],
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Poor"],
          },
          {
            fieldName: "includeMattress",
            fieldType: "boolean",
            label: "Includes Mattress",
          },
        ],
      },
      {
        name: "Sofas & Chairs",
        slug: "sofas-chairs",
        description: "Sofas, chairs, and seating furniture",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Sofa Set",
              "Single Sofa",
              "Office Chair",
              "Dining Chair",
              "Other",
            ],
          },
          {
            fieldName: "seatingCapacity",
            fieldType: "number",
            label: "Seating Capacity",
          },
          {
            fieldName: "material",
            fieldType: "select",
            label: "Material",
            options: ["Leather", "Fabric", "Wood", "Plastic", "Other"],
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Poor"],
          },
        ],
      },
    ],
  },
  {
    name: "Fashion & Beauty",
    slug: "fashion-beauty",
    icon: "🧺",
    description: "Clothing, shoes, and beauty products",
    sortOrder: 5,
    subcategories: [
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "Men's shirts, pants, and clothing",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Shirt",
              "T-Shirt",
              "Pants",
              "Jeans",
              "Suit",
              "Jacket",
              "Other",
            ],
          },
          {
            fieldName: "size",
            fieldType: "select",
            label: "Size",
            required: true,
            options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: [
              "Brand New with Tags",
              "Brand New",
              "Like New",
              "Good",
              "Fair",
            ],
          },
          { fieldName: "color", fieldType: "text", label: "Color" },
        ],
      },
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Women's dresses, tops, and clothing",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Dress",
              "Top",
              "Blouse",
              "Pants",
              "Jeans",
              "Skirt",
              "Suit",
              "Other",
            ],
          },
          {
            fieldName: "size",
            fieldType: "select",
            label: "Size",
            required: true,
            options: ["XS", "S", "M", "L", "XL", "XXL"],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: [
              "Brand New with Tags",
              "Brand New",
              "Like New",
              "Good",
              "Fair",
            ],
          },
          { fieldName: "color", fieldType: "text", label: "Color" },
        ],
      },
      {
        name: "Shoes (All genders)",
        slug: "shoes",
        description: "Men's and women's shoes",
        sortOrder: 3,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Sneakers",
              "Formal",
              "Sandals",
              "Boots",
              "Heels",
              "Flats",
              "Sports",
              "Other",
            ],
          },
          {
            fieldName: "size",
            fieldType: "number",
            label: "Size",
            required: true,
            validation: { min: 5, max: 15 },
          },
          {
            fieldName: "gender",
            fieldType: "select",
            label: "Gender",
            required: true,
            options: ["Men", "Women", "Unisex", "Kids"],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Poor"],
          },
          { fieldName: "color", fieldType: "text", label: "Color" },
        ],
      },
      {
        name: "Bags & Accessories",
        slug: "bags-accessories",
        description: "Handbags, wallets, and accessories",
        sortOrder: 4,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Handbag",
              "Backpack",
              "Wallet",
              "Belt",
              "Watch",
              "Sunglasses",
              "Other",
            ],
          },
          {
            fieldName: "material",
            fieldType: "select",
            label: "Material",
            options: ["Leather", "Fabric", "Synthetic", "Metal", "Other"],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Poor"],
          },
          { fieldName: "color", fieldType: "text", label: "Color" },
        ],
      },
    ],
  },
  {
    name: "Babies & Kids",
    slug: "babies-kids",
    icon: "👶",
    description: "Baby and children's items",
    sortOrder: 6,
    subcategories: [
      {
        name: "Baby Clothing",
        slug: "baby-clothing",
        description: "Baby clothes and accessories",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "ageGroup",
            fieldType: "select",
            label: "Age Group",
            required: true,
            options: [
              "0-3 months",
              "3-6 months",
              "6-12 months",
              "1-2 years",
              "2-3 years",
            ],
          },
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Onesie",
              "Dress",
              "Pants",
              "Shirt",
              "Pajamas",
              "Outerwear",
              "Other",
            ],
          },
          {
            fieldName: "gender",
            fieldType: "select",
            label: "Gender",
            options: ["Boy", "Girl", "Unisex"],
          },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair"],
          },
        ],
      },
      {
        name: "Toys & Games",
        slug: "toys-games",
        description: "Children's toys and games",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "ageRange",
            fieldType: "text",
            label: "Age Range",
            required: true,
            placeholder: "e.g. 3-8 years",
          },
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Educational",
              "Electronic",
              "Board Game",
              "Action Figure",
              "Doll",
              "Puzzle",
              "Building Blocks",
              "Other",
            ],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair"],
          },
          {
            fieldName: "batteries",
            fieldType: "boolean",
            label: "Requires Batteries",
          },
        ],
      },
    ],
  },
  {
    name: "Tools & Equipment",
    slug: "tools-equipment",
    icon: "🧰",
    description: "Tools and equipment for various purposes",
    sortOrder: 7,
    subcategories: [
      {
        name: "Construction Tools",
        slug: "construction-tools",
        description: "Construction and building tools",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Hand Tool",
              "Power Tool",
              "Measuring Tool",
              "Safety Equipment",
              "Other",
            ],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Needs Repair"],
          },
          {
            fieldName: "powerSource",
            fieldType: "select",
            label: "Power Source",
            options: ["Manual", "Electric", "Battery", "Pneumatic", "Gas"],
          },
        ],
      },
      {
        name: "Gardening Equipment",
        slug: "gardening-equipment",
        description: "Garden tools and equipment",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Hand Tool",
              "Power Tool",
              "Watering Equipment",
              "Fertilizer",
              "Seeds",
              "Other",
            ],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair"],
          },
        ],
      },
    ],
  },
  {
    name: "Services",
    slug: "services",
    icon: "💻",
    description: "Professional services and freelance work",
    sortOrder: 8,
    subcategories: [
      {
        name: "Home Repairs & Maintenance",
        slug: "home-repairs",
        description: "Home repair and maintenance services",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "serviceType",
            fieldType: "select",
            label: "Service Type",
            required: true,
            options: [
              "Plumbing",
              "Electrical",
              "Painting",
              "Carpentry",
              "Cleaning",
              "AC Repair",
              "Other",
            ],
          },
          {
            fieldName: "experience",
            fieldType: "text",
            label: "Years of Experience",
          },
          {
            fieldName: "availability",
            fieldType: "select",
            label: "Availability",
            options: ["Immediate", "Within a week", "Flexible"],
          },
          {
            fieldName: "emergencyService",
            fieldType: "boolean",
            label: "Emergency Service Available",
          },
        ],
      },
      {
        name: "Photography & Videography",
        slug: "photography-videography",
        description: "Photography and video services",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "serviceType",
            fieldType: "select",
            label: "Service Type",
            required: true,
            options: [
              "Wedding Photography",
              "Event Photography",
              "Portrait",
              "Commercial",
              "Videography",
              "Editing",
              "Other",
            ],
          },
          {
            fieldName: "experience",
            fieldType: "text",
            label: "Years of Experience",
          },
          {
            fieldName: "equipment",
            fieldType: "text",
            label: "Equipment Used",
          },
          {
            fieldName: "portfolio",
            fieldType: "text",
            label: "Portfolio Link",
          },
        ],
      },
    ],
  },
  {
    name: "Jobs",
    slug: "jobs",
    icon: "💼",
    description: "Job opportunities and employment",
    sortOrder: 9,
    subcategories: [
      {
        name: "Full-time Jobs",
        slug: "full-time-jobs",
        description: "Full-time employment opportunities",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "jobTitle",
            fieldType: "text",
            label: "Job Title",
            required: true,
          },
          {
            fieldName: "industry",
            fieldType: "select",
            label: "Industry",
            required: true,
            options: [
              "IT",
              "Finance",
              "Healthcare",
              "Education",
              "Manufacturing",
              "Retail",
              "Other",
            ],
          },
          {
            fieldName: "experience",
            fieldType: "select",
            label: "Experience Required",
            options: ["Entry Level", "1-3 years", "3-5 years", "5+ years"],
          },
          {
            fieldName: "education",
            fieldType: "select",
            label: "Education",
            options: [
              "High School",
              "Bachelor's",
              "Master's",
              "PhD",
              "Professional Certification",
            ],
          },
          {
            fieldName: "jobType",
            fieldType: "select",
            label: "Job Type",
            options: ["Permanent", "Contract", "Remote", "Hybrid"],
          },
        ],
      },
      {
        name: "Part-time Jobs",
        slug: "part-time-jobs",
        description: "Part-time and flexible work opportunities",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "jobTitle",
            fieldType: "text",
            label: "Job Title",
            required: true,
          },
          {
            fieldName: "hoursPerWeek",
            fieldType: "number",
            label: "Hours Per Week",
            validation: { min: 1, max: 40 },
          },
          {
            fieldName: "flexibility",
            fieldType: "select",
            label: "Schedule Flexibility",
            options: [
              "Fixed Hours",
              "Flexible",
              "Weekend Only",
              "Evening Only",
            ],
          },
          {
            fieldName: "experience",
            fieldType: "select",
            label: "Experience Required",
            options: ["No Experience", "Some Experience", "Experienced"],
          },
        ],
      },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    icon: "🏍",
    description: "Sports equipment and outdoor gear",
    sortOrder: 10,
    subcategories: [
      {
        name: "Bicycles",
        slug: "bicycles",
        description: "Bicycles and cycling equipment",
        sortOrder: 1,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Mountain Bike",
              "Road Bike",
              "Hybrid",
              "BMX",
              "Electric",
              "Kids Bike",
              "Other",
            ],
          },
          {
            fieldName: "wheelSize",
            fieldType: "select",
            label: "Wheel Size",
            options: [
              "12 inch",
              "16 inch",
              "20 inch",
              "24 inch",
              "26 inch",
              "27.5 inch",
              "29 inch",
            ],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair", "Needs Repair"],
          },
          { fieldName: "frameSize", fieldType: "text", label: "Frame Size" },
        ],
      },
      {
        name: "Gym Equipment",
        slug: "gym-equipment",
        description: "Fitness and gym equipment",
        sortOrder: 2,
        customFields: [
          {
            fieldName: "type",
            fieldType: "select",
            label: "Type",
            required: true,
            options: [
              "Treadmill",
              "Weights",
              "Bench",
              "Exercise Bike",
              "Yoga Mat",
              "Resistance Bands",
              "Other",
            ],
          },
          { fieldName: "brand", fieldType: "text", label: "Brand" },
          {
            fieldName: "condition",
            fieldType: "select",
            label: "Condition",
            required: true,
            options: ["Brand New", "Like New", "Good", "Fair"],
          },
          {
            fieldName: "weight",
            fieldType: "text",
            label: "Weight/Capacity",
            placeholder: "e.g. 100kg",
          },
        ],
      },
    ],
  },
];

async function seedCategories(): Promise<void> {
  try {
    console.log("🌱 Starting category seeding...");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("🗑️  Cleared existing categories");

    // Insert new categories

    for (const categoryData of categoriesData) {
      const category = new Category(categoryData);
      await category.save();
      console.log(
        `✅ Created category: ${categoryData.name} with ${categoryData.subcategories.length} subcategories`
      );
    }

    console.log("🎉 Category seeding completed successfully!");

    // Display summary

    const totalCategories = await Category.countDocuments();
    const totalSubcategories = await Category.aggregate([
      { $unwind: "$subcategories" },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    console.log(`📊 Summary:`);
    console.log(`   - Total Categories: ${totalCategories}`);
    console.log(
      `   - Total Subcategories: ${totalSubcategories[0]?.count ?? 0}`
    );
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
}

// Database connection function

const connectDB = async (): Promise<void> => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/buysell";
  let isConnected = false;
  if (isConnected) {
    return;
  }
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw new Error("Database connection failed");
  }
};

// Run seeder if called directly

if (require.main === module) {
  connectDB()
    .then(() => {
      seedCategories()
        .then(() => {
          console.log("✨ Seeding completed, exiting...");
          process.exit(0);
        })
        .catch((error) => {
          console.error("💥 Seeding failed:", error);
          process.exit(1);
        });
    })
    .catch((error) => {
      console.error("💥 Database connection failed:", error);
      process.exit(1);
    });
}

export default seedCategories;
