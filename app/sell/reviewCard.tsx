// ReviewCard.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image,
  MapPin,
  Info,
  Tag,
  DollarSign,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { ProductFormData } from "./types";

import { Category } from "./types";

interface ReviewCardProps {
  formData: ProductFormData;
  categories: Category[];
}

const ReviewCard: React.FC<ReviewCardProps> = ({ formData, categories }) => {
  // Prevent crash if categories is undefined
  const safeCategories = categories || [];
  const categoryObj = safeCategories.find(
    (cat) => cat._id === formData.category
  );
  const subCategoryObj = categoryObj?.subcategories?.find(
    (sub) => sub._id === formData.subCategory
  );
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="w-5 h-5 text-blue-600" />
          Review Your Listing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{formData.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {formData.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-muted-foreground">
                  {categoryObj?.name || ""}
                  {subCategoryObj ? ` / ${subCategoryObj.name}` : ""}
                </span>
                <Badge variant="outline" className="capitalize">
                  {formData.condition}
                </Badge>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-semibold text-lg">
                {formData.price.toLocaleString()}
              </span>
              {formData.negotiable && (
                <Badge variant="secondary" className="ml-2">
                  Negotiable
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Images & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-blue-600" />
            <div>
              <span className="font-medium">
                {formData.images.length} images
              </span>
              <p className="text-sm text-muted-foreground">
                uploaded{" "}
                {formData.titleImageIndex >= 0 &&
                  formData.titleImageIndex < formData.images.length && (
                    <span className="text-green-600">
                      • Title image selected
                    </span>
                  )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-600" />
            <div>
              <span className="font-medium">Location</span>
              <p className="text-sm text-muted-foreground">
                {[
                  formData.location.city,
                  formData.location.state,
                  formData.location.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-green-600" />
          <div>
            <span className="font-medium">Contact</span>
            <p className="text-sm text-muted-foreground">
              {formData.contactInfo.phone}
              {formData.contactInfo.email && ` • ${formData.contactInfo.email}`}
              {formData.contactInfo.whatsapp &&
                ` • WhatsApp: ${formData.contactInfo.whatsapp}`}
            </p>
          </div>
        </div>

        {/* Tags */}
        {formData.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium text-sm">Tags</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="space-y-3">
          {formData.specifications.delivery && (
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-orange-600" />
              <div>
                <span className="font-medium text-sm">Delivery</span>
                <p className="text-sm text-muted-foreground">
                  {formData.specifications.delivery}
                </p>
              </div>
            </div>
          )}

          {formData.showPhoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-600" />
              <div>
                <span className="font-medium text-sm">Contact</span>
                <p className="text-sm text-muted-foreground">
                  Phone number will be shown to buyers
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
