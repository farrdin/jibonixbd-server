export type DisasterType =
  | 'FLOOD'
  | 'CYCLONE'
  | 'EARTHQUAKE'
  | 'FIRE'
  | 'OTHERS'
export type DisasterSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'

export interface Disaster {
  id: string
  type: DisasterType
  image: string
  location: string
  affected_number: number
  start_date: string
  end_date: string
  severity: DisasterSeverity
  volunteer_id?: string
  created_at: string
  updated_at: string
}

export interface CreateDisasterInput {
  type: DisasterType
  image: string
  location: string
  affected_number: number
  start_date: string
  end_date: string
  severity: DisasterSeverity
  volunteer_id?: string
}
