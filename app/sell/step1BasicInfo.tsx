import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Tag, DollarSign, Info } from 'lucide-react';
import { Step1BasicInfoProps, CONDITIONS, Condition } from './types';

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  setFormData,
  categories,
  errors,
  setErrors
}) => {
  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter product title"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                setErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, category: value, subCategory: '' }));
                  setErrors(prev => ({ ...prev, category: '' }));
                }}
              >
                <SelectTrigger className={`mt-1 ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>

            {!!selectedCategory?.subcategories?.length && (
              <div>
                <Label htmlFor="subCategory" className="text-sm font-medium">
                  Subcategory *
                </Label>
                <Select
                  value={formData.subCategory}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, subCategory: value }));
                    setErrors(prev => ({ ...prev, subCategory: '' }));
                  }}
                >
                  <SelectTrigger className={`mt-1 ${errors.subCategory ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.subcategories.map(sub => (
                      <SelectItem key={sub._id} value={sub.name}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subCategory && <p className="text-sm text-red-500 mt-1">{errors.subCategory}</p>}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail..."
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                setErrors(prev => ({ ...prev, description: '' }));
              }}
              className={`mt-1 min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Price & Condition Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Price & Condition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price */}
          <div>
            <Label htmlFor="price" className="text-sm font-medium">
              Price *
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={formData.price || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
                setErrors(prev => ({ ...prev, price: '' }));
              }}
              className={`mt-1 ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>

          {/* Condition */}
          <div>
            <Label className="text-sm font-medium">Condition *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {CONDITIONS.map((condition) => (
                <div
                  key={condition.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.condition === condition.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-border hover:border-muted-foreground/50 bg-background'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, condition: condition.value }))}
                >
                  <div className="font-medium text-sm">{condition.label}</div>
                  <div className={`text-xs mt-1 ${
                    formData.condition === condition.value 
                      ? 'text-blue-700' 
                      : 'text-muted-foreground'
                  }`}>
                    {condition.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiable */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="negotiable"
              checked={formData.negotiable}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, negotiable: checked as boolean }))
              }
            />
            <Label htmlFor="negotiable" className="text-sm">
              Price is negotiable
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step1BasicInfo;
