export type RequestedItem =
  | 'FOOD'
  | 'MEDICINE'
  | 'SHELTER'
  | 'WATER'
  | 'CLOTHES'
export type RequestStatus = 'PENDING' | 'APPROVED' | 'COMPLETED'

export interface ReliefRequest {
  id: string
  victim_id: string
  requested_items: RequestedItem[]
  location: string
  status: RequestStatus
  assigned_volunteer_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateReliefRequestInput {
  victim_id: string
  requested_items: RequestedItem[]
  location: string
  status: RequestStatus
  assigned_volunteer_id?: number | null
}
