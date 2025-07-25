import { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'
import { CreateInventoryInput } from './inventory.interface'
import { insertInventory } from './inventory.service'
import { parseJsonBody } from '../../utils'
import { sendResponse } from '../../utils/sendResponse'

export async function createInventory(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool
) {
  try {
    const body = (await parseJsonBody(req)) as Partial<CreateInventoryInput>

    if (!body.donation_id || typeof body.item_name !== 'string') {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'donation_id and item_name are required',
        data: null
      })
    }

    const inventory = await insertInventory(pool, body as CreateInventoryInput)

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
