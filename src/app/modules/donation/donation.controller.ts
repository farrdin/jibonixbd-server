import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { createDonation } from './donation.service'
import { CreateDonationInput } from './donation.interface'

export async function handleCreateDonation(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateDonationInput>

    if (
      !body.donor_id ||
      !body.type ||
      !body.donation_date ||
      !body.delivery ||
      !body.status
    ) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message:
          'Required fields: donor_id, type, donation_date, delivery, status',
        data: null
      })
      return
    }

    const donation = await createDonation(pool, body as CreateDonationInput)

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
