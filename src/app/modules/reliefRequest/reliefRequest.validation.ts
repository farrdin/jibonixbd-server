import { z } from 'zod'

export const createReliefRequestValidationSchema = z.object({
  victim_id: z.string({ required_error: 'Victim ID is required' }),
  requested_items: z
    .array(z.enum(['FOOD', 'MEDICINE', 'SHELTER', 'WATER', 'CLOTHES']))
    .nonempty({ message: 'At least one requested item is required' }),
  location: z.string({ required_error: 'Location is required' }),
  status: z.enum(['PENDING', 'APPROVED', 'COMPLETED']).default('PENDING'),
  assigned_volunteer_id: z.string().nullable().optional()
})
