export type Medicine = {
  id: number
  name: string
  dosage: string
  time: string
  nextIn: number
  notes: string
  status: "pending" | "taken" | "overdue"
}