export type UserRole = 'VICTIM' | 'VOLUNTEER' | 'DONOR' | 'MODERATOR' | 'ADMIN'

export interface User {
  id: string
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
  created_at: string
  updated_at: string
  role: UserRole
  is_verified: boolean
}
