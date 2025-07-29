export interface Victim {
  id: string
  user_id: string
  location?: string
  is_verified: boolean
  total_requests_made: number
  created_at: string
  updated_at: string
}

// Interface for the input when creating a victim (includes user data)
export interface CreateVictimInput {
  email: string
  password: string
  name?: string
  photo?: string
  phone?: string
  nid_number?: string | null
  address?: string
  division?: string
  district?: string
  upazila?: string

  // Victim-specific fields
  location?: string
  is_verified: boolean
  total_requests_made: number
}
