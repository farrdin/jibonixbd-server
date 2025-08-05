export type VolunteerSkill = 'MEDICAL' | 'LOGISTICS' | 'RESCUE' | 'DISTRIBUTION'
export type VolunteerStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Volunteer {
  id: string
  user_id: string
  skills: VolunteerSkill[]
  preferred_locations: string
  availability_time?: string
  status: VolunteerStatus
  created_at: string
  updated_at: string
}

// Interface for the input when creating a volunteer (includes user data)
export interface CreateVolunteerInput {
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

  // Volunteer-specific fields
  skills: VolunteerSkill[]
  preferred_locations: string
  availability_time?: string
}
