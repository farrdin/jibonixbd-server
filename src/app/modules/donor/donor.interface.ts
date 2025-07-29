export interface Donor {
  id: string
  user_id: string
  organization_name?: string
  donation_history?: string
  created_at: string
  updated_at: string
}

export interface CreateDonorInput {
  email: string
  password: string
  name?: string
  photo?: string
  phone?: string
  nid_number?: string
  address?: string
  division?: string
  district?: string
  upazila?: string

  // Donor-specific fields
  organization_name?: string
  donation_history?: string
}
