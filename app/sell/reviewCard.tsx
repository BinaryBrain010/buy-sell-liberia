// ReviewCard.tsx

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, MapPin, Info, Tag } from 'lucide-react'

interface ReviewCardProps {
  formData: {
    title: string
    description: string
    price: number
    category: string
    subCategory: string
    condition: string
    images: File[]
    location: {
      city: string
      state: string
      country: string
    }
    tags: string[]
    specifications: Record<string, any>
    negotiable: boolean
    showPhoneNumber: boolean
  }
}

const ReviewCard: React.FC<ReviewCardProps> = ({ formData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Review Your Listing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <strong>Title:</strong> {formData.title}
        </div>
        <div>
          <strong>Description:</strong> {formData.description}
        </div>
        <div>
          <strong>Category:</strong> {formData.category}
          {formData.subCategory && ` / ${formData.subCategory}`}
        </div>
        <div>
          <strong>Condition:</strong> {formData.condition}
        </div>
        <div>
          <strong>Price:</strong> ₦{formData.price.toLocaleString()}
          {formData.negotiable && ' (Negotiable)'}
        </div>

        <div className="flex items-center gap-1">
          <Image className="w-4 h-4" />
          <strong>Images:</strong> {formData.images.length} selected
        </div>

        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <strong>Location:</strong>{' '}
          {[formData.location.city, formData.location.state, formData.location.country]
            .filter(Boolean)
            .join(', ')}
        </div>

        {formData.tags.length > 0 && (
          <div className="flex items-start gap-1">
            <Tag className="w-4 h-4 mt-1" />
            <div>
              <strong>Tags:</strong>{' '}
              {formData.tags.map((tag, i) => (
                <span key={i} className="inline-block mr-2 bg-muted px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {formData.specifications.delivery && (
          <div>
            <strong>Delivery Info:</strong> {formData.specifications.delivery}
          </div>
        )}

        {formData.showPhoneNumber && (
          <div>
            <strong>Phone Number:</strong> Will be shown publicly
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewCard
