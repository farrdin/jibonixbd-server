export type UserRole =
  | 'VICTIM'
  | 'VOLUNTEER'
  | 'DONOR'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN'

export interface User {
  id: number
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
  is_verified: boolean
  nid_number: string | null
  address: string
  division: string
  district: string
  upazila: string
  created_at: string
  updated_at: string
}
