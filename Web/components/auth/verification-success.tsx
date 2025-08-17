"use client"

import { useEffect } from "react"
import { CheckCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface VerificationSuccessProps {
  onContinue: () => void
}

export function VerificationSuccess({ onContinue }: VerificationSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue()
    }, 3000) // Auto redirect after 3 seconds

    return () => clearTimeout(timer)
  }, [onContinue])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full text-center py-8"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Welcome to BuySell! 🎉
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Your email has been verified successfully.<br />
          You can now access all features of the platform.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-3"
      >
        <Button 
          onClick={onContinue}
          className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          Continue to Login
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Automatically redirecting in a few seconds...
        </p>
      </motion.div>
    </motion.div>
  )
}
