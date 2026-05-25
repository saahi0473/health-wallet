"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, Clock, Shield, Copy, Check, Send, AlertTriangle, Eye, Download, Share2 } from "lucide-react"

interface SecureShareModalProps {
  isOpen: boolean
  onClose: () => void
  document: {
    id: string
    title: string
    type: string
    size: string
  }
}

export function SecureShareModal({ isOpen, onClose, document }: SecureShareModalProps) {
  const [step, setStep] = useState<"form" | "generated">("form")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [expiryDuration, setExpiryDuration] = useState("24h")
  const [message, setMessage] = useState("")
  const [permissions, setPermissions] = useState<"view" | "download">("view")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const expiryOptions = [
    { value: "1h", label: "1 Hour" },
    { value: "6h", label: "6 Hours" },
    { value: "24h", label: "24 Hours" },
    { value: "3d", label: "3 Days" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
  ]

  const handleGenerateLink = async () => {
    if (!recipientEmail) return

    setIsGenerating(true)

    // Simulate API call to generate secure link
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockLink = `https://healthwallet.app/shared/${document.id}/${Math.random().toString(36).substring(2, 15)}`
    setGeneratedLink(mockLink)
    setStep("generated")
    setIsGenerating(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleSendEmail = () => {
    // Simulate sending email
    console.log("Sending email to:", recipientEmail)
    onClose()
  }

  const handleReset = () => {
    setStep("form")
    setRecipientEmail("")
    setMessage("")
    setGeneratedLink("")
    setCopied(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Secure Share Document
          </DialogTitle>
          <DialogDescription>
            Generate a secure, time-limited link to share "{document.title}" with healthcare providers.
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-6">
            {/* Document Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{document.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {document.type} • {document.size}
                    </p>
                  </div>
                  <Badge variant="secondary">{document.type}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Recipient Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@hospital.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                The recipient will receive an email with the secure link and access instructions.
              </p>
            </div>

            {/* Expiry Duration */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Link Expiry
              </Label>
              <Select value={expiryDuration} onValueChange={setExpiryDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The link will automatically expire after the selected duration for security.
              </p>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Access Permissions
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={permissions === "view" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPermissions("view")}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Only
                </Button>
                <Button
                  variant={permissions === "download" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPermissions("download")}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  View & Download
                </Button>
              </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Optional Message</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message for the recipient..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Security Notice</p>
                <p className="text-xs text-muted-foreground">
                  This link will be encrypted and can only be accessed by the recipient. All access attempts are logged
                  for your security.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateLink}
                disabled={!recipientEmail || isGenerating}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Generate Secure Link
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Secure Link Generated!</h3>
              <p className="text-muted-foreground">Your document can now be securely shared with {recipientEmail}</p>
            </div>

            {/* Generated Link */}
            <div className="space-y-3">
              <Label>Secure Share Link</Label>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600">Link copied to clipboard!</p>}
            </div>

            {/* Link Details */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium">{recipientEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium">
                    {expiryOptions.find((opt) => opt.value === expiryDuration)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Permissions:</span>
                  <span className="font-medium capitalize">{permissions}</span>
                </div>
                {message && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Message:</p>
                    <p className="text-sm">{message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Share with Another Person
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSendEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
