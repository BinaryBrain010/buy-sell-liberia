const mongoose = require('mongoose');
const Category = require('../models/Category');

// Initial categories data matching the frontend expectations
const initialCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    description: 'Mobile phones, computers, and electronic devices',
    sortOrder: 1,
    isActive: true,
    subcategories: [
      { 
        name: 'Mobile Phones', 
        slug: 'mobile-phones', 
        description: 'Smartphones and feature phones', 
        isActive: true,
        sortOrder: 1,
        customFields: [
          { fieldName: 'brand', fieldType: 'select', label: 'Brand', required: true, options: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Other'] },
          { fieldName: 'model', fieldType: 'text', label: 'Model', required: true, placeholder: 'e.g. iPhone 13 Pro' },
          { fieldName: 'condition', fieldType: 'select', label: 'Condition', required: true, options: ['Brand New', 'Like New', 'Good', 'Fair', 'Poor'] },
          { fieldName: 'storage', fieldType: 'select', label: 'Storage', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
          { fieldName: 'color', fieldType: 'text', label: 'Color', placeholder: 'e.g. Space Gray' }
        ]
      },
      { 
        name: 'Tablets', 
        slug: 'tablets', 
        description: 'iPad, Android tablets, and other tablets', 
        isActive: true,
        sortOrder: 2,
        customFields: [
          { fieldName: 'brand', fieldType: 'select', label: 'Brand', required: true, options: ['Apple', 'Samsung', 'Huawei', 'Lenovo', 'Other'] },
          { fieldName: 'model', fieldType: 'text', label: 'Model', required: true },
          { fieldName: 'screenSize', fieldType: 'text', label: 'Screen Size', placeholder: 'e.g. 10.9 inch' }
        ]
      },
      { 
        name: 'Laptops & Computers', 
        slug: 'laptops-computers', 
        description: 'Laptops, desktops, and computer accessories', 
        isActive: true,
        sortOrder: 3,
        customFields: [
          { fieldName: 'type', fieldType: 'select', label: 'Type', required: true, options: ['Laptop', 'Desktop', 'All-in-One'] },
          { fieldName: 'brand', fieldType: 'select', label: 'Brand', required: true, options: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Other'] },
          { fieldName: 'processor', fieldType: 'text', label: 'Processor', placeholder: 'e.g. Intel i5 10th Gen' },
          { fieldName: 'ram', fieldType: 'select', label: 'RAM', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] }
        ]
      },
      { name: 'Accessories', slug: 'accessories', description: 'Chargers, Headphones, etc.', isActive: true, sortOrder: 4, customFields: [] },
      { name: 'TVs & Home Entertainment', slug: 'tvs-home-entertainment', description: 'Televisions and entertainment systems', isActive: true, sortOrder: 5, customFields: [] },
      { name: 'Cameras & Drones', slug: 'cameras-drones', description: 'Photography and drone equipment', isActive: true, sortOrder: 6, customFields: [] },
      { name: 'Wearables', slug: 'wearables', description: 'Smartwatches, Fitness Bands', isActive: true, sortOrder: 7, customFields: [] }
    ]
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    icon: '🚗',
    description: 'Cars, motorcycles, and other vehicles',
    sortOrder: 2,
    isActive: true,
    subcategories: [
      { name: 'Cars', slug: 'cars', description: 'Used and new cars for sale', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Motorcycles', slug: 'motorcycles', description: 'Motorcycles and bikes for sale', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Tricycles (Kekeh)', slug: 'tricycles', description: 'Three-wheeler vehicles', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Trucks & Buses', slug: 'trucks-buses', description: 'Commercial vehicles', isActive: true, sortOrder: 4, customFields: [] },
      { name: 'Vehicle Parts & Accessories', slug: 'vehicle-parts', description: 'Auto parts and accessories', isActive: true, sortOrder: 5, customFields: [] }
    ]
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    icon: '🏠',
    description: 'Houses, apartments, and properties',
    sortOrder: 3,
    isActive: true,
    subcategories: [
      { name: 'Houses for Sale', slug: 'houses-for-sale', description: 'Houses and homes for sale', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Apartments for Rent', slug: 'apartments-for-rent', description: 'Apartments and flats for rent', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Commercial Property', slug: 'commercial-property', description: 'Offices, shops, and commercial spaces', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Land for Sale', slug: 'land-for-sale', description: 'Plots and land for sale', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Home & Furniture',
    slug: 'home-furniture',
    icon: '🪑',
    description: 'Furniture and home decor items',
    sortOrder: 4,
    isActive: true,
    subcategories: [
      { name: 'Living Room Furniture', slug: 'living-room-furniture', description: 'Sofas, tables, and living room items', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Bedroom Furniture', slug: 'bedroom-furniture', description: 'Beds, wardrobes, and bedroom items', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Kitchen appliances and dining furniture', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Home Decor', slug: 'home-decor', description: 'Decoration and home accessories', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Fashion & Beauty',
    slug: 'fashion-beauty',
    icon: '👗',
    description: 'Clothing, shoes, and beauty products',
    sortOrder: 5,
    isActive: true,
    subcategories: [
      { name: 'Men\'s Clothing', slug: 'mens-clothing', description: 'Clothing for men', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Women\'s Clothing', slug: 'womens-clothing', description: 'Clothing for women', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Shoes & Footwear', slug: 'shoes-footwear', description: 'Shoes, boots, and sandals', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Beauty & Cosmetics', slug: 'beauty-cosmetics', description: 'Makeup, skincare, and beauty products', isActive: true, sortOrder: 4, customFields: [] },
      { name: 'Jewelry & Watches', slug: 'jewelry-watches', description: 'Jewelry, watches, and accessories', isActive: true, sortOrder: 5, customFields: [] }
    ]
  },
  {
    name: 'Babies & Kids',
    slug: 'babies-kids',
    icon: '👶',
    description: 'Baby and children\'s items',
    sortOrder: 6,
    isActive: true,
    subcategories: [
      { name: 'Baby Clothing', slug: 'baby-clothing', description: 'Clothing for babies and toddlers', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Kids Clothing', slug: 'kids-clothing', description: 'Clothing for children', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, games, and entertainment for kids', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Baby Gear', slug: 'baby-gear', description: 'Strollers, car seats, and baby equipment', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    icon: '🧰',
    description: 'Tools and equipment for various purposes',
    sortOrder: 7,
    isActive: true,
    subcategories: [
      { name: 'Hand Tools', slug: 'hand-tools', description: 'Manual tools and equipment', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Power Tools', slug: 'power-tools', description: 'Electric and power tools', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Garden Tools', slug: 'garden-tools', description: 'Gardening and landscaping tools', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Construction Equipment', slug: 'construction-equipment', description: 'Construction and building equipment', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Services',
    slug: 'services',
    icon: '💻',
    description: 'Professional services and freelance work',
    sortOrder: 8,
    isActive: true,
    subcategories: [
      { name: 'IT & Technology', slug: 'it-technology', description: 'Software, web development, and IT services', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Design & Creative', slug: 'design-creative', description: 'Graphic design, photography, and creative services', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Professional Services', slug: 'professional-services', description: 'Legal, accounting, and consulting services', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Home Services', slug: 'home-services', description: 'Cleaning, repair, and maintenance services', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Jobs',
    slug: 'jobs',
    icon: '💼',
    description: 'Job opportunities and employment',
    sortOrder: 9,
    isActive: true,
    subcategories: [
      { name: 'Full-time Jobs', slug: 'full-time-jobs', description: 'Full-time employment opportunities', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Part-time Jobs', slug: 'part-time-jobs', description: 'Part-time and temporary jobs', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Freelance Work', slug: 'freelance-work', description: 'Freelance and contract work', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Internships', slug: 'internships', description: 'Internship and training opportunities', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    icon: '⚽',
    description: 'Sports equipment and outdoor gear',
    sortOrder: 10,
    isActive: true,
    subcategories: [
      { name: 'Team Sports', slug: 'team-sports', description: 'Football, basketball, and team sports equipment', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Individual Sports', slug: 'individual-sports', description: 'Tennis, golf, and individual sports equipment', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Fitness Equipment', slug: 'fitness-equipment', description: 'Gym equipment and fitness gear', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Outdoor Gear', slug: 'outdoor-gear', description: 'Camping, hiking, and outdoor equipment', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Computers & Accessories',
    slug: 'computers-accessories',
    icon: '💻',
    description: 'Computer hardware and accessories',
    sortOrder: 11,
    isActive: true,
    subcategories: [
      { name: 'Desktop Computers', slug: 'desktop-computers', description: 'Desktop PCs and workstations', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Laptops', slug: 'laptops', description: 'Portable computers and notebooks', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Computer Parts', slug: 'computer-parts', description: 'Processors, RAM, and computer components', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Peripherals', slug: 'peripherals', description: 'Keyboards, mice, and computer accessories', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Kitchen Appliances',
    slug: 'kitchen-appliances',
    icon: '🍳',
    description: 'Kitchen and cooking appliances',
    sortOrder: 12,
    isActive: true,
    subcategories: [
      { name: 'Cooking Appliances', slug: 'cooking-appliances', description: 'Stoves, ovens, and cooking equipment', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Refrigeration', slug: 'refrigeration', description: 'Refrigerators and freezers', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Small Appliances', slug: 'small-appliances', description: 'Blenders, toasters, and small kitchen tools', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Kitchen Tools', slug: 'kitchen-tools', description: 'Utensils, cookware, and kitchen accessories', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Agriculture & Farming',
    slug: 'agriculture-farming',
    icon: '🌾',
    description: 'Agricultural equipment and farming supplies',
    sortOrder: 13,
    isActive: true,
    subcategories: [
      { name: 'Farming Equipment', slug: 'farming-equipment', description: 'Tractors and farming machinery', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Seeds & Plants', slug: 'seeds-plants', description: 'Seeds, seedlings, and plants', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Fertilizers', slug: 'fertilizers', description: 'Fertilizers and soil amendments', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Livestock', slug: 'livestock', description: 'Farm animals and livestock', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    icon: '📚',
    description: 'Books, stationery, and educational materials',
    sortOrder: 14,
    isActive: true,
    subcategories: [
      { name: 'Textbooks', slug: 'textbooks', description: 'Academic and educational books', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Fiction & Literature', slug: 'fiction-literature', description: 'Novels, poetry, and literature', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Stationery', slug: 'stationery', description: 'Pens, paper, and office supplies', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Educational Materials', slug: 'educational-materials', description: 'Study materials and learning resources', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    icon: '🏥',
    description: 'Health products and wellness items',
    sortOrder: 15,
    isActive: true,
    subcategories: [
      { name: 'Medical Equipment', slug: 'medical-equipment', description: 'Medical devices and equipment', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Supplements', slug: 'supplements', description: 'Vitamins, minerals, and health supplements', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Personal Care', slug: 'personal-care', description: 'Hygiene and personal care products', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Fitness & Wellness', slug: 'fitness-wellness', description: 'Fitness equipment and wellness products', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Pets & Animals',
    slug: 'pets-animals',
    icon: '🐕',
    description: 'Pets, animals, and pet supplies',
    sortOrder: 16,
    isActive: true,
    subcategories: [
      { name: 'Dogs', slug: 'dogs', description: 'Dogs for sale or adoption', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Cats', slug: 'cats', description: 'Cats for sale or adoption', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Other Pets', slug: 'other-pets', description: 'Other animals and pets', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Food, toys, and pet accessories', isActive: true, sortOrder: 4, customFields: [] }
    ]
  },
  {
    name: 'Entertainment & Hobbies',
    slug: 'entertainment-hobbies',
    icon: '🎮',
    description: 'Entertainment, hobbies, and leisure activities',
    sortOrder: 17,
    isActive: true,
    subcategories: [
      { name: 'Gaming', slug: 'gaming', description: 'Video games and gaming equipment', isActive: true, sortOrder: 1, customFields: [] },
      { name: 'Musical Instruments', slug: 'musical-instruments', description: 'Instruments and music equipment', isActive: true, sortOrder: 2, customFields: [] },
      { name: 'Arts & Crafts', slug: 'arts-crafts', description: 'Art supplies and craft materials', isActive: true, sortOrder: 3, customFields: [] },
      { name: 'Collectibles', slug: 'collectibles', description: 'Collectible items and memorabilia', isActive: true, sortOrder: 4, customFields: [] }
    ]
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/buysell';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const categories = await Category.insertMany(initialCategories);
    console.log(`Successfully seeded ${categories.length} categories`);

    // Log the created categories
    categories.forEach(category => {
      console.log(`- ${category.name} (${category.subcategories.length} subcategories)`);
    });

    console.log('Category seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seeder
seedCategories(); 