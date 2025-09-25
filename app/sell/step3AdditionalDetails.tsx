import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Tag, Phone, X } from "lucide-react";
import { ProductFormData, FormErrors } from "./types";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step3AdditionalDetailsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  tagInput: string;
  setTagInput: React.Dispatch<React.SetStateAction<string>>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

const Step3AdditionalDetails: React.FC<Step3AdditionalDetailsProps> = ({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  setErrors,
}) => {
  const handleSpecChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const handleTagChange = (value: string) => {
    setTagInput(value);
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
    setFormData((prev) => ({ ...prev, tags }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 space-y-3">
      <FadeIn>
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Tags Section */}
            <FadeIn>
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Tags & Keywords</Label>
                  <span className="text-[10px] text-muted-foreground">
                    Press Enter or comma to add
                  </span>
                </div>
                <div className="flex gap-1 mt-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => handleTagChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g. laptop, gaming, HP"
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="h-8 px-2 text-xs"
                  >
                    Add
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map((tag, index) => (
                      <motion.div key={index} whileHover={{ scale: 1.03 }}>
                        <Badge
                          variant="secondary"
                          className="text-xs h-5 flex items-center gap-1 px-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove ${tag}`}
                            className="hover:text-red-500"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Delivery and Show Phone */}
            <FadeInStagger
              as="div"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Truck className="h-2 w-2" />
                  Delivery Details
                </Label>
                <Input
                  placeholder="e.g. Pickup or nationwide delivery"
                  value={formData.specifications.delivery || ""}
                  onChange={(e) => handleSpecChange("delivery", e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div className="flex items-center md:items-end justify-between md:justify-start gap-2">
                <div className="flex items-center gap-2 mt-4 md:mt-6">
                  <Checkbox
                    id="showPhoneNumber"
                    checked={formData.showPhoneNumber}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPhoneNumber: checked as boolean,
                      }))
                    }
                  />
                  <Label
                    htmlFor="showPhoneNumber"
                    className="text-[11px] flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" /> Show phone number on listing
                  </Label>
                </div>
              </div>
            </FadeInStagger>

            {/* Quick Specs */}
            <FadeIn>
              <div>
                <Label className="text-xs">Quick Specs (optional)</Label>
                <FadeInStagger
                  as="div"
                  className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1"
                >
                  <Input
                    placeholder="Brand"
                    value={formData.specifications.brand || ""}
                    onChange={(e) => handleSpecChange("brand", e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Model"
                    value={formData.specifications.model || ""}
                    onChange={(e) => handleSpecChange("model", e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Color"
                    value={formData.specifications.color || ""}
                    onChange={(e) => handleSpecChange("color", e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Warranty"
                    value={formData.specifications.warranty || ""}
                    onChange={(e) =>
                      handleSpecChange("warranty", e.target.value)
                    }
                    className="h-8 text-xs"
                  />
                </FadeInStagger>
              </div>
            </FadeIn>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Step3AdditionalDetails;
