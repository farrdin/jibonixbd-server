import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { createDisaster } from './disaster.service'
import { CreateDisasterInput } from './disaster.interface'

export async function handleCreateDisaster(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateDisasterInput>

    if (
      !Array.isArray(body.volunteer_ids) ||
      !body.type ||
      !body.image ||
      !body.location ||
      !body.affected_number ||
      !body.start_date ||
      !body.end_date ||
      !body.severity
    ) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Missing required disaster fields',
        data: null
      })
      return
    }

    const disaster = await createDisaster(pool, body as CreateDisasterInput)

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Disaster recorded successfully',
      data: disaster
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
