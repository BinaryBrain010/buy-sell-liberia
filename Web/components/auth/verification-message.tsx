"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface VerificationMessageProps {
  email: string
  onBack: () => void
  onClose: () => void
}

export function VerificationMessage({ email, onBack, onClose }: VerificationMessageProps) {
  return (
    <motion.div
      key="verification-message"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full text-center"
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
        <p className="text-muted-foreground mb-4">We've sent a verification link to</p>
        <p className="font-medium text-foreground break-all">{email}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground mb-6">
        <Mail className="h-5 w-5 mx-auto mb-2" />
        <p>Click the link in your email to verify your account. If you don't see it, check your spam folder.</p>
      </div>

      <div className="space-y-3">
        <Button onClick={onClose} className="w-full h-11">
          Got it, thanks!
        </Button>

        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign Up
        </Button>
      </div>
    </motion.div>
  )
}
