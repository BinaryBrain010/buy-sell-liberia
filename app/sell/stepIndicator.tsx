import React from "react";
import { Check, Package, Camera, Settings } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { 
    id: 1, 
    label: "Basic Info", 
    description: "Product details & pricing",
    icon: Package 
  },
  { 
    id: 2, 
    label: "Images & Location", 
    description: "Photos & location info",
    icon: Camera 
  },
  { 
    id: 3, 
    label: "Details & Delivery", 
    description: "Additional details & review",
    icon: Settings 
  },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="mb-6 w-full">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-primary via-v0-green to-v0-orange rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-primary to-v0-green rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-start justify-between relative">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative flex-1 flex flex-col items-center text-center group"
            >
              {/* Step Circle with Icon - Compact for landscape */}
              <div className="relative mb-3">
                <div
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm md:text-lg font-bold transition-all duration-500 shadow-lg md:shadow-xl border-2 md:border-4 ${
                    currentStep > step.id
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white border-white"
                      : currentStep === step.id
                      ? "bg-gradient-to-br from-primary to-v0-dark-blue text-white border-white shadow-xl md:shadow-2xl shadow-primary/30 scale-105 md:scale-110"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4 md:w-6 md:h-6" />
                  ) : (
                    <step.icon className="w-4 h-4 md:w-6 md:h-6" />
                  )}
                </div>

                {/* Pulse animation for current step */}
                {currentStep === step.id && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-v0-dark-blue animate-ping opacity-20" />
                )}
              </div>

              {/* Step Info - Compact */}
              <div className="space-y-1">
                <h3 className={`text-xs md:text-sm font-bold transition-colors ${
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.label}
                </h3>
                <p className={`text-[10px] md:text-xs transition-colors hidden md:block ${
                  currentStep >= step.id ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Step Progress Info - Compact */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              Step {currentStep} of {steps.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
