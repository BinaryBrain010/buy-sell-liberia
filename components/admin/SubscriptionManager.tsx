"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  CreditCard, 
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";

interface Subscription {
  id: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone?: string;
  };
  plan: {
    id: string;
    name: string;
    type: string;
    description: string;
    price: number;
    maxAds: number;
    featuredAds: number;
    homepageBanner: boolean;
    features: string[];
  };
  planType: string;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  paymentScreenshot: string;
  paymentNotes?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface SubscriptionManagerProps {
  adminToken: string;
}

export default function SubscriptionManager({ adminToken }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'view'>('view');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const fetchPendingSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions/pending', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (subscriptionId: string, action: 'approve' | 'reject') => {
    setProcessing(true);
    try {
      const body = action === 'approve' 
        ? { adminNotes }
        : { reason: rejectionReason, adminNotes };

      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} subscription`);
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message,
      });

      // Remove the processed subscription from the list
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
      setShowModal(false);
      setSelectedSubscription(null);
      setAdminNotes('');
      setRejectionReason('');
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} subscription`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (subscription: Subscription, type: 'approve' | 'reject' | 'view') => {
    setSelectedSubscription(subscription);
    setModalType(type);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (planType: string) => {
    const colors = {
      basic: 'bg-blue-50 text-blue-700',
      pro: 'bg-purple-50 text-purple-700',
      vip: 'bg-gold-50 text-gold-700',
    };
    return <Badge className={colors[planType as keyof typeof colors] || 'bg-gray-50 text-gray-700'}>{planType.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <Button onClick={fetchPendingSubscriptions} variant="outline">
          Refresh
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Subscriptions</h3>
            <p className="text-gray-600">All subscription requests have been processed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getPlanBadge(subscription.planType)}
                      {getStatusBadge(subscription.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
                        <p className="text-gray-600 text-sm">{subscription.plan.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{subscription.user.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{subscription.paymentMethod} - {subscription.transactionId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{subscription.amount} {subscription.currency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {subscription.plan.maxAds === 999999 ? 'Unlimited' : subscription.plan.maxAds} ads
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {subscription.plan.featuredAds === 999999 ? 'Unlimited' : subscription.plan.featuredAds} featured
                      </span>
                      {subscription.plan.homepageBanner && (
                        <span className="text-xs bg-gold-100 px-2 py-1 rounded">Homepage Banner</span>
                      )}
                    </div>

                    {subscription.paymentNotes && (
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>User Notes:</strong> {subscription.paymentNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(subscription, 'view')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openModal(subscription, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openModal(subscription, 'reject')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === 'approve' && 'Approve Subscription'}
              {modalType === 'reject' && 'Reject Subscription'}
              {modalType === 'view' && 'Subscription Details'}
            </h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="font-medium">{selectedSubscription.user.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedSubscription.user.email}</p>
                </div>
                <div>
                  <Label>Plan</Label>
                  <p className="font-medium">{selectedSubscription.plan.name}</p>
                  <p className="text-sm text-gray-600">{selectedSubscription.amount} {selectedSubscription.currency}</p>
                </div>
              </div>

              <div>
                <Label>Payment Details</Label>
                <p className="text-sm">
                  <strong>Method:</strong> {selectedSubscription.paymentMethod}<br/>
                  <strong>Transaction ID:</strong> {selectedSubscription.transactionId}
                </p>
              </div>

              {selectedSubscription.paymentScreenshot && (
                <div>
                  <Label>Payment Screenshot</Label>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScreenshot(
                        showScreenshot ? null : selectedSubscription.paymentScreenshot
                      )}
                    >
                      {showScreenshot ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showScreenshot ? 'Hide' : 'Show'} Screenshot
                    </Button>
                    {showScreenshot && (
                      <div className="mt-2">
                        <img 
                          src={showScreenshot} 
                          alt="Payment Screenshot" 
                          className="max-w-full h-auto border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modalType !== 'view' && (
                <div>
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this decision..."
                    className="mt-1"
                  />
                </div>
              )}

              {modalType === 'reject' && (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedSubscription(null);
                  setAdminNotes('');
                  setRejectionReason('');
                  setShowScreenshot(null);
                }}
              >
                Cancel
              </Button>
              {modalType !== 'view' && (
                <Button
                  onClick={() => handleAction(selectedSubscription.id, modalType)}
                  disabled={processing}
                  className={
                    modalType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }
                >
                  {processing ? 'Processing...' : modalType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
