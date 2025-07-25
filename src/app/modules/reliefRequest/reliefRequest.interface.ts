export type RequestedItem =
  | 'FOOD'
  | 'MEDICINE'
  | 'SHELTER'
  | 'WATER'
  | 'CLOTHES'
export type RequestStatus = 'PENDING' | 'APPROVED' | 'COMPLETED'

export interface ReliefRequest {
  id: number
  victim_id: number
  requested_items: RequestedItem[]
  location: string
  status: RequestStatus
  assigned_volunteer_id: number | string | null
  created_at: string
  updated_at: string
}

export interface CreateReliefRequestInput {
  victim_id: number
  requested_items: RequestedItem[]
  location: string
  status?: RequestStatus
  assigned_volunteer_id?: number | null
}
