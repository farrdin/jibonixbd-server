import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { createDisaster } from './disaster.service'
import { CreateDisasterInput } from './disaster.interface'
import { createDisasterValidationSchema } from './disaster.validation'

export async function handleCreateDisaster(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createDisasterValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as CreateDisasterInput
    const disaster = await createDisaster(pool, validData)
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
