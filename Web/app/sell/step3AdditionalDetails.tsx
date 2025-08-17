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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Tag, Phone, X } from 'lucide-react'
import { ProductFormData, FormErrors } from './types'

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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-6">
      {/* Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Tags & Keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags (help buyers find your item)
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => handleTagChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. laptop, gaming, HP"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            
            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery & Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Delivery & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="delivery" className="text-sm font-medium">
              Delivery Details (optional)
            </Label>
            <Input
              id="delivery"
              placeholder="e.g. Available for pickup or nationwide delivery"
              value={formData.specifications.delivery || ''}
              onChange={(e) => handleSpecChange('delivery', e.target.value)}
              className="mt-1"
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
            <Label htmlFor="showPhone" className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Show phone number to buyers
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Step3AdditionalDetails
