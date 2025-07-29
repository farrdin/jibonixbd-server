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
  name?: string
  photo?: string
  phone?: string
  nid_number?: string | null
  address?: string
  division?: string
  district?: string
  upazila?: string
  assigned_region?: string
  can_verify_victims: boolean
}
