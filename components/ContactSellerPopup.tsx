"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Phone, MessageCircle, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface ContactSellerButtonProps {
  sellerId: string
  productTitle: string
  showPhoneNumber: boolean
  sellerName: string
  className?: string
  variant?: 'phone' | 'whatsapp' | 'both'
  size?: 'sm' | 'md' | 'lg'
}

export function ContactSellerButton({
  sellerId,
  productTitle,
  showPhoneNumber,
  sellerName,
  className = '',
  variant = 'both',
  size = 'sm'
}: ContactSellerButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sellerPhone, setSellerPhone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSellerPhone = async () => {
    if (sellerPhone) return // Already fetched

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${sellerId}/contact`)
      if (!response.ok) throw new Error('Failed to fetch contact info')
      
      const data = await response.json()
      setSellerPhone(data.phone)
    } catch (error) {
      console.error('Error fetching seller phone:', error)
      toast.error('Failed to get seller contact information')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneClick = async () => {
    if (!showPhoneNumber) {
      toast.error('Seller has not made their phone number public')
      return
    }

    await fetchSellerPhone()
    setIsDialogOpen(true)
  }

  const handleWhatsAppClick = async () => {
    if (!showPhoneNumber) {
      toast.error('Seller has not made their phone number public')
      return
    }

    if (!sellerPhone) {
      await fetchSellerPhone()
    }

    if (sellerPhone) {
      const message = encodeURIComponent(`Hi! I'm interested in your product: ${productTitle}`)
      const cleanPhone = sellerPhone.replace(/[^0-9]/g, '')
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const copyPhoneNumber = () => {
    if (sellerPhone) {
      navigator.clipboard.writeText(sellerPhone)
      toast.success('Phone number copied to clipboard')
    }
  }

  const makePhoneCall = () => {
    if (sellerPhone) {
      window.location.href = `tel:${sellerPhone}`
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'lg': return 'h-10 px-4'
      case 'md': return 'h-9 px-3'
      case 'sm': return 'h-8 px-2'
      default: return 'h-8 px-2'
    }
  }

  if (variant === 'phone') {
    return (
      <>
        <Button 
          size="sm" 
          variant="outline" 
          className={`${getButtonSize()} ${className}`}
          onClick={handlePhoneClick}
          disabled={!showPhoneNumber}
        >
          <Phone className="h-3 w-3" />
          {size === 'lg' && <span className="ml-2">Call</span>}
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contact {sellerName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Getting contact information...</p>
                </div>
              ) : sellerPhone ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Phone Number</p>
                    <p className="text-lg font-mono font-semibold">{sellerPhone}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={makePhoneCall} className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" onClick={copyPhoneNumber}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Unable to get contact information</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (variant === 'whatsapp') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className={`${getButtonSize()} ${className}`}
        onClick={handleWhatsAppClick}
        disabled={!showPhoneNumber}
      >
        <MessageCircle className="h-3 w-3" />
        {size === 'lg' && <span className="ml-2">WhatsApp</span>}
      </Button>
    )
  }

  // Both phone and WhatsApp buttons
  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        className={`${getButtonSize()} ${className}`}
        onClick={handlePhoneClick}
        disabled={!showPhoneNumber}
      >
        <Phone className="h-3 w-3" />
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className={`${getButtonSize()} ${className}`}
        onClick={handleWhatsAppClick}
        disabled={!showPhoneNumber}
      >
        <MessageCircle className="h-3 w-3" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {sellerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Getting contact information...</p>
              </div>
            ) : sellerPhone ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Phone Number</p>
                  <p className="text-lg font-mono font-semibold">{sellerPhone}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={makePhoneCall}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleWhatsAppClick()}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
                
                <Button variant="outline" onClick={copyPhoneNumber} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Number
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Unable to get contact information</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ContactSellerButton
