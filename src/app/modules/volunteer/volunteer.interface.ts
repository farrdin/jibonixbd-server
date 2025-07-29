export type VolunteerSkill = 'MEDICAL' | 'LOGISTICS' | 'RESCUE' | 'DISTRIBUTION'
export type VolunteerStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Volunteer {
  id: string
  user_id: string
  skills: VolunteerSkill[]
  preferred_locations: string | null
  availability_time: string | null
  status: VolunteerStatus
  created_at: string
  updated_at: string
}

// Interface for the input when creating a volunteer (includes user data)
export interface CreateVolunteerInput {
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

  // Volunteer-specific fields
  skills?: VolunteerSkill[]
  preferred_locations?: string
  availability_time?: string
}
