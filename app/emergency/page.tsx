"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  Heart,
  Phone,
  Plus,
  X,
  Save,
  User,
  Stethoscope,
  Pill,
  Shield,
  AlertTriangle,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { emergencyStorage, type EmergencyProfile } from "@/lib/health-data"
import { sessionStorage as appSession } from "@/lib/user-management"
import { toast } from "sonner"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]

export default function EmergencyPage() {
  return (
    <AppShell>
      <EmergencyContent />
    </AppShell>
  )
}

function EmergencyContent() {
  const [profile, setProfile] = useState<EmergencyProfile | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [bloodGroup, setBloodGroup] = useState("")
  const [newAllergy, setNewAllergy] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [newCondition, setNewCondition] = useState("")
  const [conditions, setConditions] = useState<string[]>([])
  const [newMedication, setNewMedication] = useState("")
  const [medications, setMedications] = useState<string[]>([])
  const [insuranceProvider, setInsuranceProvider] = useState("")
  const [policyNumber, setPolicyNumber] = useState("")

  // Contact form state
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactRelationship, setContactRelationship] = useState("")
  const [showAddContact, setShowAddContact] = useState(false)

  useEffect(() => {
    const session = appSession.getSession()
    if (session) {
      setUserEmail(session.email)
      const p = emergencyStorage.getProfile(session.email)
      if (p) {
        setProfile(p)
        setBloodGroup(p.bloodGroup || "")
        setAllergies(p.allergies || [])
        setConditions(p.conditions || [])
        setMedications(p.medications || [])
        setInsuranceProvider(p.insuranceProvider || "")
        setPolicyNumber(p.insurancePolicyNumber || "")
      }
    }
  }, [])

  const addTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setValue: (v: string) => void
  ) => {
    const trimmed = value.trim()
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed])
      setValue("")
    }
  }

  const removeTag = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((i) => i !== item))
  }

  const handleSave = async () => {
    if (!userEmail) return
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 500))

    const updated = emergencyStorage.saveProfile(userEmail, {
      bloodGroup,
      allergies,
      conditions,
      medications,
      insuranceProvider,
      insurancePolicyNumber: policyNumber,
      contacts: profile?.contacts || [],
    })
    setProfile(updated)
    setIsSaving(false)
    toast.success("Emergency profile saved successfully!")
  }

  const handleAddContact = () => {
    if (!contactName || !contactPhone || !contactRelationship) {
      toast.error("Please fill in all contact fields")
      return
    }
    if (!userEmail) return

    emergencyStorage.addContact(userEmail, {
      name: contactName,
      phone: contactPhone,
      relationship: contactRelationship,
    })

    const updated = emergencyStorage.getProfile(userEmail)
    setProfile(updated)
    setContactName("")
    setContactPhone("")
    setContactRelationship("")
    setShowAddContact(false)
    toast.success("Emergency contact added!")
  }

  const handleRemoveContact = (contactId: string) => {
    if (!userEmail) return
    emergencyStorage.removeContact(userEmail, contactId)
    const updated = emergencyStorage.getProfile(userEmail)
    setProfile(updated)
    toast.success("Contact removed")
  }

  const TagInput = ({
    value,
    onChange,
    onAdd,
    placeholder,
  }: {
    value: string
    onChange: (v: string) => void
    onAdd: () => void
    placeholder: string
  }) => (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
      />
      <Button type="button" variant="outline" size="sm" onClick={onAdd} className="flex-shrink-0">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )

  const TagBadges = ({
    items,
    onRemove,
    color = "secondary",
  }: {
    items: string[]
    onRemove: (item: string) => void
    color?: "secondary" | "destructive"
  }) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant={color} className="gap-1.5 pr-1.5">
          {item}
          <button
            onClick={() => onRemove(item)}
            className="hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="h-7 w-7 text-rose-500" />
            Emergency Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Critical health information for emergency situations
          </p>
        </div>
        <Button
          className="gradient-health text-white gap-2 flex-shrink-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>

      {/* Emergency banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
        <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            This information is for medical emergencies only
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
            Keep this profile updated so emergency responders can quickly access your critical health data.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Blood Group */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Blood Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {bloodGroup && (
              <div className="mt-3 flex items-center justify-center">
                <div className="px-6 py-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                  <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                    {bloodGroup}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insurance */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-500" />
              Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Provider</Label>
              <Input
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g., Blue Cross Blue Shield"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Policy Number</Label>
              <Input
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g., BCB123456789"
              />
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TagInput
              value={newAllergy}
              onChange={setNewAllergy}
              onAdd={() => addTag(newAllergy, allergies, setAllergies, setNewAllergy)}
              placeholder="e.g., Penicillin, Peanuts"
            />
            {allergies.length > 0 ? (
              <TagBadges
                items={allergies}
                onRemove={(item) => removeTag(item, allergies, setAllergies)}
                color="destructive"
              />
            ) : (
              <p className="text-sm text-muted-foreground">No allergies recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-purple-500" />
              Medical Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TagInput
              value={newCondition}
              onChange={setNewCondition}
              onAdd={() => addTag(newCondition, conditions, setConditions, setNewCondition)}
              placeholder="e.g., Diabetes, Hypertension"
            />
            {conditions.length > 0 ? (
              <TagBadges
                items={conditions}
                onRemove={(item) => removeTag(item, conditions, setConditions)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No conditions recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medications */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Pill className="h-4 w-4 text-blue-500" />
            Current Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TagInput
            value={newMedication}
            onChange={setNewMedication}
            onAdd={() => addTag(newMedication, medications, setMedications, setNewMedication)}
            placeholder="e.g., Metformin 500mg, Aspirin 75mg"
          />
          {medications.length > 0 ? (
            <TagBadges
              items={medications}
              onRemove={(item) => removeTag(item, medications, setMedications)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No medications recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-500" />
              Emergency Contacts
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setShowAddContact(!showAddContact)}
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add contact form */}
          {showAddContact && (
            <div className="p-4 bg-muted/50 rounded-xl space-y-3 border border-border">
              <h4 className="text-sm font-semibold">New Emergency Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Full Name *</Label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number *</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    type="tel"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Relationship *</Label>
                  <Input
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    placeholder="Spouse, Parent, etc."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gradient-health text-white" onClick={handleAddContact}>
                  Add Contact
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddContact(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Contacts list */}
          {profile?.contacts && profile.contacts.length > 0 ? (
            <div className="space-y-3">
              {profile.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                    <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{contact.relationship}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !showAddContact && (
              <div className="text-center py-6">
                <Phone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No emergency contacts added</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
