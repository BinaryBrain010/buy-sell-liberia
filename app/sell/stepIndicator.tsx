import React from 'react'

interface StepIndicatorProps {
  currentStep: number
}

const steps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Images & Location' },
  { id: 3, label: 'Details & Delivery' },
]

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="mb-10 w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex-1 flex flex-col items-center text-center">
            {/* Connector to previous step (skip for first) */}
            {index > 0 && (
              <div className="absolute top-1/2 left-0 w-full -z-10">
                <div
                  className={`h-1 ${
                    currentStep > step.id - 1 ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{
                    width: '100%',
                    marginLeft: '-50%',
                    zIndex: -1,
                  }}
                ></div>
              </div>
            )}

            {/* Step circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep >= step.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.id}
            </div>

            {/* Step label */}
            <div className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StepIndicator
