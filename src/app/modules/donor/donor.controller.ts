import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { insertDonorWithUser } from './donor.service'
import { CreateDonorInput } from './donor.interface'
import { createDonorValidationSchema } from './donor.validation'

export async function createDonor(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createDonorValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as CreateDonorInput
    const newDonor = await insertDonorWithUser(pool, validData)
    const { user, donor } = newDonor

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Donor registered successfully',
      data: {
        id: donor.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization_name: donor.organization_name,
        donation_history: donor.donation_history,
        created_at: donor.created_at,
        updated_at: donor.updated_at
      }
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server Error',
      data: null
    })
  }
}
