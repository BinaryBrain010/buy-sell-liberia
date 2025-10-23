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
  const [needPaidStep, setNeedPaidStep] = useState(false);
  const [settingsCurrency, setSettingsCurrency] = useState<
    "USD" | "LRD" | string
  >("LRD");
  const [rates, setRates] = useState<{
    usdToLrdRate: number;
    lrdToUsdRate: number;
  }>({ usdToLrdRate: 200, lrdToUsdRate: 0.005 });
  const [paidCategoryPriceUSD, setPaidCategoryPriceUSD] = useState<
    number | null
  >(null);
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const [paidCategoriesEnabled, setPaidCategoriesEnabled] =
    useState<boolean>(false);
  const [isPaidCategoryActive, setIsPaidCategoryActive] =
    useState<boolean>(false);
  // Method selection removed per request; backend treats method as optional
  const [paidTxId, setPaidTxId] = useState("");
  const [paidScreenshot, setPaidScreenshot] = useState<string>("");

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

  // Fetch public settings (currency, rates, payment details) and monetization plans (prices)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [pubRes, plansRes] = await Promise.all([
          fetch("/api/settings/public", { cache: "no-store" }),
          fetch("/api/monetization/plans", { cache: "no-store" }),
        ]);
        const pub = await pubRes.json();
        const plans = await plansRes.json();
        if (pub?.currency) setSettingsCurrency(pub.currency);
        if (pub?.rates) setRates(pub.rates);
        // Prefer payment details from public settings (as used in MonetizationTab)
        if (pub?.paymentDetails) setPaymentDetails(pub.paymentDetails);
        // Feature toggles
        if (typeof pub?.paidCategoriesEnabled === "boolean") {
          setPaidCategoriesEnabled(!!pub.paidCategoriesEnabled);
        }
        if (typeof pub?.isPaidCategoryActive === "boolean") {
          setIsPaidCategoryActive(!!pub.isPaidCategoryActive);
        }
        // Paid category price (USD) from plans if available
        const paidCfg =
          plans?.plans?.paid_category_listing ||
          plans?.plans?.paid_category ||
          {};
        const paidPlan = paidCfg["paid"] || Object.values(paidCfg || {})[0];
        if (paidPlan?.price) setPaidCategoryPriceUSD(Number(paidPlan.price));
        // Plans fallback flags
        if (
          plans?.paidCategories?.enabled !== undefined &&
          plans?.paidCategories?.enabled !== null
        ) {
          setPaidCategoriesEnabled(Boolean(plans.paidCategories.enabled));
        } else if (typeof plans?.paidCategoriesEnabled === "boolean") {
          setPaidCategoriesEnabled(Boolean(plans.paidCategoriesEnabled));
        }
      } catch (e) {
        console.warn("Failed to fetch settings/plans:", (e as any)?.message);
      }
    };
    fetchConfig();
  }, []);

  const handleCopy = async (label: string, text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setLastCopied(label);
      setTimeout(() => setLastCopied(null), 1500);
    } catch {
      // noop
    }
  };

  // Determine if paid step is required (Vehicles or Real Estate and paid categories feature enabled)
  useEffect(() => {
    const selected = categories.find((c) => c._id === formData.category);
    const name = (selected?.name || "").toLowerCase();
    const isPaidCategoryName =
      name === "vehicles" || name === "real estate" || name === "realestate";
    const hasPrice =
      typeof paidCategoryPriceUSD === "number" && paidCategoryPriceUSD > 0;
    const featureEnabled = paidCategoriesEnabled || isPaidCategoryActive; // if both false, disable paid flow
    setNeedPaidStep(Boolean(featureEnabled && isPaidCategoryName && hasPrice));
  }, [
    formData.category,
    categories,
    paidCategoryPriceUSD,
    paidCategoriesEnabled,
    isPaidCategoryActive,
  ]);

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
    const maxStep = needPaidStep ? 4 : 3;
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, maxStep));
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
      // For paid categories, ensure payment info is provided; we'll create product first, then attach payment to that listing
      if (needPaidStep && (!paidTxId || !paidScreenshot)) {
        toast.error(
          "Please provide a transaction ID and upload a screenshot before continuing."
        );
        // Jump back to payment step
        setCurrentStep(3);
        setLoading(false);
        return;
      }

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
      const data = await res.json();
      const productId = data?.product?.id;

      // If paid flow, submit manual payment NOW with the created listing id
      if (needPaidStep && productId) {
        const paymentRes = await fetch("/api/monetization/manual-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            featureType: "paid_category_listing",
            plan: "paid",
            listing: productId,
            transactionId: paidTxId,
            screenshot: paidScreenshot,
            userNotes: `Paid category listing for ${
              data?.product?.title || "listing"
            }`,
          }),
        });
        if (paymentRes.ok) {
          toast.success(
            "Payment request submitted. We'll notify you after review."
          );
        } else {
          const errJ = await paymentRes.json().catch(() => ({}));
          console.warn("Manual payment create failed:", errJ);
          toast.warning?.(
            "Listing created as pending, but payment request couldn't be submitted. You can resubmit from Dashboard > Monetization."
          );
        }
      }

      // Success toast for listing creation (note: product may be pending in paid categories)
      toast.success("Product created successfully.");
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
      <StepIndicator
        currentStep={currentStep}
        totalSteps={needPaidStep ? 4 : 3}
      />

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
            {currentStep === 3 && needPaidStep && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold">Paid Category Payment</h3>
                <p className="text-sm text-muted-foreground">
                  This category requires a one-time payment per listing. Please
                  send your payment using one of the following methods, then
                  provide your transaction details below.
                </p>

                {/* Payment details (from /api/settings/public), similar to MonetizationTab */}
                {paymentDetails &&
                (paymentDetails.mtn ||
                  paymentDetails.orange ||
                  paymentDetails.bank) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paymentDetails.mtn && (
                      <div className="rounded border p-3">
                        <div className="font-medium">MTN Mobile Money</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-mono">
                            {paymentDetails.mtn.number ?? "-"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCopy("mtn", paymentDetails.mtn?.number)
                            }
                          >
                            {lastCopied === "mtn" ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    )}
                    {paymentDetails.orange && (
                      <div className="rounded border p-3">
                        <div className="font-medium">Orange Money</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-mono">
                            {paymentDetails.orange.number ?? "-"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCopy(
                                "orange",
                                paymentDetails.orange?.number
                              )
                            }
                          >
                            {lastCopied === "orange" ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    )}
                    {paymentDetails.bank && (
                      <div className="rounded border p-3">
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-xs text-muted-foreground">
                          {paymentDetails.bank.bankName ?? "-"}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Account Name</span>
                            <span className="font-mono">
                              {paymentDetails.bank.accountName ?? "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Account Number</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">
                                {paymentDetails.bank.accountNumber ?? "-"}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCopy(
                                    "bank",
                                    paymentDetails.bank?.accountNumber
                                  )
                                }
                              >
                                {lastCopied === "bank" ? "Copied" : "Copy"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Payment details not available at the moment.
                  </div>
                )}

                {/* Method selection removed by request; backend treats method as optional */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      className="border rounded-md p-2 w-full"
                      value={paidTxId}
                      onChange={(e) => setPaidTxId(e.target.value)}
                      placeholder="Enter the transaction/reference ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Payment Screenshot
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPaidScreenshot(String(reader.result || ""));
                        };
                        reader.readAsDataURL(f);
                      }}
                    />
                  </div>
                </div>

                {typeof paidCategoryPriceUSD === "number" && (
                  <div className="text-sm text-muted-foreground">
                    Fee:{" "}
                    {(() => {
                      const from = "USD";
                      const to = (settingsCurrency || "LRD").toUpperCase();
                      const {
                        convertAmount,
                        formatMoney,
                      } = require("@/lib/currency");
                      const inSys = convertAmount(
                        paidCategoryPriceUSD,
                        from,
                        to,
                        rates
                      );
                      return `${formatMoney(inSys, to)} (${formatMoney(
                        paidCategoryPriceUSD,
                        from
                      )})`;
                    })()}
                  </div>
                )}
              </div>
            )}
            {(!needPaidStep && currentStep === 3) ||
            (needPaidStep && currentStep === 4) ? (
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
            ) : null}

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
                  {(needPaidStep ? [1, 2, 3, 4] : [1, 2, 3]).map((step) => (
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
                  {currentStep} of {needPaidStep ? 4 : 3}
                </span>
              </div>

              {currentStep < (needPaidStep ? 4 : 3) ? (
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
              {needPaidStep ? "Listing Pending Approval" : "Listing Created"}
            </DialogTitle>
            <DialogDescription>
              {needPaidStep ? (
                <>
                  Your payment request has been submitted. Your listing is
                  currently pending and will be posted soon after confirmation.
                </>
              ) : (
                <>
                  Your listing has been successfully created. Where would you
                  like to go next?
                </>
              )}
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
