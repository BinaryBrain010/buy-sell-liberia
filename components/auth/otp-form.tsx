"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface OtpFormProps {
  email: string
  onBack: () => void
  onSuccess: () => void
  context?: "signup" | "forgot-password"
}

export function OtpForm({ email, onBack, onSuccess, context = "signup" }: OtpFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute
  const [step, setStep] = useState<"otp" | "reset" | "success">("otp")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { toast } = useToast()
  const { verifyOtp, resetPassword, sendOtp } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, "0")}`
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      if (context === "signup") {
        await verifyOtp(email, otpCode)
        console.log(`[OTP FORM] OTP verified successfully for ${email}`)
        setStep("success")
        setTimeout(() => {
          onSuccess()
        }, 2000) // Show success message for 2 seconds
      } else {
        // For password reset, we just verify OTP and move to reset form
        // The actual password reset will be done in handleResetSubmit
        console.log(`[OTP FORM] Password reset OTP verified for ${email}`)
        setStep("reset")
      }
    } catch (error: any) {
      console.error(`[OTP FORM] OTP verification failed:`, error)
      toast({
        title: "Invalid code",
        description: error.message || "The verification code is incorrect. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      await resetPassword(email, otp.join(""), newPassword)
      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully.",
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setIsLoading(true)
    try {
      const otpType = context === "forgot-password" ? "reset" : "verification"
      await sendOtp(email, otpType)
      setTimeLeft(60) // Reset to 1 minute
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      })
      console.log(`[OTP FORM] OTP resent to ${email}`)
    } catch (error: any) {
      toast({
        title: "Resend failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "success") {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center py-8"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-green-600">Email Verified!</h3>
        <p className="text-muted-foreground mb-4">Your account has been created successfully.</p>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="otp-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {step === "otp" ? (
        <>
          <div className="text-center text-muted-foreground mb-6">
            <p>We've sent a 6-digit verification code to</p>
            <p className="font-medium text-foreground break-all">{email}</p>
          </div>
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold"
                  />
                ))}
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {timeLeft > 0 ? (
                <p>Code expires in {formatTime(timeLeft)}</p>
              ) : (
                <p className="text-destructive">Code has expired</p>
              )}
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading || timeLeft === 0}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={isLoading || !canResend}
              className="h-auto"
            >
              {canResend ? "Resend Code" : `Resend in ${formatTime(timeLeft)}`}
            </Button>
          </div>
          <Button type="button" variant="ghost" className="w-full mt-4" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </motion.div>
  )
}
