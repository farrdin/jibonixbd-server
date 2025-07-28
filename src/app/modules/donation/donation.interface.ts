export type DonationType = 'MONEY' | 'FOOD' | 'CLOTHES' | 'MEDICINE'
export type DeliveryType = 'PICKUP' | 'DROPOFF'
export type DonationStatus = 'PENDING' | 'RECEIVED' | 'DELIVERED'

export interface Donation {
  id: string
  donor_id: string
  disaster_id: string
  type: DonationType
  amount: number | null
  quantity: number | null
  donation_date: string
  delivery: DeliveryType
  status: DonationStatus
  transaction_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateDonationInput {
  donor_id: string
  disaster_id: string
  type: DonationType
  amount?: number
  quantity?: number
  donation_date: string
  delivery: DeliveryType
  status: DonationStatus
  transaction_id?: string | null
}
