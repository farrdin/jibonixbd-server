export interface Admin {
  id: string
  user_id: string
  can_export_data: boolean
  created_at: string
  updated_at: string
}

// Interface for the input when creating a Admin (includes user data)
export interface CreateAdminInput {
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

  // Admin-specific fields
  can_export_data: boolean
}
