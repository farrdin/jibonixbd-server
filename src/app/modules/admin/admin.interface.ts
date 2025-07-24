export interface Admin {
  id: number
  user_id: number
  can_export_data: boolean
  created_at: string
  updated_at: string
}

// Interface for the input when creating a Admin (includes user data)
export interface CreateAdminInput {
  name?: string
  email: string
  phone?: string
  password: string
  nid_number?: string | null
  address?: string
  division?: string
  district?: string
  upazila?: string

  // Admin-specific fields
  can_export_data: boolean
}
