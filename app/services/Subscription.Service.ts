import UserSubscription from "../../models/UserSubscription";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import User from "../../models/User";
import mongoose from "mongoose";

export class SubscriptionService {
  /**
   * Get all active subscription plans
   */
  async getActivePlans() {
    return await SubscriptionPlan.findActivePlans();
  }

  /**
   * Get subscription plan by type
   */
  async getPlanByType(type: "basic" | "pro" | "vip") {
    return await SubscriptionPlan.findByType(type);
  }

  /**
   * Get user's active subscription
   */
  async getUserActiveSubscription(userId: string) {
    return await UserSubscription.findActiveByUser(new mongoose.Types.ObjectId(userId));
  }

  /**
   * Get user's subscription history
   */
  async getUserSubscriptionHistory(userId: string, limit = 10) {
    return await UserSubscription.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .populate("plan", "name type description features")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Create a new subscription request
   */
  async createSubscriptionRequest(
    userId: string,
    planType: "basic" | "pro" | "vip",
    paymentData: {
      method: "MTN" | "Orange" | "Bank" | "manual";
      transactionId: string;
      screenshot: string;
      notes?: string;
    }
  ) {
    const plan = await this.getPlanByType(planType);
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.getUserActiveSubscription(userId);
    if (existingSubscription) {
      throw new Error("User already has an active subscription");
    }

    // Check if user has a pending subscription for the same plan
    const pendingSubscription = await UserSubscription.findOne({
      user: new mongoose.Types.ObjectId(userId),
      planType,
      status: "pending",
    });
    if (pendingSubscription) {
      throw new Error("User already has a pending subscription request for this plan");
    }

    // Calculate subscription dates
    const now = new Date();
    const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // Create subscription
    const subscription = await UserSubscription.create({
      user: new mongoose.Types.ObjectId(userId),
      plan: plan._id,
      planType: plan.type,
      status: "pending",
      paymentStatus: "pending",
      startDate: now,
      endDate,
      autoRenew: true,
      adsUsed: 0,
      featuredAdsUsed: 0,
      homepageBannerUsed: false,
      amount: plan.price,
      currency: "LD",
      paymentMethod: paymentData.method,
      transactionId: paymentData.transactionId,
      paymentScreenshot: paymentData.screenshot,
      paymentNotes: paymentData.notes,
      renewalCount: 0,
    });

    return subscription;
  }

  /**
   * Approve a subscription request
   */
  async approveSubscription(subscriptionId: string, adminUserId: string, adminNotes?: string) {
    const subscription = await UserSubscription.findById(subscriptionId)
      .populate("user", "fullName username email")
      .populate("plan", "name type description");

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "pending") {
      throw new Error("Subscription is not in pending status");
    }

    // Check if user already has an active subscription
    const existingActiveSubscription = await this.getUserActiveSubscription(subscription.user._id.toString());
    if (existingActiveSubscription) {
      throw new Error("User already has an active subscription");
    }

    // Approve the subscription
    subscription.status = "active";
    subscription.paymentStatus = "paid";
    subscription.approvedBy = new mongoose.Types.ObjectId(adminUserId);
    subscription.approvedAt = new Date();
    subscription.adminNotes = adminNotes;

    await subscription.save();

    return subscription;
  }

  /**
   * Reject a subscription request
   */
  async rejectSubscription(
    subscriptionId: string,
    adminUserId: string,
    reason: string,
    adminNotes?: string
  ) {
    const subscription = await UserSubscription.findById(subscriptionId)
      .populate("user", "fullName username email")
      .populate("plan", "name type description");

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "pending") {
      throw new Error("Subscription is not in pending status");
    }

    // Reject the subscription
    subscription.status = "cancelled";
    subscription.paymentStatus = "failed";
    subscription.cancelledBy = new mongoose.Types.ObjectId(adminUserId);
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;
    subscription.adminNotes = adminNotes;

    await subscription.save();

    return subscription;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelledBy: string,
    reason?: string
  ) {
    const subscription = await UserSubscription.findById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "active") {
      throw new Error("Only active subscriptions can be cancelled");
    }

    return await subscription.cancel(new mongoose.Types.ObjectId(cancelledBy), reason);
  }

  /**
   * Renew a subscription
   */
  async renewSubscription(subscriptionId: string) {
    const subscription = await UserSubscription.findById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "active") {
      throw new Error("Only active subscriptions can be renewed");
    }

    return await subscription.renew();
  }

  /**
   * Check if user can post an ad
   */
  async canUserPostAd(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);

    if (subscription) {
      return {
        canPost: subscription.canPostAd(),
        remainingAds: subscription.getRemainingAds(),
        planType: subscription.planType,
        adsUsed: subscription.adsUsed,
      };
    } else {
      // Check default limit for non-subscribed users (5 ads per month)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const adsThisMonth = await mongoose.model("Product").countDocuments({
        user_id: new mongoose.Types.ObjectId(userId),
        created_at: { $gte: currentMonth, $lt: nextMonth },
        status: { $ne: "removed" },
      });

      return {
        canPost: adsThisMonth < 5,
        remainingAds: Math.max(0, 5 - adsThisMonth),
        planType: null,
        adsUsed: adsThisMonth,
      };
    }
  }

  /**
   * Check if user can use featured ad
   */
  async canUserUseFeaturedAd(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);

    if (!subscription) {
      return {
        canUse: false,
        remainingFeaturedAds: 0,
        planType: null,
        featuredAdsUsed: 0,
      };
    }

    return {
      canUse: subscription.canUseFeaturedAd(),
      remainingFeaturedAds: subscription.getRemainingFeaturedAds(),
      planType: subscription.planType,
      featuredAdsUsed: subscription.featuredAdsUsed,
    };
  }

  /**
   * Check if user can use homepage banner
   */
  async canUserUseHomepageBanner(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);

    if (!subscription) {
      return {
        canUse: false,
        planType: null,
        homepageBannerUsed: false,
      };
    }

    return {
      canUse: subscription.canUseHomepageBanner(),
      planType: subscription.planType,
      homepageBannerUsed: subscription.homepageBannerUsed,
    };
  }

  /**
   * Increment ad usage
   */
  async incrementAdUsage(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    if (!subscription.canPostAd()) {
      throw new Error("Ad limit reached for current subscription");
    }

    return await subscription.incrementAdUsage();
  }

  /**
   * Increment featured ad usage
   */
  async incrementFeaturedAdUsage(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    if (!subscription.canUseFeaturedAd()) {
      throw new Error("Featured ad limit reached for current subscription");
    }

    return await subscription.incrementFeaturedAdUsage();
  }

  /**
   * Use homepage banner
   */
  async useHomepageBanner(userId: string) {
    const subscription = await this.getUserActiveSubscription(userId);

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    if (!subscription.canUseHomepageBanner()) {
      throw new Error("Homepage banner not available or already used");
    }

    return await subscription.useHomepageBanner();
  }

  /**
   * Get subscription statistics for admin
   */
  async getSubscriptionStats() {
    const stats = await UserSubscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const planStats = await UserSubscription.aggregate([
      {
        $group: {
          _id: "$planType",
          count: { $sum: 1 },
        },
      },
    ]);

    const planTypeStats = planStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const revenueStats = await UserSubscription.aggregate([
      {
        $match: {
          status: "active",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          averageRevenue: { $avg: "$amount" },
        },
      },
    ]);

    return {
      statusStats,
      planTypeStats,
      revenue: revenueStats[0] || { totalRevenue: 0, averageRevenue: 0 },
    };
  }

  /**
   * Get expired subscriptions that need renewal
   */
  async getExpiredSubscriptions() {
    return await UserSubscription.findExpiredSubscriptions();
  }

  /**
   * Get subscriptions that need renewal soon
   */
  async getSubscriptionsNeedingRenewal() {
    return await UserSubscription.findSubscriptionsNeedingRenewal();
  }

  /**
   * Auto-renew subscriptions
   */
  async autoRenewSubscriptions() {
    const subscriptionsToRenew = await this.getSubscriptionsNeedingRenewal();
    const renewedSubscriptions = [];

    for (const subscription of subscriptionsToRenew) {
      try {
        if (subscription.autoRenew) {
          await subscription.renew();
          renewedSubscriptions.push(subscription);
        }
      } catch (error) {
        console.error(`Failed to auto-renew subscription ${subscription._id}:`, error);
      }
    }

    return renewedSubscriptions;
  }
}
