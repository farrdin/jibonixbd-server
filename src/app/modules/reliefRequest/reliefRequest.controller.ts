import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { CreateReliefRequestInput } from './reliefRequest.interface'
import { sendResponse } from '../../utils/sendResponse'
import { insertReliefRequest } from './reliefRequest.service'
import { createReliefRequestValidationSchema } from './reliefRequest.validation'

export async function createReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createReliefRequestValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as CreateReliefRequestInput
    const reliefRequest = await insertReliefRequest(pool, validData)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Relief request created successfully',
      data: reliefRequest
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
