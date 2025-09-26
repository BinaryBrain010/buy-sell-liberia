import React, { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, DollarSign } from "lucide-react";
import { Step1BasicInfoProps, CONDITIONS, ProductFormData } from "./types";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { cn } from "@/lib/utils";

const CompactStep1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  setFormData,
  categories,
  errors,
  setErrors,
}) => {
  const selectedCategory = categories.find(
    (cat) => cat._id === formData.category
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [formData.description]);

  return (
    <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 space-y-3">
      {/* Compact Single Card with animation */}
      <FadeIn>
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Title and Category Row */}
            <FadeInStagger
              as="div"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <div>
                <Label htmlFor="title" className="text-xs">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Product title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, title: e.target.value }));
                    setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  aria-invalid={!!errors.title}
                  className={cn(
                    "h-8 text-xs",
                    errors.title && "border-red-500"
                  )}
                />
                {errors.title && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="text-xs">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                      subCategory: "",
                    }));
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 text-xs",
                      errors.category && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{cat.icon}</span>
                          <span className="text-xs">{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.category}
                  </p>
                )}
              </div>
            </FadeInStagger>

            {/* Subcategory (if available) */}
            {!!selectedCategory?.subcategories?.length && (
              <FadeIn>
                <div>
                  <Label htmlFor="subCategory" className="text-xs">
                    Subcategory *
                  </Label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, subCategory: value }));
                      setErrors((prev) => ({ ...prev, subCategory: "" }));
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-8 text-xs",
                        errors.subCategory && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map((sub) => (
                        <SelectItem key={sub._id} value={sub._id}>
                          <span className="text-xs">{sub.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subCategory && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.subCategory}
                    </p>
                  )}
                </div>
              </FadeIn>
            )}

            {/* Description */}
            <FadeIn>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-xs">
                    Description *
                  </Label>
                  <span
                    className={cn(
                      "text-[10px]",
                      (formData.description?.length || 0) < 20
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {formData.description?.length || 0}/20
                  </span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                    setErrors((prev) => ({ ...prev, description: "" }));
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "auto";
                      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                    }
                  }}
                  ref={textareaRef}
                  aria-invalid={!!errors.description}
                  className={cn(
                    "text-xs resize-none min-h-[56px] max-h-[120px] overflow-hidden",
                    errors.description && "border-red-500"
                  )}
                />
                {errors.description && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </FadeIn>

            {/* Price, Condition, and Negotiable Row */}
            <FadeInStagger
              as="div"
              className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
            >
              <div>
                <Label
                  htmlFor="price"
                  className="text-xs flex items-center gap-1"
                >
                  Price *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={formData.price || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }));
                      setErrors((prev) => ({ ...prev, price: "" }));
                    }}
                    aria-invalid={!!errors.price}
                    className={cn(
                      "h-8 text-xs pl-7",
                      errors.price && "border-red-500"
                    )}
                  />
                </div>
                {errors.price && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="condition" className="text-xs">
                  Condition *
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      condition: value as ProductFormData["condition"],
                    }));
                    setErrors((prev) => ({ ...prev, condition: "" }));
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 text-xs",
                      errors.condition && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {condition.label}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.condition}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pb-1">
                <Checkbox
                  id="negotiable"
                  checked={formData.negotiable}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      negotiable: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="negotiable" className="text-[10px]">
                  Negotiable
                </Label>
              </div>
            </FadeInStagger>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};

export default CompactStep1BasicInfo;

// ✅ Validation function (unchanged)
export const validateStep1 = (formData: Step1BasicInfoProps["formData"]) => {
  const newErrors: Partial<Record<keyof typeof formData, string>> = {};

  if (!formData.title || formData.title.trim().length < 3) {
    newErrors.title = "Title must be at least 3 characters";
  }

  if (!formData.description || formData.description.trim().length < 20) {
    newErrors.description = "Description must be at least 20 characters";
  }

  if (!formData.category) {
    newErrors.category = "Category is required";
  }

  if (!formData.subCategory) {
    newErrors.subCategory = "Subcategory is required";
  }

  if (!formData.price || formData.price <= 0) {
    newErrors.price = "Price must be greater than 0";
  }

  if (!formData.condition) {
    newErrors.condition = "Condition is required";
  }

  return newErrors;
};
