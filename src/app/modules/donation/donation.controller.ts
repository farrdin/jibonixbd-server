import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import {
  createDonation,
  deleteDonation,
  getSingleDonation,
  getDonationsByDisasterId,
  getMyDonations,
  updateDonationStatus
} from './donation.service'
import { CreateDonationInput } from './donation.interface'
import { createDonationValidationSchema } from './donation.validation'
import { getAuthUser } from '../../middlewares/auth'
import { pushNotification } from '../notification/notification.service'
import { notifyUser } from '../../../server'

export async function handleCreateDonation(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  notifyUser: (
    role: string,
    event: string,
    data: Record<string, unknown>
  ) => void
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

    const notificationPayload = {
      donationId: donation.id,
      message: `New donation received from donor ${donation.donor_id}`
    }

    const adminsRes = await pool.query(
      `SELECT id FROM users WHERE role = 'ADMIN'`
    )
    const admins = adminsRes.rows

    for (const admin of admins) {
      await pushNotification(
        pool,
        notifyUser,
        admin.id,
        'NEW_DONATION',
        'ADMIN',
        notificationPayload
      )
    }
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

export async function handleGetDonationsByDisasterId(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const disasterId = req.url?.split('/').pop()?.split('?')[0]
  if (!disasterId) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid disaster ID',
      data: null
    })
    return
  }

  try {
    const donations = await getDonationsByDisasterId(pool, disasterId)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Donations retrieved successfully',
      data: donations
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

export async function handleGetSingleDonation(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const donationId = req.url?.split('/').pop()?.split('?')[0]
  if (!donationId) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid donation ID',
      data: null
    })
    return
  }

  try {
    const donation = await getSingleDonation(pool, donationId)
    if (!donation) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Donation not found',
        data: null
      })
      return
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Donation retrieved successfully',
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

export async function handleUpdateDonationStatus(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const donationId = req.url?.split('/').pop()?.split('?')[0]
  if (!donationId) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid donation ID',
      data: null
    })
    return
  }

  const body = (await parseJsonBody(req)) as { status?: string }
  const status = body.status

  if (!status) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Status is required',
      data: null
    })
    return
  }

  try {
    const updatedDonation = await updateDonationStatus(pool, donationId, status)
    if (updatedDonation && updatedDonation.donor_id) {
      const donor = await pool.query(
        'SELECT user_id FROM donors WHERE id = $1',
        [updatedDonation.donor_id]
      )

      if (donor.rows.length > 0) {
        // Notify donor about status change
        await pushNotification(
          pool,
          notifyUser,
          donor.rows[0].user_id,
          'DONATION_STATUS_UPDATED',
          'DONOR',
          {
            donationId: updatedDonation.id,
            status: updatedDonation.status,
            message: `Your donation status has been updated to ${updatedDonation.status}`
          }
        )
      }
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Donation status updated successfully',
      data: updatedDonation
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

export async function handleDeleteDonation(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const donationId = req.url?.split('/').pop()?.split('?')[0]
  if (!donationId) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid donation ID',
      data: null
    })
    return
  }

  try {
    const deletedDonation = await deleteDonation(pool, donationId)
    if (!deletedDonation) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Donation not found',
        data: null
      })
      return
    }
    // Notify admins about deletion
    const adminsRes = await pool.query(
      `SELECT id FROM users WHERE role = 'ADMIN'`
    )
    const admins = adminsRes.rows

    for (const admin of admins) {
      await pushNotification(
        pool,
        notifyUser,
        admin.id,
        'DONATION_DELETED',
        'ADMIN',
        {
          donationId: deletedDonation.id,
          message: `Donation ${deletedDonation.id} was deleted`
        }
      )
    }

    // Notify donor (optional)
    await pushNotification(
      pool,
      notifyUser,
      deletedDonation.donor_id,
      'DONATION_DELETED',
      'DONOR',
      {
        donationId: deletedDonation.id,
        message: `Your donation ${deletedDonation.id} was deleted`
      }
    )
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Donation deleted successfully',
      data: deletedDonation
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

export async function handleDonationRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  const method = req.method?.toUpperCase()

  switch (method) {
    case 'POST':
      return handleCreateDonation(req, res, pool, notifyUser)
    case 'GET':
      if (req.url?.includes('/donation/disaster/')) {
        return handleGetDonationsByDisasterId(req, res, pool)
      } else if (req.url?.includes('/donation/')) {
        return handleGetSingleDonation(req, res, pool)
      }
      break
    case 'PUT':
      return handleUpdateDonationStatus(req, res, pool)
    case 'DELETE':
      return handleDeleteDonation(req, res, pool)
    default:
      sendResponse(res, {
        statusCode: 405,
        success: false,
        message: 'Method Not Allowed',
        data: null
      })
  }
}

export async function handleGetAllDonations(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const result = await pool.query('SELECT * FROM donations')
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All donations retrieved successfully',
      data: result.rows
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

export async function handleGetMyDonations(
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
    const donorResult = await pool.query(
      `SELECT id FROM donors WHERE user_id = $1`,
      [user.id]
    )

    const donorId = donorResult.rows[0]?.id

    const donations = await getMyDonations(pool, donorId)

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'My Donations retrieved successfully',
      data: donations
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
