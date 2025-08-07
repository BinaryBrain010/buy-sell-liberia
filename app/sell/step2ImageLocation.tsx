import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'
import { ProductFormData, FormErrors } from './types'

interface Step2ImagesLocationProps {
  formData: ProductFormData
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
  imagePreview: string[]
  setImagePreview: React.Dispatch<React.SetStateAction<string[]>>
  errors: FormErrors
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const CompactStep2ImagesLocation: React.FC<Step2ImagesLocationProps> = ({
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
  errors,
  setErrors
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setFormData(prev => ({ ...prev, images: fileArray }))
      setImagePreview(fileArray.map(file => URL.createObjectURL(file)))
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Upload className="w-3 h-3" />
            Images & Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Images Upload */}
          <div>
            <Label htmlFor="images" className="text-xs">Images *</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className={`h-7 text-xs ${errors.images ? 'border-red-500' : ''}`}
            />
            {errors.images && (
              <p className="text-[10px] text-red-500 mt-1">{errors.images}</p>
            )}
            
            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="flex gap-1 mt-2 overflow-x-auto">
                {imagePreview.map((src, index) => (
                  <img
                    key={index}
                    src={src || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <Label className="text-xs">Location *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
              <Input
                placeholder="City"
                value={formData.location.city}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))
                  setErrors(prev => ({ ...prev, location: '' }))
                }}
                className={`h-7 text-xs ${errors.location ? 'border-red-500' : ''}`}
              />
              <Input
                placeholder="State"
                value={formData.location.state}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, state: e.target.value }
                  }))
                  setErrors(prev => ({ ...prev, location: '' }))
                }}
                className={`h-7 text-xs ${errors.location ? 'border-red-500' : ''}`}
              />
              <Input
                placeholder="Country"
                value={formData.location.country}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, country: e.target.value }
                  }))
                  setErrors(prev => ({ ...prev, location: '' }))
                }}
                className={`h-7 text-xs ${errors.location ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.location && (
              <p className="text-[10px] text-red-500 mt-1">{errors.location}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompactStep2ImagesLocation
