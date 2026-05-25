"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { appointmentStorage, type Appointment } from "@/lib/health-data"
import { sessionStorage as appSession } from "@/lib/user-management"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const specialties = [
  "General Practice", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "Neurology", "Oncology", "Ophthalmology",
  "Orthopedics", "Pediatrics", "Psychiatry", "Radiology",
  "Rheumatology", "Urology", "Other"
]

const statusConfig = {
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
}

function AppointmentCard({
  apt,
  onStatusChange,
  onDelete,
}: {
  apt: Appointment
  onStatusChange: (id: string, status: Appointment["status"]) => void
  onDelete: (id: string) => void
}) {
  const date = new Date(apt.date + "T" + apt.time)
  const isPastDate = isPast(date) && !isToday(date)
  const isAptToday = isToday(date)
  const isAptTomorrow = isTomorrow(date)

  return (
    <Card className={cn(
      "doc-card border-border/60",
      isAptToday && "border-l-4 border-l-primary"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className="flex flex-col items-center justify-center w-14 h-14 bg-muted rounded-xl flex-shrink-0 text-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {format(date, "MMM")}
            </span>
            <span className="text-xl font-bold text-foreground leading-none">
              {format(date, "d")}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{apt.title}</h3>
              <Badge className={cn("text-xs border flex-shrink-0", statusConfig[apt.status].color)}>
                {statusConfig[apt.status].label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {apt.doctor}
              </span>
              {apt.specialty && (
                <span className="text-xs">{apt.specialty}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {apt.time}
              </span>
              {apt.hospital && (
                <span className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  {apt.hospital}
                </span>
              )}
            </div>

            {(isAptToday || isAptTomorrow) && (
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2",
                isAptToday ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700"
              )}>
                {isAptToday ? "📅 Today" : "📅 Tomorrow"}
              </div>
            )}

            {apt.notes && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-3">
                {apt.notes}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
              {apt.status === "upcoming" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
                    onClick={() => onStatusChange(apt.id, "completed")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                    onClick={() => onStatusChange(apt.id, "cancelled")}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground ml-auto"
                onClick={() => onDelete(apt.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AddAppointmentModal({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdded: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [specialty, setSpecialty] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const title = data.get("title") as string
    const doctor = data.get("doctor") as string
    const date = data.get("date") as string
    const time = data.get("time") as string

    const errs: Record<string, string> = {}
    if (!title) errs.title = "Title is required"
    if (!doctor) errs.doctor = "Doctor name is required"
    if (!date) errs.date = "Date is required"
    if (!time) errs.time = "Time is required"
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 500))

    const session = appSession.getSession()
    if (!session) { setIsLoading(false); return }

    appointmentStorage.saveAppointment({
      title,
      doctor,
      specialty,
      hospital: data.get("hospital") as string,
      date,
      time,
      notes: data.get("notes") as string,
      status: "upcoming",
      userEmail: session.email,
    }, session.email)

    setIsLoading(false)
    setSpecialty("")
    setErrors({})
    form.reset()
    onOpenChange(false)
    onAdded()
    toast.success("Appointment scheduled successfully!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>Add a new doctor visit or medical appointment.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Appointment Title *</Label>
            <Input id="title" name="title" placeholder="e.g., Annual physical exam" />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor / Provider *</Label>
              <Input id="doctor" name="doctor" placeholder="Dr. Sarah Johnson" />
              {errors.doctor && <p className="text-xs text-destructive">{errors.doctor}</p>}
            </div>
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospital">Hospital / Clinic</Label>
            <Input id="hospital" name="hospital" placeholder="City General Hospital" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" min={new Date().toISOString().split("T")[0]} />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" name="time" type="time" />
              {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any notes or preparation instructions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-health text-white" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scheduling...
                </span>
              ) : (
                "Schedule Appointment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | Appointment["status"]>("all")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const session = appSession.getSession()
    if (session) {
      setUserEmail(session.email)
      loadAppointments(session.email)
    }
  }, [])

  const loadAppointments = (email: string) => {
    setAppointments(appointmentStorage.getUserAppointments(email))
  }

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    appointmentStorage.updateAppointment(id, { status })
    if (userEmail) loadAppointments(userEmail)
    toast.success(`Appointment marked as ${status}`)
  }

  const handleDelete = (id: string) => {
    appointmentStorage.deleteAppointment(id)
    if (userEmail) loadAppointments(userEmail)
    toast.success("Appointment deleted")
  }

  const filtered = appointments.filter(
    (a) => filterStatus === "all" || a.status === filterStatus
  )

  const upcomingCount = appointments.filter((a) => a.status === "upcoming").length

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            {upcomingCount > 0
              ? `${upcomingCount} upcoming appointment${upcomingCount !== 1 ? "s" : ""}`
              : "No upcoming appointments"}
          </p>
        </div>
        <Button
          className="gradient-health text-white gap-2 w-full sm:w-auto"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "upcoming", "completed", "cancelled"] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="capitalize"
          >
            {status === "all" ? "All" : statusConfig[status].label}
            {status !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({appointments.filter((a) => a.status === status).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Appointments list */}
      {filtered.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {filtered.map((apt) => (
            <AppointmentCard
              key={apt.id}
              apt={apt}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-muted rounded-2xl mb-4">
            <Calendar className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {appointments.length === 0 ? "No appointments yet" : "No appointments found"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {appointments.length === 0
              ? "Schedule your first appointment to keep track of your medical visits."
              : "Try changing the filter to see more appointments."}
          </p>
          {appointments.length === 0 && (
            <Button
              className="gradient-health text-white gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Schedule First Appointment
            </Button>
          )}
        </div>
      )}

      <AddAppointmentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdded={() => userEmail && loadAppointments(userEmail)}
      />
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <AppShell>
      <AppointmentsContent />
    </AppShell>
  )
}
