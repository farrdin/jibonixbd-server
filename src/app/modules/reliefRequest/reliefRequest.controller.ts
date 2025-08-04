import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { CreateReliefRequestInput } from './reliefRequest.interface'
import { sendResponse } from '../../utils/sendResponse'
import {
  createReliefRequest,
  getAllReliefRequests,
  getMyReliefRequests,
  getReliefRequestById,
  updateReliefRequest
} from './reliefRequest.service'
import { createReliefRequestValidationSchema } from './reliefRequest.validation'
import { getAuthUser } from '../../middlewares/auth'

export async function handleCreateReliefRequest(
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
    const reliefRequest = await createReliefRequest(pool, validData)
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
export async function handleGetAllReliefRequests(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const requests = await getAllReliefRequests(pool)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All relief requests retrieved successfully',
      data: requests
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
export async function handleGetReliefRequestById(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const id = req.url?.split('/').pop()?.split('?')[0]
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid request ID',
      data: null
    })
    return
  }

  try {
    const request = await getReliefRequestById(pool, id)
    if (!request) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Relief request not found',
        data: null
      })
      return
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Relief request retrieved successfully',
      data: request
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
export async function handleGetMyReliefRequests(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const user = getAuthUser(req)
    if (!user || !user.email) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
        data: null
      })
      return
    }
    const victimResult = await pool.query(
      `SELECT id FROM victims WHERE user_id = $1`,
      [user.id]
    )
    const victimId = victimResult.rows[0]?.id
    const requests = await getMyReliefRequests(pool, victimId)

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Relief requests retrieved successfully',
      data: requests
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
export async function handleUpdateReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const id = req.url?.split('/').pop()?.split('?')[0]
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid request ID',
      data: null
    })
    return
  }

  try {
    const body = await parseJsonBody(req)
    const parsed = createReliefRequestValidationSchema.partial().safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as Partial<CreateReliefRequestInput>
    const updatedRequest = await updateReliefRequest(pool, id, validData)

    if (!updatedRequest) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Relief request not found',
        data: null
      })
      return
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Relief request updated successfully',
      data: updatedRequest
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
export async function handleDeleteReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const id = req.url?.split('/').pop()?.split('?')[0]
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid relief request ID',
      data: null
    })
    return
  }

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM relief_requests WHERE id = $1 RETURNING *',
        [id]
      )

      if (!result.rows.length) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: 'Relief request not found',
          data: null
        })
        return
      }

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Relief request deleted successfully',
        data: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null
    })
  }
}
