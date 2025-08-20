"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from '@/components/auth-provider'

interface Category {
  _id: string
  name: string
  slug: string
  icon: string
  description: string
  isActive: boolean
  sortOrder: number
  productCount?: number
  subcategories: Subcategory[]
}

interface Subcategory {
  _id: string
  name: string
  slug: string
  description: string
  isActive: boolean
  sortOrder: number
  customFields: any[]
}

export default function AdminCategoriesPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📎',
    description: '',
    sortOrder: 0,
    isActive: true
  })

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      // Redirect to home or show access denied
    }
  }, [user])

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories?includeCount=true')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Create new category
  const handleCreate = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Category created successfully')
        setIsCreating(false)
        setFormData({
          name: '',
          slug: '',
          icon: '📎',
          description: '',
          sortOrder: 0,
          isActive: true
        })
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  // Update category
  const handleUpdate = async () => {
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Category updated successfully')
        setEditingCategory(null)
        setFormData({
          name: '',
          slug: '',
          icon: '📎',
          description: '',
          sortOrder: 0,
          isActive: true
        })
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    }
  }

  // Delete category
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Category deleted successfully')
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  // Start editing category
  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive
    })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingCategory(null)
    setIsCreating(false)
    setFormData({
      name: '',
      slug: '',
      icon: '📎',
      description: '',
      sortOrder: 0,
      isActive: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">Manage product categories and subcategories</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingCategory) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create New Category' : 'Edit Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                    placeholder="📎"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Category description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={isCreating ? handleCreate : handleUpdate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Create' : 'Update'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category._id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {category.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.productCount || 0} products
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description || 'No description'}
                </p>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Subcategories:</span> {category.subcategories?.length || 0}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Sort Order:</span> {category.sortOrder}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(category)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category._id)}
                    disabled={category.productCount > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first category
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 