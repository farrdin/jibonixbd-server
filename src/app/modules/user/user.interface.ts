export type UserRole = 'VICTIM' | 'VOLUNTEER' | 'DONOR' | 'MODERATOR' | 'ADMIN'

export interface User {
  id: string
  name: string
  email: string
  photo: string
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
