import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { createDonation } from './donation.service'
import { CreateDonationInput } from './donation.interface'
import { createDonationValidationSchema } from './donation.validation'

export async function handleCreateDonation(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createDonationValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as CreateDonationInput
    const donation = await createDonation(pool, validData)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Donation created successfully',
      data: donation
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal Server Error',
      data: null
    })
  }
}
