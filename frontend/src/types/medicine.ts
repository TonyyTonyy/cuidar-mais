export type Medicine = {
  id: string
   medicationId?: string
     reminderId?: string
  name: string
  dosage: string
  time: string
  color: string
  nextIn: number
  notes: string
  status: "pending" | "taken" | "overdue"
}
