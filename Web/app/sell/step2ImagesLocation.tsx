import React, { useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, X, Camera, MapPin, Phone, Mail, Star } from 'lucide-react'
import { ProductFormData, FormErrors } from './types'

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
  const maxImages = 15

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      const totalImages = formData.images.length + fileArray.length
      
      if (totalImages > maxImages) {
        setErrors(prev => ({ ...prev, images: `Maximum ${maxImages} images allowed` }))
        return
      }
      
      setFormData(prev => ({ ...prev, images: [...prev.images, ...fileArray] }))
      const newPreviews = fileArray.map(file => URL.createObjectURL(file))
      setImagePreview(prev => [...prev, ...newPreviews])
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
    
    // If the removed image was the title image, reset title image
    if (formData.titleImageIndex === index) {
      setFormData(prev => ({ ...prev, titleImageIndex: 0 }))
    } else if (formData.titleImageIndex > index) {
      // Adjust title image index if it was after the removed image
      setFormData(prev => ({ ...prev, titleImageIndex: prev.titleImageIndex - 1 }))
    }
  }

  const setTitleImage = (index: number) => {
    setFormData(prev => ({ ...prev, titleImageIndex: index }))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    
    if (files.length === 0) return
    
    const totalImages = formData.images.length + files.length
    
    if (totalImages > maxImages) {
      setErrors(prev => ({ ...prev, images: `Maximum ${maxImages} images allowed` }))
      return
    }
    
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreview(prev => [...prev, ...newPreviews])
    setErrors(prev => ({ ...prev, images: '' }))
  }, [formData.images.length, setFormData, setImagePreview, setErrors])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            Upload Images ({formData.images.length}/{maxImages})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              errors.images 
                ? 'border-red-300 bg-red-50' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop images here, or click to select
            </p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              Upload up to {maxImages} images (JPG, PNG, WebP)
            </p>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('images')?.click()}
            >
              Choose Files
            </Button>
          </div>

          {errors.images && (
            <p className="text-sm text-red-500">{errors.images}</p>
          )}

          {/* Image Preview Grid */}
          {imagePreview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Select a title image (first image shown to buyers)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className={`relative rounded-lg overflow-hidden border-2 ${
                      formData.titleImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-border'
                    }`}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {formData.titleImageIndex === index && (
                        <div className="absolute top-1 left-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTitleImage(index)}
                      className={`w-full mt-1 text-xs py-1 rounded transition-colors ${
                        formData.titleImageIndex === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {formData.titleImageIndex === index ? 'Title Image' : 'Set as Title'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.contactInfo?.phone || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, phone: e.target.value }
                  }))
                }
                className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.contactInfo?.email || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, email: e.target.value }
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp (optional)
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="Enter WhatsApp number"
              value={formData.contactInfo?.whatsapp || ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, whatsapp: e.target.value }
                }))
              }
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">
                City *
              </Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={formData.location.city}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))
                }
                className={`mt-1 ${errors.city ? 'border-red-500' : ''}`}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="state" className="text-sm font-medium">
                State/Province *
              </Label>
              <Input
                id="state"
                placeholder="Enter state"
                value={formData.location.state}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, state: e.target.value }
                  }))
                }
                className={`mt-1 ${errors.state ? 'border-red-500' : ''}`}
              />
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">{errors.state}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="country" className="text-sm font-medium">
                Country *
              </Label>
              <Input
                id="country"
                placeholder="Enter country"
                value={formData.location.country}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, country: e.target.value }
                  }))
                }
                className={`mt-1 ${errors.country ? 'border-red-500' : ''}`}
              />
              {errors.country && (
                <p className="text-sm text-red-500 mt-1">{errors.country}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Step2ImagesLocation
