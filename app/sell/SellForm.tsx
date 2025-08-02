'use client'

import React, { useState, useEffect } from 'react'
import StepIndicator from './stepIndicator'
import Step1BasicInfo from './step1BasicInfo'
import Step2ImagesLocation from './step2ImageLocation'
import Step3AdditionalDetails from './step3AdditionalDetails'
import ReviewCard from './reviewCard'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  ProductFormData,
  Category,
  FormErrors
} from './types'

export default function SellForm() {
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
    location: { city: '', state: '', country: 'Nigeria' },
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
      if (!formData.title.trim()) newErrors.title = 'Title is required'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
      if (!formData.price || formData.price <= 0) newErrors.price = 'Enter a valid price'
      if (!formData.category) newErrors.category = 'Category is required'
      if (!formData.subCategory) newErrors.subCategory = 'Subcategory is required'
    }

    if (step === 2) {
      if (!formData.images.length) newErrors.images = 'At least one image is required'
      const { city, state, country } = formData.location
      if (!city.trim()) newErrors.city = 'City is required'
      if (!state.trim()) newErrors.state = 'State is required'
      if (!country.trim()) newErrors.country = 'Country is required'
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
      formData.images.forEach((file) => payload.append('images', file))
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') return
        if (typeof value === 'object') {
          payload.append(key, JSON.stringify(value))
        } else {
          payload.append(key, String(value))
        }
      })

      const res = await fetch('/api/products', {
        method: 'POST',
        body: payload
      })

      if (!res.ok) throw new Error('Failed to create listing')
      toast.success('Product listed successfully!')
    } catch (err) {
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} />

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

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>
          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          )}
        </div>
      </form>

      {currentStep === 3 && <ReviewCard formData={formData} />}
    </div>
  )
}
