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
import { Package } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, category: value, subCategory: '' }));
                setErrors(prev => ({ ...prev, category: '' }));
              }}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
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
              <Label htmlFor="subCategory">Subcategory</Label>
              <Select
                value={formData.subCategory}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, subCategory: value }))
                }
              >
                <SelectTrigger>
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
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="What are you selling?"
            maxLength={100}
            className={errors.title ? 'border-red-500' : ''}
          />
          <div className="flex justify-between mt-1">
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            <p className="text-sm text-muted-foreground ml-auto">
              {formData.title.length}/100
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }));
              setErrors(prev => ({ ...prev, description: '' }));
            }}
            placeholder="Describe your item in detail..."
            className={errors.description ? 'border-red-500' : ''}
          />
          <div className="flex justify-between mt-1">
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-sm text-muted-foreground ml-auto">
              {formData.description.length}/2000
            </p>
          </div>
        </div>

        {/* Price & Condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (₦) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={formData.price || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setFormData(prev => ({ ...prev, price: isNaN(value) ? 0 : value }));
                setErrors(prev => ({ ...prev, price: '' }));
              }}
              placeholder="0"
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <Label htmlFor="condition">Condition *</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, condition: value as Condition }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map(cond => (
                  <SelectItem key={cond.value} value={cond.value}>
                    <div>
                      <div className="font-medium">{cond.label}</div>
                      <div className="text-sm text-muted-foreground">{cond.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Negotiable checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="negotiable"
            checked={formData.negotiable}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, negotiable: checked === true }))
            }
          />
          <Label htmlFor="negotiable">Price is negotiable</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step1BasicInfo;
