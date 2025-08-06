import { z } from 'zod'

export const createDisasterValidationSchema = z.object({
  type: z.enum(['FLOOD', 'CYCLONE', 'EARTHQUAKE', 'FIRE', 'OTHERS'], {
    required_error: 'Disaster type is required'
  }),

  image: z.string({ required_error: 'Image URL is required' }),

  location: z.string({ required_error: 'Location is required' }),

  affected_number: z
    .number({ required_error: 'Affected number is required' })
    .int('Must be an integer')
    .nonnegative('Must be 0 or more'),

  start_date: z.string({ required_error: 'Start date is required' }),
  end_date: z.string({ required_error: 'End date is required' }),

  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'EXTREME'], {
    required_error: 'Disaster severity is required'
  }),
  volunteer_id: z.string().nullable().optional()
})
