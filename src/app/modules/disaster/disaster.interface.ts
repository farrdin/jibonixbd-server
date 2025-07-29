export type DisasterType =
  | 'FLOOD'
  | 'CYCLONE'
  | 'EARTHQUAKE'
  | 'FIRE'
  | 'OTHERS'
export type DisasterSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'

export interface Disaster {
  id: string
  volunteer_id: string
  type: DisasterType
  image: string
  location: string
  affected_number: number
  start_date: string
  end_date: string
  severity: DisasterSeverity
  created_at: string
  updated_at: string
}

export interface CreateDisasterInput {
  volunteer_id: string
  type: DisasterType
  image: string
  location: string
  affected_number: number
  start_date: string
  end_date: string
  severity: DisasterSeverity
}
