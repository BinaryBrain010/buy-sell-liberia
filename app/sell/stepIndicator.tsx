import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Images & Location" },
  { id: 3, label: "Details & Delivery" },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="mb-4 w-full px-2">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="relative flex-1 flex flex-col items-center text-center"
          >
            {/* Connector line */}
            {index > 0 && (
              <div className="absolute top-3 left-0 w-full -z-10">
                <div
                  className={`h-0.5 ${
                    currentStep > step.id - 1
                      ? "bg-blue-500"
                      : "bg-muted-foreground/30"
                  }`}
                  style={{ width: "100%", marginLeft: "-50%" }}
                ></div>
              </div>
            )}

            {/* Step circle */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-300 ${
                currentStep > step.id
                  ? "bg-green-500 text-white"
                  : currentStep === step.id
                  ? "bg-blue-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
            </div>

            {/* Label */}
            <span className="mt-1 text-[10px] text-muted-foreground">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
