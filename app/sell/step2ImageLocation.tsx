import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'

import { ProductFormData, FormErrors } from './types' // ✅ Import types

interface Step2ImagesLocationProps {
  formData: ProductFormData
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
  imagePreview: string[]
  setImagePreview: React.Dispatch<React.SetStateAction<string[]>>
  errors: FormErrors
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const Step2ImagesLocation: React.FC<Step2ImagesLocationProps> = ({
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Images & Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="images">Images *</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className={errors.images ? 'border-red-500' : ''}
          />
          {errors.images && (
            <p className="text-sm text-red-500 mt-1">{errors.images}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location">Location *</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <Input
              placeholder="City"
              value={formData.location.city}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value }
                }))
              }
            />
            <Input
              placeholder="State"
              value={formData.location.state}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, state: e.target.value }
                }))
              }
            />
            <Input
              placeholder="Country"
              value={formData.location.country}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, country: e.target.value }
                }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Step2ImagesLocation
