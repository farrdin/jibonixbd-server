import { z } from 'zod'

export const createInventoryValidationSchema = z.object({
  donation_id: z.string({ required_error: 'Donation ID is required' }),
  item_name: z.string({ required_error: 'Item name is required' }),
  quantity: z.number().nullable().optional(),
  amount: z.number().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  warehouse_location: z.string().nullable().optional()
})
