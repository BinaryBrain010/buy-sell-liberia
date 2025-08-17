"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, Plus, MapPin, DollarSign, Tag } from "lucide-react"

// Base form schema
const baseFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description too long"),
  categoryId: z.string().min(1, "Please select a category"),
  subcategoryId: z.string().min(1, "Please select a subcategory"),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default("USD"),
  negotiable: z.boolean().default(true),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().default("Liberia"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  preferredContact: z.enum(["phone", "whatsapp", "email"]).default("phone"),
  images: z.array(z.string()).min(1, "At least one image is required").max(10, "Maximum 10 images allowed"),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional()
})

type FormData = z.infer<typeof baseFormSchema>

interface Category {
  _id: string
  name: string
  slug: string
  subcategories: Subcategory[]
}

interface Subcategory {
  _id: string
  name: string
  slug: string
  customFields: CustomField[]
}

interface CustomField {
  _id: string
  fieldName: string
  fieldType: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'date'
  label: string
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface SellFormProps {
  user: any
}

export function SellForm({ user }: SellFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [images, setImages] = useState<string[]>([])
  const [imageUploading, setImageUploading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(baseFormSchema),
    defaultValues: {
      currency: "USD",
      negotiable: true,
      country: "Liberia",
      preferredContact: "phone",
      email: user?.email || "",
      images: [],
      tags: [],
      customFields: {}
    }
  })

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
    setCustomFields([])
    form.setValue('categoryId', categoryId)
    form.setValue('subcategoryId', '')
  }

  // Handle subcategory selection
  const handleSubcategoryChange = (subcategoryId: string) => {
    if (!selectedCategory) return
    
    const subcategory = selectedCategory.subcategories.find(s => s._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
    setCustomFields(subcategory?.customFields || [])
    form.setValue('subcategoryId', subcategoryId)
  }

  // Handle image upload (placeholder - implement with Firebase Storage)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setImageUploading(true)
    try {
      // Placeholder for image upload implementation
      // In real implementation, upload to Firebase Storage
      const uploadedUrls: string[] = []
      
      for (let i = 0; i < files.length && images.length + uploadedUrls.length < 10; i++) {
        // Mock upload - replace with actual Firebase Storage upload
        const mockUrl = `/placeholder.svg?height=300&width=300&text=Image+${images.length + uploadedUrls.length + 1}`
        uploadedUrls.push(mockUrl)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      form.setValue('images', newImages)

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      })
    } finally {
      setImageUploading(false)
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    form.setValue('images', newImages)
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      const newTags = [...tags, newTag.trim().toLowerCase()]
      setTags(newTags)
      form.setValue('tags', newTags)
      setNewTag("")
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    form.setValue('tags', newTags)
  }

  // Submit form
  const onSubmit = async (data: FormData) => {
    if (!selectedCategory || !selectedSubcategory) {
      toast({
        title: "Error",
        description: "Please select a category and subcategory",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Prepare custom fields data
      const customFieldsData: { [key: string]: any } = {}
      customFields.forEach(field => {
        const value = form.getValues(`customFields.${field.fieldName}` as any)
        if (value !== undefined && value !== '') {
          customFieldsData[field.fieldName] = value
        }
      })

      const productData = {
        title: data.title,
        description: data.description,
        category_id: data.categoryId,
        subcategory_id: data.subcategoryId,
        price: {
          amount: data.price,
          currency: data.currency,
          negotiable: data.negotiable
        },
        location: {
          city: data.city,
          state: data.state,
          country: data.country
        },
        contact: {
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email || user.email,
          preferredMethod: data.preferredContact
        },
        images: data.images.map((url, index) => ({
          url,
          alt: `${data.title} - Image ${index + 1}`,
          isPrimary: index === 0,
          order: index + 1
        })),
        customFields: Object.entries(customFieldsData).map(([key, value]) => ({
          fieldName: key,
          value
        })),
        tags: data.tags || [],
        status: 'active'
      }

      const response = await axios.post('/api/products', productData)

      toast({
        title: "Success!",
        description: "Your product has been listed successfully!"
      })

      // Redirect to product page or products list
      router.push('/products')
      
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Render custom field based on type
  const renderCustomField = (field: CustomField) => {
    const fieldKey = `customFields.${field.fieldName}` as any

    switch (field.fieldType) {
      case 'select':
        return (
          <FormField
            key={field._id}
            control={form.control}
            name={fieldKey}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'boolean':
        return (
          <FormField
            key={field._id}
            control={form.control}
            name={fieldKey}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label}</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'textarea':
        return (
          <FormField
            key={field._id}
            control={form.control}
            name={fieldKey}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'number':
        return (
          <FormField
            key={field._id}
            control={form.control}
            name={fieldKey}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={field.validation?.min}
                    max={field.validation?.max}
                    placeholder={field.placeholder}
                    {...formField}
                    onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default: // text
        return (
          <FormField
            key={field._id}
            control={form.control}
            name={fieldKey}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a descriptive title for your item" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your item in detail. Include condition, features, and any other relevant information."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory *</FormLabel>
                        <Select 
                          onValueChange={handleSubcategoryChange} 
                          defaultValue={field.value}
                          disabled={!selectedCategory}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory?.subcategories.map((subcategory) => (
                              <SelectItem key={subcategory._id} value={subcategory._id}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields (Category-specific) */}
            {customFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {customFields.map(renderCustomField)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="LRD">LRD (L$)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="negotiable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-center space-x-3 space-y-0 pt-6">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Price Negotiable</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/County</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state or county" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+231 000 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="+231 000 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferredContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Images (1-10) *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> images
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (MAX. 5MB each)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploading || images.length >= 10}
                    />
                  </label>
                </div>

                {/* Images Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {imageUploading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Uploading images...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating Listing..." : "Create Listing"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
