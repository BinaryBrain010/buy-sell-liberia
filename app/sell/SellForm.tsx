"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "./stepIndicator";
import Step1BasicInfo from "./step1BasicInfo";
import Step2ImagesLocation from "./step2ImagesLocation";
import Step3AdditionalDetails from "./step3AdditionalDetails";
import ReviewCard from "./reviewCard";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { ProductFormData, Category, FormErrors } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SellForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: 0,
    category: "",
    subCategory: "",
    condition: "good",
    images: [],
    titleImageIndex: 0,
    location: { city: "", state: "", country: "Liberia" },
    contactInfo: { phone: "", email: "", whatsapp: "" },
    tags: [],
    specifications: {},
    negotiable: true,
    showPhoneNumber: true,
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showReview, setShowReview] = useState(false);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [countdown, setCountdown] = useState<number>(8);
  // Posting limits disabled; no limit modal/pre-check

  // Auto-redirect countdown when success dialog is open
  useEffect(() => {
    if (!successOpen) return;
    setCountdown(8);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Only redirect if the dialog is still open
          if (successOpen) router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [successOpen, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories);
      } catch {
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.title.trim() || formData.title.trim().length < 5)
        newErrors.title = "Title must be at least 5 characters";

      if (
        !formData.description.trim() ||
        formData.description.trim().length < 20
      )
        newErrors.description = "Description must be at least 20 characters";

      if (!formData.price || formData.price <= 0)
        newErrors.price = "Enter a valid price";

      if (!formData.category) newErrors.category = "Category is required";

      if (!formData.subCategory)
        newErrors.subCategory = "Subcategory is required";
    }

    if (step === 2) {
      if (!formData.images.length)
        newErrors.images = "At least one image is required";

      const { city, state, country } = formData.location;
      if (!city.trim()) newErrors.city = "City is required";
      if (!state.trim()) newErrors.state = "State is required";
      if (!country.trim()) newErrors.country = "Country is required";

      if (!formData.contactInfo.phone.trim())
        newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      const payload = new FormData();

      formData.images.forEach((file) => {
        payload.append("images", file);
      });

      payload.append("titleImageIndex", formData.titleImageIndex.toString());

      const formDataToSend = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category_id: formData.category, // ObjectId
        subcategory_id: formData.subCategory, // ObjectId
        condition: formData.condition,
        negotiable: formData.negotiable,
        location: formData.location,
        contactInfo: formData.contactInfo,
        tags: formData.tags,
        specifications: formData.specifications,
        showPhoneNumber: formData.showPhoneNumber,
      };

      payload.append("formData", JSON.stringify(formDataToSend));

      const res = await fetch("/api/products", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create listing");
      }

      toast.success("Product listed successfully!");
      setSuccessOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Enable submit without pre-checks (limits disabled)
  const handleReadyToCreate = () => setShowCreateButton(true);

  return (
    <div className="w-full mx-auto">
      <StepIndicator currentStep={currentStep} />

      <Card className="relative bg-gradient-to-br from-background/90 via-background/80 to-background/90 border-2 border-border/30 shadow-2xl overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rotate-45 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-6 translate-y-6 rotate-45 bg-gradient-to-br from-v0-green/5 to-transparent opacity-50" />
        </div>

        <CardContent className="relative z-10 p-6 md:p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
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
              <>
                <Step3AdditionalDetails
                  formData={formData}
                  setFormData={setFormData}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                  setErrors={setErrors}
                />
                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowReview((prev) => !prev)}
                    className="px-6 py-3 border-2 border-border/30 hover:border-primary/50 transition-colors"
                  >
                    {showReview ? "Hide Review" : "Preview Listing"}
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleReadyToCreate}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
                  >
                    Ready to Create Listing
                  </Button>
                </div>
              </>
            )}

            {/* Enhanced Navigation Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 md:pt-8 border-t-2 border-border/30 gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-3 px-8 py-3 border-2 border-border/30 hover:border-primary/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous Step
              </Button>

              {/* Progress Indicator */}
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        step <= currentStep
                          ? "bg-gradient-to-r from-primary to-v0-green"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-primary">
                  {currentStep} of 3
                </span>
              </div>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={nextStep}
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                showCreateButton && (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Listing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Create Listing
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          </form>

          {currentStep === 3 && showReview && (
            <div className="mt-8 pt-6 border-t">
              <ReviewCard formData={formData} categories={categories} />
            </div>
          )}
        </CardContent>
      </Card>
      {/* Success Modal after creating the listing */}
      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          // If user closes without choosing, redirect to home
          if (!open && successOpen) {
            setSuccessOpen(false);
            router.push("/");
          } else {
            setSuccessOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Listing Created
            </DialogTitle>
            <DialogDescription>
              Your listing has been successfully created. Where would you like
              to go next?
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Auto-redirecting to Homepage in {countdown}s
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSuccessOpen(false);
                router.push("/");
              }}
            >
              Go to Homepage
            </Button>
            <Button
              onClick={() => {
                setSuccessOpen(false);
                router.push("/dashboard");
              }}
              className="bg-gradient-to-r from-primary to-v0-dark-blue"
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Posting limit modal removed */}
    </div>
  );
}
