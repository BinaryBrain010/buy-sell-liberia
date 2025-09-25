import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X, Camera, MapPin, Phone, Star } from "lucide-react";
import { ProductFormData, FormErrors } from "./types";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step2ImagesLocationProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  imagePreview: string[];
  setImagePreview: React.Dispatch<React.SetStateAction<string[]>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

const Step2ImagesLocation: React.FC<Step2ImagesLocationProps> = ({
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
  errors,
  setErrors,
}) => {
  const maxImages = 15;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Ensure default country is Liberia
  useEffect(() => {
    if (!formData.location?.country) {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, country: "Liberia" },
      }));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const totalImages = formData.images.length + fileArray.length;

      if (totalImages > maxImages) {
        setErrors((prev) => ({
          ...prev,
          images: `Maximum ${maxImages} images allowed`,
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...fileArray],
      }));
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreview((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));

    if (formData.titleImageIndex === index) {
      setFormData((prev) => ({ ...prev, titleImageIndex: 0 }));
    } else if (formData.titleImageIndex > index) {
      setFormData((prev) => ({
        ...prev,
        titleImageIndex: prev.titleImageIndex - 1,
      }));
    }
  };

  const setTitleImage = (index: number) => {
    setFormData((prev) => ({ ...prev, titleImageIndex: index }));
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length === 0) return;

      const totalImages = formData.images.length + files.length;

      if (totalImages > maxImages) {
        setErrors((prev) => ({
          ...prev,
          images: `Maximum ${maxImages} images allowed`,
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreview((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => ({ ...prev, images: "" }));
      setIsDragging(false);
    },
    [formData.images.length, setFormData, setImagePreview, setErrors]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 space-y-3">
      <FadeIn>
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4" />
              Images & Location ({formData.images.length}/{maxImages})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Image Upload */}
            <FadeIn>
              <div>
                <Label className="text-xs">Images *</Label>
                <motion.div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={cn(
                    "border border-dashed rounded p-3 text-center transition-colors",
                    errors.images
                      ? "border-red-300 bg-red-50"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    isDragging &&
                      !errors.images &&
                      "border-primary/60 bg-primary/5"
                  )}
                  animate={{ scale: isDragging ? 1.01 : 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <Upload className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mb-1">
                    Drag & drop or click to select
                  </p>
                  <Input
                    id="images"
                    ref={fileInputRef}
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
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs px-2"
                  >
                    Choose Files
                  </Button>
                </motion.div>
                {errors.images && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.images}
                  </p>
                )}
              </div>
            </FadeIn>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <FadeIn>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Select title image</span>
                  </div>
                  <FadeInStagger
                    as="div"
                    className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1"
                  >
                    {imagePreview.map((preview, index) => (
                      <motion.div
                        key={index}
                        className="relative group"
                        whileHover={{ y: -2 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <div
                          className={cn(
                            "relative rounded overflow-hidden border",
                            formData.titleImageIndex === index
                              ? "border-blue-500 ring-1 ring-blue-200"
                              : "border-border"
                          )}
                        >
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-12 object-cover"
                          />
                          {formData.titleImageIndex === index && (
                            <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 text-white rounded-br flex items-center justify-center">
                              <Star className="w-2 h-2" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            aria-label="Remove image"
                            className="absolute top-0 right-0 w-3 h-3 bg-red-500 text-white rounded-bl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTitleImage(index)}
                          className={cn(
                            "w-full mt-0.5 text-[8px] py-0.5 rounded transition-colors",
                            formData.titleImageIndex === index
                              ? "bg-blue-500 text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {formData.titleImageIndex === index ? "Title" : "Set"}
                        </button>
                      </motion.div>
                    ))}
                  </FadeInStagger>
                </div>
              </FadeIn>
            )}

            {/* Contact Info */}
            <FadeIn>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Phone className="h-2 w-2" />
                  Contact *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
                  <Input
                    placeholder="Phone *"
                    value={formData.contactInfo?.phone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          phone: e.target.value,
                        },
                      }))
                    }
                    aria-invalid={!!errors.phone}
                    className={cn(
                      "h-8 text-xs",
                      errors.phone && "border-red-500"
                    )}
                  />
                  <Input
                    placeholder="Email (optional)"
                    value={formData.contactInfo?.email || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          email: e.target.value,
                        },
                      }))
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="WhatsApp (optional)"
                    value={formData.contactInfo?.whatsapp || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo,
                          whatsapp: e.target.value,
                        },
                      }))
                    }
                    className="h-8 text-xs"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </FadeIn>

            {/* Location */}
            <FadeIn>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="h-2 w-2" />
                  Location *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
                  <Input
                    placeholder="City *"
                    value={formData.location.city}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, city: e.target.value },
                      }));
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    aria-invalid={!!errors.city}
                    className={cn(
                      "h-8 text-xs",
                      errors.city && "border-red-500"
                    )}
                  />
                  <Input
                    placeholder="State *"
                    value={formData.location.state}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, state: e.target.value },
                      }));
                      setErrors((prev) => ({ ...prev, state: "" }));
                    }}
                    aria-invalid={!!errors.state}
                    className={cn(
                      "h-8 text-xs",
                      errors.state && "border-red-500"
                    )}
                  />
                  <Input
                    placeholder="Country *"
                    value={formData.location.country || "Liberia"}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, country: e.target.value },
                      }));
                      setErrors((prev) => ({ ...prev, country: "" }));
                    }}
                    aria-invalid={!!errors.country}
                    className={cn(
                      "h-8 text-xs",
                      errors.country && "border-red-500"
                    )}
                  />
                </div>
                {(errors.city || errors.state || errors.country) && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.city || errors.state || errors.country}
                  </p>
                )}
              </div>
            </FadeIn>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Step2ImagesLocation;
