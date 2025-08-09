export interface Moderator {
  id: string
  user_id: string
  assigned_region: string
  can_verify_victims: boolean
  created_at: string
  updated_at: string
}

export interface CreateModeratorInput {
  email: string
  password: string
  name: string
  phone: string
  photo?: string
  nid_number?: string
  address?: string
  division?: string
  district?: string
  upazila?: string

  // Moderator-specific fields
  assigned_region?: string
  can_verify_victims: boolean
  // Add verification method
  verification_method: 'email' | 'phone'
}
