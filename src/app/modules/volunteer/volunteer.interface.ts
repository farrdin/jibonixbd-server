export type skill = 'MEDICAL' | 'LOGISTICS' | 'RESCUE' | 'DISTRIBUTION'

export interface User {
  id: number
  user_id: string
  skills: skill[]
  preferred_locations: string[]
  availability_time: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}
