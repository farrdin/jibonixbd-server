export interface Donor {
  id: string
  user_id: string
  organization_name: string | null
  donation_history: string
  created_at: string
  updated_at: string
}

export interface CreateDonorInput {
  name?: string
  email: string
  photo: string
  phone?: string
  password: string
  nid_number?: string | null
  address?: string
  division?: string
  district?: string
  upazila?: string

  // Donor-specific fields
  organization_name?: string | null
  donation_history: string
}
