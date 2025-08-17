"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { Eye, EyeOff, User, Mail, Lock, Phone, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "France",
  "Germany",
  "Ghana",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Kenya",
  "Liberia",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Poland",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Vietnam",
]

interface SignupFormProps {
  onLogin: () => void
  onVerification: (email: string) => void
  initialData?: {
    fullName?: string
    email?: string
    isGoogleSignup?: boolean
  }
}

export function SignupForm({ onLogin, onVerification, initialData }: SignupFormProps) {
  console.log('[SIGNUP FORM] Component rendered with initialData:', initialData)
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    username: "",
    email: initialData?.email || "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleSignup, setIsGoogleSignup] = useState(false)
  const [usernameError, setUsernameError] = useState("") // Add state for username error
  const { signup, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const [phoneError, setPhoneError] = useState("");


  // Function to validate username (only letters and numbers)
  const isValidUsername = (username: string) => {
    return /^[a-zA-Z0-9]+$/.test(username)
  }

  const isValidPhone = (phone: string) => {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
};


  // Update form data when initialData changes (from Google signup)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        fullName: initialData.fullName || prev.fullName,
        email: initialData.email || prev.email,
      }))
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Check username validation when username field changes
    if (name === "username") {
      if (value.trim() && !isValidUsername(value)) {
        setUsernameError("Please use letters and numbers only in username")
      } else {
        setUsernameError("")
      }
    }
    if (name === "phone") {
  if (value.trim() && !isValidPhone(value)) {
    setPhoneError("Please enter a valid phone number");
  } else {
    setPhoneError("");
  }
}

    
  }

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.fullName.trim()) {
      toast({
        title: "Full name required",
        description: "Please enter your full name.",
        variant: "destructive",
      })
      return
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      toast({
        title: "Invalid username",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      })
      return
    }

    // Add username format validation
    if (!isValidUsername(formData.username)) {
      toast({
        title: "Invalid username format",
        description: "Username must contain only letters and numbers.",
        variant: "destructive",
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    if (!isValidPhone(formData.phone)) {
  toast({
    title: "Invalid phone number",
    description: "Please enter a valid phone number.",
    variant: "destructive",
  });
  return;
}


    if (!formData.country) {
      toast({
        title: "Country required",
        description: "Please select your country.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const signupData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        country: formData.country,
      }

      const result = await signup(signupData)

      console.log(`[SIGNUP FORM] User registered successfully: ${formData.email}`)

      // Remove the success toast from here
      toast({
        title: "Please check your email",
        description: "We've sent a verification code to your email address.",
      })

      onVerification(formData.email)
    } catch (error: any) {
      console.error(`[SIGNUP FORM] Registration failed:`, error)
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleSignup(true)
    try {
      const result = await loginWithGoogle()
      
      if (result.needsRegistration && result.userData) {
        console.log('[SIGNUP FORM] Google data received:', result.userData)
        
        // Pre-fill form with Google data
        setFormData(prev => ({
          ...prev,
          fullName: result.userData.fullName || '',
          email: result.userData.email || '',
        }))
        
        toast({
          title: "Complete your registration",
          description: "Please fill in the remaining details to complete your registration.",
        })
      } else {
        // User already exists and is logged in
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        })
      }
    } catch (error: any) {
      console.error("[SIGNUP FORM] Google signup error:", error)
      toast({
        title: "Google signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleSignup(false)
    }
  }

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.username.trim() !== "" &&
      formData.username.length >= 3 &&
      isValidUsername(formData.username) &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.country !== "" &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword
    )
  }

  return (
    <motion.div
      key="signup-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {initialData?.isGoogleSignup && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Connected with Google
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Some information has been pre-filled from your Google account
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Row 1: Full Name and Username */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="signup-name" className="text-sm">
              Full Name {initialData?.isGoogleSignup && <span className="text-xs text-blue-600 dark:text-blue-400">(from Google)</span>}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="signup-name"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="pl-10 h-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="signup-username" className="text-sm">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="signup-username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className={`pl-10 h-10 ${usernameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
            </div>
            {usernameError && (
              <p className="text-xs text-red-500 mt-1">{usernameError}</p>
            )}
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="space-y-1">
          <Label htmlFor="signup-email" className="text-sm">
            Email {initialData?.isGoogleSignup && <span className="text-xs text-blue-600 dark:text-blue-400">(from Google)</span>}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 h-10"
              required
            />
          </div>
        </div>

        {/* Row 3: Phone and Country */}
            <div className="grid grid-cols-2 gap-3">
  <div className="space-y-1">
    <Label htmlFor="signup-phone" className="text-sm">
      Phone Number *
    </Label>
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        id="signup-phone"
        name="phone"
        type="tel"
        placeholder="+1234567890"
        value={formData.phone}
        onChange={(e) => {
          handleChange(e);
          const value = e.target.value;
          if (value.trim() && !/^\+?[1-9]\d{1,14}$/.test(value)) {
            setPhoneError("Enter a valid phone starting with 1-9.");
          } else {
            setPhoneError("");
          }
        }}
        className={`pl-10 h-10 ${phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        required
      />
    </div>
    {phoneError && (
      <p className="text-xs text-red-500 mt-1">{phoneError}</p>
    )}
  </div>

  <div className="space-y-1">
    <Label htmlFor="signup-country" className="text-sm">
      Country
    </Label>
    <div className="relative">
      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Select value={formData.country} onValueChange={handleCountryChange} required>
        <SelectTrigger className="pl-10 h-10">
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
</div>


        {/* Row 4: Password and Confirm Password */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="signup-password" className="text-sm">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 h-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="signup-confirm-password" className="text-sm">
              Confirm
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 pr-10 h-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 mt-4" 
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {!initialData?.isGoogleSignup && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 bg-transparent"
            onClick={handleGoogleSignup}
            disabled={isLoading || isGoogleSignup}
          >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
            </svg>
            {isGoogleSignup ? "Connecting with Google..." : "Continue with Google"}
          </Button>
        </>
      )}

      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button variant="link" className="px-0 h-auto" onClick={onLogin}>
          Sign in
        </Button>
      </div>
    </motion.div>
  )
}
