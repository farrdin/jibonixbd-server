import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import {
  createDisaster,
  deleteDisaster,
  getAllDisasters,
  getDisasterById,
  updateDisaster
} from './disaster.service'
import { CreateDisasterInput } from './disaster.interface'
import { createDisasterValidationSchema } from './disaster.validation'
import { pushNotification } from '../notification/notification.service'
import { notifyUser } from '../../../server'

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

    const adminsMods = await pool.query(
      `SELECT id FROM users WHERE role IN ('ADMIN', 'MODERATOR')`
    )
    for (const user of adminsMods.rows) {
      await pushNotification(
        pool,
        notifyUser,
        user.id,
        'NEW_DISASTER',
        'disaster',
        { disaster }
      )
    }

    // 🔥 Notify Volunteers in disaster area
    const volunteers = await pool.query(
      `SELECT id FROM users WHERE role='VOLUNTEER' AND $1 = ANY(district)`,
      [validData.location]
    )
    for (const user of volunteers.rows) {
      await pushNotification(
        pool,
        notifyUser,
        user.id,
        'NEW_DISASTER',
        'disaster',
        { disaster }
      )
    }

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

export async function handleGetAllDisasters(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const disasters = await getAllDisasters(pool)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All disasters retrieved successfully',
      data: disasters
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null
    })
  }
}

export async function handleGetDisasterById(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  id: string
) {
  try {
    const disaster = await getDisasterById(pool, id)
    if (!disaster) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Disaster not found',
        data: null
      })
      return
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Disaster retrieved successfully',
      data: disaster
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null
    })
  }
}

export async function handleUpdateDisaster(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  id: string
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateDisasterInput>
    const disaster = await updateDisaster(pool, id, body)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Disaster updated successfully',
      data: disaster
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null
    })
  }
}

export async function handleDeleteDisaster(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  id: string
) {
  try {
    const disaster = await deleteDisaster(pool, id)
    if (!disaster) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Disaster not found or already deleted',
        data: null
      })
      return
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Disaster deleted successfully',
      data: disaster
    })
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null
    })
  }
}
