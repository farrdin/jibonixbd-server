import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { CreateInventoryInput } from './inventory.interface'
import { insertInventory } from './inventory.service'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'
import { createInventoryValidationSchema } from './inventory.validation'

export async function createInventory(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = await parseJsonBody(req)
    const parsed = createInventoryValidationSchema.safeParse(body)
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors
      })
      return
    }
    const validData = parsed.data as CreateInventoryInput
    const inventory = await insertInventory(pool, validData)
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Inventory item created successfully',
      data: inventory
    })
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      data: null
    })
  }
}
