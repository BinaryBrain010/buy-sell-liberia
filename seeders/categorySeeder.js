"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var Category_1 = require("../models/Category");
function seedCategories() {
    return __awaiter(this, void 0, void 0, function () {
        var categories, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 7]);
                    // Connect to MongoDB
                    return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell', {
                            serverSelectionTimeoutMS: 5000,
                        })];
                case 1:
                    // Connect to MongoDB
                    _a.sent();
                    // Clear existing categories
                    return [4 /*yield*/, Category_1.default.deleteMany({})];
                case 2:
                    // Clear existing categories
                    _a.sent();
                    categories = [
                        {
                            name: 'Electronics',
                            slug: 'electronics',
                            icon: '📱',
                            description: 'Mobile phones, computers, and electronic devices',
                            sortOrder: 1,
                            isActive: true,
                            subcategories: [
                                { name: 'Mobile Phones', slug: 'mobile-phones', description: 'Smartphones and feature phones', customFields: [] },
                                { name: 'Tablets', slug: 'tablets', description: 'iPad, Android tablets, and other tablets', customFields: [] },
                                { name: 'Laptops & Computers', slug: 'laptops-computers', description: 'Laptops, desktops, and computer accessories', customFields: [] },
                                { name: 'Accessories', slug: 'accessories', description: 'Chargers, Headphones, etc.', customFields: [] },
                                { name: 'TVs & Home Entertainment', slug: 'tvs-home-entertainment', description: 'Televisions and entertainment systems', customFields: [] },
                                { name: 'Cameras & Drones', slug: 'cameras-drones', description: 'Photography and drone equipment', customFields: [] },
                                { name: 'Wearables', slug: 'wearables', description: 'Smartwatches, Fitness Bands', customFields: [] },
                            ],
                        },
                        {
                            name: 'Vehicles',
                            slug: 'vehicles',
                            icon: '🚗',
                            description: 'Cars, motorcycles, and other vehicles',
                            sortOrder: 2,
                            isActive: true,
                            subcategories: [
                                { name: 'Cars', slug: 'cars', description: 'Used and new cars for sale', customFields: [] },
                                { name: 'Motorcycles', slug: 'motorcycles', description: 'Motorcycles and bikes for sale', customFields: [] },
                                { name: 'Tricycles (Kekeh)', slug: 'tricycles', description: 'Three-wheeler vehicles', customFields: [] },
                                { name: 'Trucks & Buses', slug: 'trucks-buses', description: 'Commercial vehicles', customFields: [] },
                                { name: 'Vehicle Parts & Accessories', slug: 'vehicle-parts', description: 'Auto parts and accessories', customFields: [] },
                            ],
                        },
                        {
                            name: 'Real Estate',
                            slug: 'real-estate',
                            icon: '🏠',
                            description: 'Houses, apartments, and properties',
                            sortOrder: 3,
                            isActive: true,
                            subcategories: [
                                { name: 'Houses for Sale', slug: 'houses-for-sale', description: 'Houses and homes for sale', customFields: [] },
                                { name: 'Apartments for Rent', slug: 'apartments-for-rent', description: 'Apartments and flats for rent', customFields: [] },
                                { name: 'Commercial Property', slug: 'commercial-property', description: 'Offices, shops, and commercial spaces', customFields: [] },
                                { name: 'Land for Sale', slug: 'land-for-sale', description: 'Plots and land for sale', customFields: [] },
                                { name: 'Short-Term Rentals / Guest Houses', slug: 'short-term-rentals', description: 'Vacation rentals and guest houses', customFields: [] },
                            ],
                        },
                        {
                            name: 'Home & Furniture',
                            slug: 'home-furniture',
                            icon: '🪑',
                            description: 'Furniture and home decor items',
                            sortOrder: 4,
                            isActive: true,
                            subcategories: [
                                { name: 'Beds & Mattresses', slug: 'beds-mattresses', description: 'Bedroom furniture', customFields: [] },
                                { name: 'Sofas & Chairs', slug: 'sofas-chairs', description: 'Living room seating', customFields: [] },
                                { name: 'Dining Tables', slug: 'dining-tables', description: 'Dining room furniture', customFields: [] },
                                { name: 'Wardrobes', slug: 'wardrobes', description: 'Storage and closets', customFields: [] },
                                { name: 'Curtains & Decor', slug: 'curtains-decor', description: 'Home decoration items', customFields: [] },
                            ],
                        },
                        {
                            name: 'Fashion & Beauty',
                            slug: 'fashion-beauty',
                            icon: '🧺',
                            description: 'Clothing, shoes, and beauty products',
                            sortOrder: 5,
                            isActive: true,
                            subcategories: [
                                { name: "Men's Clothing", slug: 'mens-clothing', description: "Men's apparel", customFields: [] },
                                { name: "Women's Clothing", slug: 'womens-clothing', description: "Women's apparel", customFields: [] },
                                { name: 'Shoes (All genders)', slug: 'shoes', description: 'Footwear for everyone', customFields: [] },
                                { name: 'Bags & Accessories', slug: 'bags-accessories', description: 'Handbags and accessories', customFields: [] },
                                { name: 'Beauty Products & Tools', slug: 'beauty-products', description: 'Cosmetics and beauty tools', customFields: [] },
                                { name: 'Jewelry & Watches', slug: 'jewelry-watches', description: 'Jewelry and timepieces', customFields: [] },
                            ],
                        },
                        {
                            name: 'Babies & Kids',
                            slug: 'babies-kids',
                            icon: '👶',
                            description: "Baby and children's items",
                            sortOrder: 6,
                            isActive: true,
                            subcategories: [
                                { name: 'Baby Clothing', slug: 'baby-clothing', description: 'Infant and toddler clothes', customFields: [] },
                                { name: 'Toys & Games', slug: 'toys-games', description: "Children's toys and games", customFields: [] },
                                { name: 'Baby Gear', slug: 'baby-gear', description: 'Strollers, Car Seats', customFields: [] },
                                { name: "Children's Furniture", slug: 'childrens-furniture', description: 'Kids furniture', customFields: [] },
                                { name: 'School Supplies', slug: 'school-supplies', description: 'Educational materials', customFields: [] },
                            ],
                        },
                        {
                            name: 'Computers & Accessories',
                            slug: 'computers-accessories',
                            icon: '🖥️',
                            description: 'Computer hardware and accessories',
                            sortOrder: 7,
                            isActive: true,
                            subcategories: [
                                { name: 'Desktops & Monitors', slug: 'desktops-monitors', description: 'Desktop computers and displays', customFields: [] },
                                { name: 'Hard Drives & Storage', slug: 'storage', description: 'Storage devices', customFields: [] },
                                { name: 'Printers & Scanners', slug: 'printers-scanners', description: 'Printing equipment', customFields: [] },
                                { name: 'Networking Equipment', slug: 'networking', description: 'Routers, switches, etc.', customFields: [] },
                            ],
                        },
                        {
                            name: 'Tools & Equipment',
                            slug: 'tools-equipment',
                            icon: '🧰',
                            description: 'Tools and equipment for various purposes',
                            sortOrder: 8,
                            isActive: true,
                            subcategories: [
                                { name: 'Construction Tools', slug: 'construction-tools', description: 'Building and construction tools', customFields: [] },
                                { name: 'Power Tools', slug: 'power-tools', description: 'Electric and battery tools', customFields: [] },
                                { name: 'Gardening Equipment', slug: 'gardening-equipment', description: 'Garden tools and equipment', customFields: [] },
                                { name: 'Agricultural Tools', slug: 'agricultural-tools', description: 'Farm equipment', customFields: [] },
                            ],
                        },
                        {
                            name: 'Kitchen & Appliances',
                            slug: 'kitchen-appliances',
                            icon: '🍽️',
                            description: 'Kitchen appliances and utensils',
                            sortOrder: 9,
                            isActive: true,
                            subcategories: [
                                { name: 'Fridges & Freezers', slug: 'fridges-freezers', description: 'Refrigeration appliances', customFields: [] },
                                { name: 'Gas Cookers & Ovens', slug: 'cookers-ovens', description: 'Cooking appliances', customFields: [] },
                                { name: 'Blenders & Mixers', slug: 'blenders-mixers', description: 'Food preparation tools', customFields: [] },
                                { name: 'Kitchen Utensils', slug: 'kitchen-utensils', description: 'Cooking tools and utensils', customFields: [] },
                            ],
                        },
                        {
                            name: 'Agriculture & Farming',
                            slug: 'agriculture-farming',
                            icon: '🐄',
                            description: 'Agricultural products and livestock',
                            sortOrder: 10,
                            isActive: true,
                            subcategories: [
                                { name: 'Livestock', slug: 'livestock', description: 'Goats, Cows, etc.', customFields: [] },
                                { name: 'Poultry & Birds', slug: 'poultry-birds', description: 'Chickens, ducks, etc.', customFields: [] },
                                { name: 'Seeds & Plants', slug: 'seeds-plants', description: 'Agricultural seeds and plants', customFields: [] },
                                { name: 'Fertilizers & Pesticides', slug: 'fertilizers-pesticides', description: 'Farm chemicals', customFields: [] },
                            ],
                        },
                        {
                            name: 'Services',
                            slug: 'services',
                            icon: '💻',
                            description: 'Professional services and freelance work',
                            sortOrder: 11,
                            isActive: true,
                            subcategories: [
                                { name: 'Home Repairs & Maintenance', slug: 'home-repairs', description: 'Home repair services', customFields: [] },
                                { name: 'Event Planning', slug: 'event-planning', description: 'Event organization services', customFields: [] },
                                { name: 'Photography & Videography', slug: 'photography-videography', description: 'Media services', customFields: [] },
                                { name: 'Car Rental & Transport', slug: 'car-rental-transport', description: 'Transportation services', customFields: [] },
                                { name: 'Graphic Design & Printing', slug: 'graphic-design-printing', description: 'Design and printing services', customFields: [] },
                                { name: 'Computer Repairs', slug: 'computer-repairs', description: 'Tech repair services', customFields: [] },
                            ],
                        },
                        {
                            name: 'Jobs',
                            slug: 'jobs',
                            icon: '💼',
                            description: 'Job opportunities and employment',
                            sortOrder: 12,
                            isActive: true,
                            subcategories: [
                                { name: 'Full-time Jobs', slug: 'full-time-jobs', description: 'Permanent employment', customFields: [] },
                                { name: 'Part-time Jobs', slug: 'part-time-jobs', description: 'Part-time employment', customFields: [] },
                                { name: 'Freelance & Remote Jobs', slug: 'freelance-remote-jobs', description: 'Freelance work', customFields: [] },
                                { name: 'Internships', slug: 'internships', description: 'Internship opportunities', customFields: [] },
                            ],
                        },
                        {
                            name: 'Books & Stationery',
                            slug: 'books-stationery',
                            icon: '📚',
                            description: 'Books and stationery items',
                            sortOrder: 13,
                            isActive: true,
                            subcategories: [
                                { name: 'Educational Books', slug: 'educational-books', description: 'Academic and educational books', customFields: [] },
                                { name: 'Novels', slug: 'novels', description: 'Fiction and literature', customFields: [] },
                                { name: 'Office Supplies', slug: 'office-supplies', description: 'Office stationery', customFields: [] },
                                { name: 'School Textbooks', slug: 'school-textbooks', description: 'School curriculum books', customFields: [] },
                            ],
                        },
                        {
                            name: 'Health & Wellness',
                            slug: 'health-wellness',
                            icon: '🧺',
                            description: 'Health and wellness products',
                            sortOrder: 14,
                            isActive: true,
                            subcategories: [
                                { name: 'Fitness Equipment', slug: 'fitness-equipment', description: 'Exercise equipment', customFields: [] },
                                { name: 'Herbal Medicine', slug: 'herbal-medicine', description: 'Natural health products', customFields: [] },
                                { name: 'Supplements', slug: 'supplements', description: 'Health supplements', customFields: [] },
                                { name: 'Medical Equipment', slug: 'medical-equipment', description: 'Medical devices', customFields: [] },
                            ],
                        },
                        {
                            name: 'Pets & Animals',
                            slug: 'pets-animals',
                            icon: '🐶',
                            description: 'Pets and animal-related products',
                            sortOrder: 15,
                            isActive: true,
                            subcategories: [
                                { name: 'Dogs & Cats', slug: 'dogs-cats', description: 'Pet dogs and cats', customFields: [] },
                                { name: 'Pet Accessories', slug: 'pet-accessories', description: 'Pet supplies and accessories', customFields: [] },
                                { name: 'Fish & Birds', slug: 'fish-birds', description: 'Aquatic pets and birds', customFields: [] },
                                { name: 'Pet Food', slug: 'pet-food', description: 'Animal food and treats', customFields: [] },
                            ],
                        },
                        {
                            name: 'Entertainment & Hobbies',
                            slug: 'entertainment-hobbies',
                            icon: '🎮',
                            description: 'Entertainment and hobby items',
                            sortOrder: 16,
                            isActive: true,
                            subcategories: [
                                { name: 'Gaming Consoles & Games', slug: 'gaming', description: 'Video games and consoles', customFields: [] },
                                { name: 'Musical Instruments', slug: 'musical-instruments', description: 'Music equipment', customFields: [] },
                                { name: 'Board Games', slug: 'board-games', description: 'Table games and puzzles', customFields: [] },
                                { name: 'Art & Craft Supplies', slug: 'art-craft-supplies', description: 'Creative supplies', customFields: [] },
                            ],
                        },
                        {
                            name: 'Sports & Outdoors',
                            slug: 'sports-outdoors',
                            icon: '🏍️',
                            description: 'Sports equipment and outdoor gear',
                            sortOrder: 17,
                            isActive: true,
                            subcategories: [
                                { name: 'Bicycles', slug: 'bicycles', description: 'Bikes and cycling equipment', customFields: [] },
                                { name: 'Gym Equipment', slug: 'gym-equipment', description: 'Fitness equipment', customFields: [] },
                                { name: 'Camping Gear', slug: 'camping-gear', description: 'Outdoor camping equipment', customFields: [] },
                                { name: 'Sporting Goods', slug: 'sporting-goods', description: 'Sports equipment', customFields: [] },
                            ],
                        },
                    ];
                    // Insert categories into database
                    return [4 /*yield*/, Category_1.default.insertMany(categories)];
                case 3:
                    // Insert categories into database
                    _a.sent();
                    console.log('Categories and subcategories seeded successfully');
                    return [3 /*break*/, 7];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error seeding categories:', error_1);
                    throw error_1;
                case 5: 
                // Disconnect from MongoDB
                return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 6:
                    // Disconnect from MongoDB
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Run the seeder
seedCategories().then(function () {
    console.log('Seeding process completed');
    process.exit(0);
}).catch(function (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
});
