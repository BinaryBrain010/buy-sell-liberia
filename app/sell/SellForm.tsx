'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StepIndicator from './stepIndicator'
import Step1BasicInfo from './step1BasicInfo'
import Step2ImagesLocation from './step2ImagesLocation'
import Step3AdditionalDetails from './step3AdditionalDetails'
import ReviewCard from './reviewCard'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import {
  ProductFormData,
  Category,
  FormErrors
} from './types'

export default function SellForm() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    subCategory: '',
    condition: 'good',
    images: [],
    titleImageIndex: 0,
    location: { city: '', state: '', country: 'Nigeria' },
    contactInfo: { phone: '', email: '', whatsapp: '' },
    tags: [],
    specifications: {},
    negotiable: true,
    showPhoneNumber: true,
  })

  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategories(data.categories)
      } catch {
        toast.error('Failed to fetch categories')
      }
    }
    fetchCategories()
  }, [])

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.title.trim() || formData.title.trim().length < 5)
        newErrors.title = 'Title must be at least 5 characters'

      if (!formData.description.trim() || formData.description.trim().length < 20)
        newErrors.description = 'Description must be at least 20 characters'

      if (!formData.price || formData.price <= 0)
        newErrors.price = 'Enter a valid price'

      if (!formData.category)
        newErrors.category = 'Category is required'

      if (!formData.subCategory)
        newErrors.subCategory = 'Subcategory is required'
    }

    if (step === 2) {
      if (!formData.images.length)
        newErrors.images = 'At least one image is required'

      const { city, state, country } = formData.location
      if (!city.trim()) newErrors.city = 'City is required'
      if (!state.trim()) newErrors.state = 'State is required'
      if (!country.trim()) newErrors.country = 'Country is required'

      if (!formData.contactInfo.phone.trim())
        newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(currentStep)) return

    setLoading(true)

    try {
      const payload = new FormData()

      formData.images.forEach((file) => {
        payload.append('images', file)
      })

      payload.append('titleImageIndex', formData.titleImageIndex.toString())

      const formDataToSend = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        subCategory: formData.subCategory,
        condition: formData.condition,
        negotiable: formData.negotiable,
        location: formData.location,
        contactInfo: formData.contactInfo,
        tags: formData.tags,
        specifications: formData.specifications,
        showPhoneNumber: formData.showPhoneNumber,
      }

      payload.append('formData', JSON.stringify(formDataToSend))

      const res = await fetch('/api/products', {
        method: 'POST',
        body: payload,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create listing')
      }

      toast.success('Product listed successfully! Redirecting in 3 seconds...')
      await new Promise((res) => setTimeout(res, 3000))
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator currentStep={currentStep} />

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <Step1BasicInfo
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {currentStep === 2 && (
              <Step2ImagesLocation
                formData={formData}
                setFormData={setFormData}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {currentStep === 3 && (
              <Step3AdditionalDetails
                formData={formData}
                setFormData={setFormData}
                tagInput={tagInput}
                setTagInput={setTagInput}
                setErrors={setErrors}
              />
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Step {currentStep} of 3</span>
              </div>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create Listing
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {currentStep === 3 && (
            <div className="mt-8 pt-6 border-t">
              <ReviewCard formData={formData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
