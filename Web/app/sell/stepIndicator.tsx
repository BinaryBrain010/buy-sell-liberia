import React from 'react'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
}

const steps = [
  { id: 1, label: 'Basic Info', icon: '📝' },
  { id: 2, label: 'Images & Location', icon: '📸' },
  { id: 3, label: 'Details & Delivery', icon: '✅' },
]

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="mb-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex-1 flex flex-col items-center text-center">
            {/* Connector line */}
            {index > 0 && (
              <div className="absolute top-4 left-0 w-full -z-10">
                <div
                  className={`h-0.5 transition-all duration-300 ${
                    currentStep > step.id - 1 
                      ? 'bg-blue-500' 
                      : 'bg-muted'
                  }`}
                  style={{
                    width: '100%',
                    marginLeft: '-50%',
                  }}
                ></div>
              </div>
            )}

            {/* Step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>

            {/* Step label */}
            <div className="mt-2 text-xs font-medium text-muted-foreground">
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StepIndicator
