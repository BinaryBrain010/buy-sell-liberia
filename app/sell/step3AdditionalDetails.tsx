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
    <div className="max-w-4xl w-full mx-auto px-2 space-y-2">
      {/* Compact Single Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Tag className="h-3 w-3" />
            Additional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Tags Section */}
          <div>
            <Label className="text-xs">Tags & Keywords</Label>
            <div className="flex gap-1 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => handleTagChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. laptop, gaming, HP"
                className="h-7 text-xs flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="h-7 px-2 text-xs"
              >
                Add
              </Button>
            </div>
            
            {/* Compact Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs h-5 flex items-center gap-1 px-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Delivery and Contact Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Truck className="h-2 w-2" />
                Delivery Details
              </Label>
              <Input
                placeholder="e.g. Pickup or nationwide delivery"
                value={formData.specifications.delivery || ''}
                onChange={(e) => handleSpecChange('delivery', e.target.value)}
                className="h-7 text-xs mt-1"
              />
            </div>

            <div className="flex items-center justify-center">
              
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Step3AdditionalDetails
