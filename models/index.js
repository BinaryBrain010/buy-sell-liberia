/**
 * Database Models Index
 * 
 * This file exports all the database models and provides
 * utility functions for the marketplace system.
 */

// Import all models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Review = require('./Review');

// Export models
module.exports = {
  User,
  Category,
  Product,
  Review,
  
  // Utility functions
  models: {
    User,
    Category,
    Product,
    Review
  },
  
  // Database utilities
  utils: {
    /**
     * Initialize database with indexes
     */
    async initializeDatabase() {
      try {
        console.log('🔧 Initializing database indexes...');
        
        // Ensure indexes are created for all models
        await Promise.all([
          User.createIndexes(),
          Category.createIndexes(),
          Product.createIndexes(),
          Review.createIndexes()
        ]);
        
        console.log('✅ Database indexes initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing database indexes:', error);
        throw error;
      }
    },
    
    /**
     * Clean up expired products
     */
    async cleanupExpiredProducts() {
      try {
        const expiredCount = await Product.autoExpireProducts();
        console.log(`🧹 Cleaned up ${expiredCount} expired products`);
        return expiredCount;
      } catch (error) {
        console.error('❌ Error cleaning up expired products:', error);
        throw error;
      }
    },
    
    /**
     * Update user statistics
     */
    async updateUserStats(userId) {
      try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        
        // Count user's products
        const totalListings = await Product.countDocuments({ user_id: userId });
        const activeListings = await Product.countDocuments({ 
          user_id: userId, 
          status: 'active',
          expires_at: { $gt: new Date() }
        });
        const soldItems = await Product.countDocuments({ 
          user_id: userId, 
          status: 'sold'
        });
        
        // Update user activity
        await user.updateActivity({
          totalListings,
          activeListings,
          soldItems
        });
        
        console.log(`📊 Updated stats for user ${userId}`);
        return { totalListings, activeListings, soldItems };
      } catch (error) {
        console.error('❌ Error updating user stats:', error);
        throw error;
      }
    },
    
    /**
     * Get marketplace statistics
     */
    async getMarketplaceStats() {
      try {
        const [
          totalUsers,
          totalProducts,
          activeProducts,
          totalCategories,
          totalReviews
        ] = await Promise.all([
          User.countDocuments({ isActive: true }),
          Product.countDocuments(),
          Product.countDocuments({ 
            status: 'active',
            expires_at: { $gt: new Date() }
          }),
          Category.countDocuments({ isActive: true }),
          Review.countDocuments()
        ]);
        
        // Get top categories by product count
        const topCategories = await Product.aggregate([
          { 
            $match: { 
              status: 'active',
              expires_at: { $gt: new Date() }
            }
          },
          {
            $group: {
              _id: '$category_id',
              count: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: '$category' },
          {
            $project: {
              name: '$category.name',
              icon: '$category.icon',
              count: 1
            }
          },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);
        
        return {
          totalUsers,
          totalProducts,
          activeProducts,
          totalCategories,
          totalReviews,
          topCategories
        };
      } catch (error) {
        console.error('❌ Error getting marketplace stats:', error);
        throw error;
      }
    },
    
    /**
     * Search products with advanced filters
     */
    async advancedProductSearch(searchParams) {
      try {
        const {
          query,
          category_id,
          subcategory_id,
          location,
          priceMin,
          priceMax,
          customFilters,
          sortBy = 'created_at',
          sortOrder = -1,
          page = 1,
          limit = 20
        } = searchParams;
        
        // Build search criteria
        const searchCriteria = {
          status: 'active',
          expires_at: { $gt: new Date() }
        };
        
        // Add text search
        if (query) {
          searchCriteria.$text = { $search: query };
        }
        
        // Add category filters
        if (category_id) {
          searchCriteria.category_id = category_id;
        }
        if (subcategory_id) {
          searchCriteria.subcategory_id = subcategory_id;
        }
        
        // Add location filter
        if (location) {
          searchCriteria['location.city'] = new RegExp(location, 'i');
        }
        
        // Add price range
        if (priceMin !== undefined || priceMax !== undefined) {
          searchCriteria['price.amount'] = {};
          if (priceMin !== undefined) searchCriteria['price.amount'].$gte = priceMin;
          if (priceMax !== undefined) searchCriteria['price.amount'].$lte = priceMax;
        }
        
        // Add custom filters
        if (customFilters && Object.keys(customFilters).length > 0) {
          Object.entries(customFilters).forEach(([fieldName, value]) => {
            if (value !== undefined && value !== '') {
              searchCriteria[`customFields.fieldName`] = fieldName;
              searchCriteria[`customFields.value`] = value;
            }
          });
        }
        
        // Calculate skip for pagination
        const skip = (page - 1) * limit;
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder;
        
        // If text search, add text score sorting
        if (query) {
          sort.score = { $meta: 'textScore' };
        }
        
        // Execute search
        const [products, totalCount] = await Promise.all([
          Product.find(searchCriteria)
            .populate('user_id', 'firstName lastName profile.displayName profile.avatar profile.rating')
            .populate('category_id', 'name slug icon')
            .sort(sort)
            .skip(skip)
            .limit(limit),
          Product.countDocuments(searchCriteria)
        ]);
        
        return {
          products,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1
          }
        };
      } catch (error) {
        console.error('❌ Error in advanced product search:', error);
        throw error;
      }
    }
  }
};
