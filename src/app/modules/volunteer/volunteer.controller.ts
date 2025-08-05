import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { parseJsonBody } from '../../utils'
import { insertVolunteerWithUser } from './volunteer.service'
import { sendResponse } from '../../utils/sendResponse'
import { CreateVolunteerInput } from './volunteer.interface'
import { createVolunteerValidationSchema } from './volunteer.validation'

export async function createVolunteer(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createVolunteerValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as CreateVolunteerInput
    const newVolunteer = await insertVolunteerWithUser(pool, validData)
    const { user, volunteer } = newVolunteer

    // Merge user and volunteer data into one object
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Volunteer registered successfully',
      data: {
        id: volunteer.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: volunteer.skills,
        preferred_locations: volunteer.preferred_locations,
        availability_time: volunteer.availability_time,
        status: volunteer.status,
        created_at: volunteer.created_at,
        updated_at: volunteer.updated_at
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
