import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Truck } from 'lucide-react'

import { ProductFormData, FormErrors } from './types' // ✅ Import shared types

interface Step3AdditionalDetailsProps {
  formData: ProductFormData
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
  tagInput: string
  setTagInput: React.Dispatch<React.SetStateAction<string>>
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const Step3AdditionalDetails: React.FC<Step3AdditionalDetailsProps> = ({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  setErrors
}) => {
  const handleSpecChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }))
  }

  const handleTagChange = (value: string) => {
    setTagInput(value)
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '')
    setFormData(prev => ({ ...prev, tags }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Additional Details & Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => handleTagChange(e.target.value)}
            placeholder="e.g. laptop, gaming, HP"
          />
        </div>

        <div>
          <Label htmlFor="delivery">Delivery Details (optional)</Label>
          <Input
            id="delivery"
            placeholder="e.g. Available for pickup or nationwide delivery"
            value={formData.specifications.delivery || ''}
            onChange={(e) => handleSpecChange('delivery', e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showPhone"
            checked={formData.showPhoneNumber}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, showPhoneNumber: checked as boolean }))
            }
          />
          <Label htmlFor="showPhone">Show phone number to buyers</Label>
        </div>
      </CardContent>
    </Card>
  )
}

export default Step3AdditionalDetails
