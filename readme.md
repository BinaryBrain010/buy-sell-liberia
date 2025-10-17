# BuySell Liberia

A comprehensive online marketplace for buying and selling goods in Liberia.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/BinaryBrain010/buy-sell-liberia.git
   cd buy-sell-liberia
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   - Copy `.env.example` to `.env` (if available) or create a `.env` file
   - Update the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Seed the database with categories:**

   ```bash
   node seeders/categories-seeder.js
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Setup

### Categories Seeder

The application includes a comprehensive categories seeder that populates your database with 17 main categories and their subcategories, specifically tailored for the Liberian marketplace.

#### Running the Categories Seeder

```bash
node seeders/categories-seeder.js
```

#### What Gets Seeded

The seeder creates **17 categories** with a total of **68 subcategories**:

1. **📱 Electronics** (5 subcategories) - Mobile phones, tablets, laptops, TVs, accessories
2. **🚗 Vehicles** (3 subcategories) - Cars, motorcycles, auto parts
3. **👗 Fashion & Beauty** (4 subcategories) - Men's, women's, children's fashion, beauty products
4. **🏠 Home & Garden** (4 subcategories) - Furniture, appliances, decor, garden items
5. **🏘️ Real Estate** (5 subcategories) - Houses for sale/rent, apartments, commercial property, land
6. **💼 Jobs** (4 subcategories) - Full-time, part-time, freelance, internships
7. **🔧 Services** (6 subcategories) - Construction, transportation, cleaning, IT, education, beauty services
8. **🌾 Food & Agriculture** (4 subcategories) - Fresh produce, livestock, farm equipment, seeds
9. **⚽ Sports & Recreation** (3 subcategories) - Fitness equipment, team sports, outdoor activities
10. **📚 Books & Education** (3 subcategories) - Academic books, general books, educational supplies
11. **👶 Baby & Kids** (3 subcategories) - Baby care, baby gear, toys & games
12. **🐕 Pets & Animals** (4 subcategories) - Dogs, cats, other pets, pet services
13. **⚕️ Health & Medical** (3 subcategories) - Medical equipment, wellness products, personal care
14. **🎨 Arts & Entertainment** (4 subcategories) - Musical instruments, art supplies, games, movies
15. **🏭 Business & Industrial** (4 subcategories) - Office supplies, industrial equipment, restaurant equipment, security
16. **✈️ Travel & Tourism** (4 subcategories) - Tour packages, accommodation, transportation services, travel accessories
17. **🎪 Community & Events** (5 subcategories) - Event planning, venue rentals, photography, music & entertainment, community services

#### Features of the Seeder

- **✅ Custom Fields**: Each subcategory includes relevant custom form fields for detailed product listings
- **📱 Mobile-First**: Includes popular brands like Tecno, Infinix, and Itel (popular in Liberia)
- **🏘️ Local Context**: Categories tailored for Liberian market needs
- **🖼️ Placeholder Support**: Uses `/placeholder.jpg` for all subcategory images
- **🔧 Validation**: Includes proper field validation and required field specifications

#### Verifying the Seeder

To check if categories were successfully seeded:

```bash
node scripts/check-categories.js
```

This will display:

- Total number of categories
- List of all categories with subcategory counts
- Database connection information
- Confirmation that data is in the correct database

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `node seeders/categories-seeder.js` - Seed database with categories
- `node scripts/check-categories.js` - Verify seeded categories

## 🏗️ Project Structure

```
├── app/                    # Next.js 13+ app directory
├── components/            # React components
├── lib/                   # Utility libraries
├── models/               # MongoDB/Mongoose models
├── public/               # Static assets
├── seeders/              # Database seeders
├── scripts/              # Utility scripts
├── styles/               # CSS styles
└── types/                # TypeScript type definitions
```

## 🌍 Liberian Marketplace Features

This platform is specifically designed for the Liberian market with:

- **Local Categories**: Categories relevant to Liberian commerce
- **Popular Brands**: Includes brands commonly used in Liberia
- **Real Estate**: Tailored for Liberian property market
- **Agriculture**: Support for Liberian farming and livestock
- **Services**: Local service categories
- **Tourism**: Support for Liberia's growing tourism industry

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact: info@buysellliberia.com

---

**BuySell Liberia** - Connecting buyers and sellers across Liberia 🇱🇷

---

Additional docs:

- Monetization flows (plans, payments, bumps, featured, verification): see docs/MONETIZATION_INTEGRATION_README.md
