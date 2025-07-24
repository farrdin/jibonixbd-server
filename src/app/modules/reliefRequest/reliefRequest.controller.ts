import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { CreateReliefRequestInput } from './reliefRequest.interface'
import { sendResponse } from '../../utils/sendResponse'
import { insertReliefRequest } from './reliefRequest.service'

export async function createReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateReliefRequestInput>

    if (
      !body.victim_id ||
      !Array.isArray(body.requested_items) ||
      typeof body.location !== 'string'
    ) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Invalid input',
        data: null
      })
    }

    const newRequest = await insertReliefRequest(
      pool,
      body as CreateReliefRequestInput
    )

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Relief request created successfully',
      data: newRequest
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null
    })
  }
}
