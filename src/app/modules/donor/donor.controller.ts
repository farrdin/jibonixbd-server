import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody, sendJson } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { insertDonorWithUser } from './donor.service'
import { CreateDonorInput } from './donor.interface'

export async function createDonor(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateDonorInput>

    if (
      !body ||
      typeof body !== 'object' ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      typeof body.donation_history !== 'string'
    ) {
      sendJson(res, 400, {
        status: 'failed',
        message:
          'Email, password and donation_history are required and must be strings'
      })
      return
    }

    const newDonor = await insertDonorWithUser(pool, body as CreateDonorInput)

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
