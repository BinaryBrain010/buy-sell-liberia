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

  // Handle typing into the tag input. If the user types commas, add completed tags
  // and keep the last partial segment in the input.
  const handleTagChange = (value: string) => {
    // If there is a comma in the value, process the completed segments
    if (value.includes(",")) {
      const parts = value.split(",");
      // Last part remains in the input as the current (possibly partial) tag
      const last = parts.pop() ?? "";
      const newCandidates = parts
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (newCandidates.length > 0) {
        setFormData((prev) => ({
          ...prev,
          tags: Array.from(new Set([...(prev.tags || []), ...newCandidates])),
        }));
      }
      setTagInput(last);
    } else {
      // No comma yet; just keep the input buffer
      setTagInput(value);
    }
  };

  const addTag = () => {
    const candidate = tagInput.trim();
    if (!candidate) return;
    if (formData.tags.includes(candidate)) {
      // Already present; just clear the input for smoother UX
      setTagInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), candidate],
    }));
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                    onKeyDown={handleKeyDown}
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
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Step3AdditionalDetails;
