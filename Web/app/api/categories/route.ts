import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Mock categories data as fallback - ALL categories from client's list
const mockCategories = [
  {
    _id: '1',
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    description: 'Mobile phones, computers, and electronic devices',
    sortOrder: 1,
    totalCount: 2543,
    subcategories: [
      { _id: '1-1', name: 'Mobile Phones', slug: 'mobile-phones', description: 'Smartphones and feature phones', customFields: [] },
      { _id: '1-2', name: 'Tablets', slug: 'tablets', description: 'iPad, Android tablets, and other tablets', customFields: [] },
      { _id: '1-3', name: 'Laptops & Computers', slug: 'laptops-computers', description: 'Laptops, desktops, and computer accessories', customFields: [] },
      { _id: '1-4', name: 'Accessories', slug: 'accessories', description: 'Chargers, Headphones, etc.', customFields: [] },
      { _id: '1-5', name: 'TVs & Home Entertainment', slug: 'tvs-home-entertainment', description: 'Televisions and entertainment systems', customFields: [] },
      { _id: '1-6', name: 'Cameras & Drones', slug: 'cameras-drones', description: 'Photography and drone equipment', customFields: [] },
      { _id: '1-7', name: 'Wearables', slug: 'wearables', description: 'Smartwatches, Fitness Bands', customFields: [] }
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
      { _id: '2-1', name: 'Cars', slug: 'cars', description: 'Used and new cars for sale', customFields: [] },
      { _id: '2-2', name: 'Motorcycles', slug: 'motorcycles', description: 'Motorcycles and bikes for sale', customFields: [] },
      { _id: '2-3', name: 'Tricycles (Kekeh)', slug: 'tricycles', description: 'Three-wheeler vehicles', customFields: [] },
      { _id: '2-4', name: 'Trucks & Buses', slug: 'trucks-buses', description: 'Commercial vehicles', customFields: [] },
      { _id: '2-5', name: 'Vehicle Parts & Accessories', slug: 'vehicle-parts', description: 'Auto parts and accessories', customFields: [] }
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
      { _id: '3-1', name: 'Houses for Sale', slug: 'houses-for-sale', description: 'Houses and homes for sale', customFields: [] },
      { _id: '3-2', name: 'Apartments for Rent', slug: 'apartments-for-rent', description: 'Apartments and flats for rent', customFields: [] },
      { _id: '3-3', name: 'Commercial Property', slug: 'commercial-property', description: 'Offices, shops, and commercial spaces', customFields: [] },
      { _id: '3-4', name: 'Land for Sale', slug: 'land-for-sale', description: 'Plots and land for sale', customFields: [] },
      { _id: '3-5', name: 'Short-Term Rentals / Guest Houses', slug: 'short-term-rentals', description: 'Vacation rentals and guest houses', customFields: [] }
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
    subcategories: [
      { _id: '4-1', name: 'Beds & Mattresses', slug: 'beds-mattresses', description: 'Bedroom furniture', customFields: [] },
      { _id: '4-2', name: 'Sofas & Chairs', slug: 'sofas-chairs', description: 'Living room seating', customFields: [] },
      { _id: '4-3', name: 'Dining Tables', slug: 'dining-tables', description: 'Dining room furniture', customFields: [] },
      { _id: '4-4', name: 'Wardrobes', slug: 'wardrobes', description: 'Storage and closets', customFields: [] },
      { _id: '4-5', name: 'Curtains & Decor', slug: 'curtains-decor', description: 'Home decoration items', customFields: [] }
    ],
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
    subcategories: [
      { _id: '5-1', name: 'Men\'s Clothing', slug: 'mens-clothing', description: 'Men\'s apparel', customFields: [] },
      { _id: '5-2', name: 'Women\'s Clothing', slug: 'womens-clothing', description: 'Women\'s apparel', customFields: [] },
      { _id: '5-3', name: 'Shoes (All genders)', slug: 'shoes', description: 'Footwear for everyone', customFields: [] },
      { _id: '5-4', name: 'Bags & Accessories', slug: 'bags-accessories', description: 'Handbags and accessories', customFields: [] },
      { _id: '5-5', name: 'Beauty Products & Tools', slug: 'beauty-products', description: 'Cosmetics and beauty tools', customFields: [] },
      { _id: '5-6', name: 'Jewelry & Watches', slug: 'jewelry-watches', description: 'Jewelry and timepieces', customFields: [] }
    ],
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
    subcategories: [
      { _id: '6-1', name: 'Baby Clothing', slug: 'baby-clothing', description: 'Infant and toddler clothes', customFields: [] },
      { _id: '6-2', name: 'Toys & Games', slug: 'toys-games', description: 'Children\'s toys and games', customFields: [] },
      { _id: '6-3', name: 'Baby Gear', slug: 'baby-gear', description: 'Strollers, Car Seats', customFields: [] },
      { _id: '6-4', name: 'Children\'s Furniture', slug: 'childrens-furniture', description: 'Kids furniture', customFields: [] },
      { _id: '6-5', name: 'School Supplies', slug: 'school-supplies', description: 'Educational materials', customFields: [] }
    ],
    products: []
  },
  {
    _id: '7',
    name: 'Computers & Accessories',
    slug: 'computers-accessories',
    icon: '🖥️',
    description: 'Computer hardware and accessories',
    sortOrder: 7,
    totalCount: 1234,
    subcategories: [
      { _id: '7-1', name: 'Desktops & Monitors', slug: 'desktops-monitors', description: 'Desktop computers and displays', customFields: [] },
      { _id: '7-2', name: 'Hard Drives & Storage', slug: 'storage', description: 'Storage devices', customFields: [] },
      { _id: '7-3', name: 'Printers & Scanners', slug: 'printers-scanners', description: 'Printing equipment', customFields: [] },
      { _id: '7-4', name: 'Networking Equipment', slug: 'networking', description: 'Routers, switches, etc.', customFields: [] }
    ],
    products: []
  },
  {
    _id: '8',
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    icon: '🧰',
    description: 'Tools and equipment for various purposes',
    sortOrder: 8,
    totalCount: 432,
    subcategories: [
      { _id: '8-1', name: 'Construction Tools', slug: 'construction-tools', description: 'Building and construction tools', customFields: [] },
      { _id: '8-2', name: 'Power Tools', slug: 'power-tools', description: 'Electric and battery tools', customFields: [] },
      { _id: '8-3', name: 'Gardening Equipment', slug: 'gardening-equipment', description: 'Garden tools and equipment', customFields: [] },
      { _id: '8-4', name: 'Agricultural Tools', slug: 'agricultural-tools', description: 'Farm equipment', customFields: [] }
    ],
    products: []
  },
  {
    _id: '9',
    name: 'Kitchen & Appliances',
    slug: 'kitchen-appliances',
    icon: '🍽️',
    description: 'Kitchen appliances and utensils',
    sortOrder: 9,
    totalCount: 876,
    subcategories: [
      { _id: '9-1', name: 'Fridges & Freezers', slug: 'fridges-freezers', description: 'Refrigeration appliances', customFields: [] },
      { _id: '9-2', name: 'Gas Cookers & Ovens', slug: 'cookers-ovens', description: 'Cooking appliances', customFields: [] },
      { _id: '9-3', name: 'Blenders & Mixers', slug: 'blenders-mixers', description: 'Food preparation tools', customFields: [] },
      { _id: '9-4', name: 'Kitchen Utensils', slug: 'kitchen-utensils', description: 'Cooking tools and utensils', customFields: [] }
    ],
    products: []
  },
  {
    _id: '10',
    name: 'Agriculture & Farming',
    slug: 'agriculture-farming',
    icon: '🐄',
    description: 'Agricultural products and livestock',
    sortOrder: 10,
    totalCount: 567,
    subcategories: [
      { _id: '10-1', name: 'Livestock', slug: 'livestock', description: 'Goats, Cows, etc.', customFields: [] },
      { _id: '10-2', name: 'Poultry & Birds', slug: 'poultry-birds', description: 'Chickens, ducks, etc.', customFields: [] },
      { _id: '10-3', name: 'Seeds & Plants', slug: 'seeds-plants', description: 'Agricultural seeds and plants', customFields: [] },
      { _id: '10-4', name: 'Fertilizers & Pesticides', slug: 'fertilizers-pesticides', description: 'Farm chemicals', customFields: [] }
    ],
    products: []
  },
  {
    _id: '11',
    name: 'Services',
    slug: 'services',
    icon: '💻',
    description: 'Professional services and freelance work',
    sortOrder: 11,
    totalCount: 789,
    subcategories: [
      { _id: '11-1', name: 'Home Repairs & Maintenance', slug: 'home-repairs', description: 'Home repair services', customFields: [] },
      { _id: '11-2', name: 'Event Planning', slug: 'event-planning', description: 'Event organization services', customFields: [] },
      { _id: '11-3', name: 'Photography & Videography', slug: 'photography-videography', description: 'Media services', customFields: [] },
      { _id: '11-4', name: 'Car Rental & Transport', slug: 'car-rental-transport', description: 'Transportation services', customFields: [] },
      { _id: '11-5', name: 'Graphic Design & Printing', slug: 'graphic-design-printing', description: 'Design and printing services', customFields: [] },
      { _id: '11-6', name: 'Computer Repairs', slug: 'computer-repairs', description: 'Tech repair services', customFields: [] }
    ],
    products: []
  },
  {
    _id: '12',
    name: 'Jobs',
    slug: 'jobs',
    icon: '💼',
    description: 'Job opportunities and employment',
    sortOrder: 12,
    totalCount: 245,
    subcategories: [
      { _id: '12-1', name: 'Full-time Jobs', slug: 'full-time-jobs', description: 'Permanent employment', customFields: [] },
      { _id: '12-2', name: 'Part-time Jobs', slug: 'part-time-jobs', description: 'Part-time employment', customFields: [] },
      { _id: '12-3', name: 'Freelance & Remote Jobs', slug: 'freelance-remote-jobs', description: 'Freelance work', customFields: [] },
      { _id: '12-4', name: 'Internships', slug: 'internships', description: 'Internship opportunities', customFields: [] }
    ],
    products: []
  },
  {
    _id: '13',
    name: 'Books & Stationery',
    slug: 'books-stationery',
    icon: '📚',
    description: 'Books and stationery items',
    sortOrder: 13,
    totalCount: 432,
    subcategories: [
      { _id: '13-1', name: 'Educational Books', slug: 'educational-books', description: 'Academic and educational books', customFields: [] },
      { _id: '13-2', name: 'Novels', slug: 'novels', description: 'Fiction and literature', customFields: [] },
      { _id: '13-3', name: 'Office Supplies', slug: 'office-supplies', description: 'Office stationery', customFields: [] },
      { _id: '13-4', name: 'School Textbooks', slug: 'school-textbooks', description: 'School curriculum books', customFields: [] }
    ],
    products: []
  },
  {
    _id: '14',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    icon: '🧺',
    description: 'Health and wellness products',
    sortOrder: 14,
    totalCount: 345,
    subcategories: [
      { _id: '14-1', name: 'Fitness Equipment', slug: 'fitness-equipment', description: 'Exercise equipment', customFields: [] },
      { _id: '14-2', name: 'Herbal Medicine', slug: 'herbal-medicine', description: 'Natural health products', customFields: [] },
      { _id: '14-3', name: 'Supplements', slug: 'supplements', description: 'Health supplements', customFields: [] },
      { _id: '14-4', name: 'Medical Equipment', slug: 'medical-equipment', description: 'Medical devices', customFields: [] }
    ],
    products: []
  },
  {
    _id: '15',
    name: 'Pets & Animals',
    slug: 'pets-animals',
    icon: '🐶',
    description: 'Pets and animal-related products',
    sortOrder: 15,
    totalCount: 234,
    subcategories: [
      { _id: '15-1', name: 'Dogs & Cats', slug: 'dogs-cats', description: 'Pet dogs and cats', customFields: [] },
      { _id: '15-2', name: 'Pet Accessories', slug: 'pet-accessories', description: 'Pet supplies and accessories', customFields: [] },
      { _id: '15-3', name: 'Fish & Birds', slug: 'fish-birds', description: 'Aquatic pets and birds', customFields: [] },
      { _id: '15-4', name: 'Pet Food', slug: 'pet-food', description: 'Animal food and treats', customFields: [] }
    ],
    products: []
  },
  {
    _id: '16',
    name: 'Entertainment & Hobbies',
    slug: 'entertainment-hobbies',
    icon: '🎮',
    description: 'Entertainment and hobby items',
    sortOrder: 16,
    totalCount: 567,
    subcategories: [
      { _id: '16-1', name: 'Gaming Consoles & Games', slug: 'gaming', description: 'Video games and consoles', customFields: [] },
      { _id: '16-2', name: 'Musical Instruments', slug: 'musical-instruments', description: 'Music equipment', customFields: [] },
      { _id: '16-3', name: 'Board Games', slug: 'board-games', description: 'Table games and puzzles', customFields: [] },
      { _id: '16-4', name: 'Art & Craft Supplies', slug: 'art-craft-supplies', description: 'Creative supplies', customFields: [] }
    ],
    products: []
  },
  {
    _id: '17',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    icon: '🏍️',
    description: 'Sports equipment and outdoor gear',
    sortOrder: 17,
    totalCount: 678,
    subcategories: [
      { _id: '17-1', name: 'Bicycles', slug: 'bicycles', description: 'Bikes and cycling equipment', customFields: [] },
      { _id: '17-2', name: 'Gym Equipment', slug: 'gym-equipment', description: 'Fitness equipment', customFields: [] },
      { _id: '17-3', name: 'Camping Gear', slug: 'camping-gear', description: 'Outdoor camping equipment', customFields: [] },
      { _id: '17-4', name: 'Sporting Goods', slug: 'sporting-goods', description: 'Sports equipment', customFields: [] }
    ],
    products: []
  }
];

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data immediately
    // TODO: Replace with actual database integration later
    
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const limit = parseInt(searchParams.get('limit') || '6');

    // Return mock categories
    return NextResponse.json({ 
      categories: mockCategories,
      message: 'Using mock data - database integration pending'
    });

  } catch (error) {
    console.error('Categories API error:', error);
    // Even if there's an error, return mock data
    return NextResponse.json({ 
      categories: mockCategories,
      message: 'Fallback to mock data due to error'
    });
  }
}
