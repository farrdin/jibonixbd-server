export interface Moderator {
  id: string
  user_id: string
  assigned_region: string
  can_verify_victims: boolean
  created_at: string
  updated_at: string
}

export interface CreateModeratorInput {
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

  assigned_region: string
  can_verify_victims: boolean
}
