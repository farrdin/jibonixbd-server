import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import { CreateInventoryInput } from './inventory.interface';
import {
  deleteInventory,
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
} from './inventory.service';
import { parseJsonBody } from '../../utils';
import { sendResponse } from '../../utils/sendResponse';
import { createInventoryValidationSchema } from './inventory.validation';
import { notifyUser } from '../../../server';
import { pushNotification } from '../notification/notification.service';

export async function handlecreateInventory(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const body = await parseJsonBody(req);
    const parsed = createInventoryValidationSchema.safeParse(body);
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const validData = parsed.data as CreateInventoryInput;
    const inventory = await createInventory(pool, validData);
    // Notify all admins about new inventory added
    const admins = await pool.query(
      `SELECT id FROM users WHERE role = 'ADMIN'`,
    );
    for (const admin of admins.rows) {
      await pushNotification(
        pool,
        notifyUser,
        admin.id,
        'Donation Added TO Inventory',
        'inventory',
        { inventory },
      );
    }
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Inventory item created successfully',
      data: inventory,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      data: null,
    });
  }
}

export async function handleGetAllInventory(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const inventory = await getAllInventory(pool);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Inventory retrieved successfully',
      data: inventory,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      data: null,
    });
  }
}

export async function handleGetInventoryById(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const id = req.url?.split('/').pop();
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid inventory ID',
      data: null,
    });
    return;
  }

  try {
    const inventory = await getInventoryById(pool, id);
    if (!inventory) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Inventory item not found',
        data: null,
      });
      return;
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Inventory item retrieved successfully',
      data: inventory,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      data: null,
    });
  }
}

export async function handleUpdateInventory(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const id = req.url?.split('/').pop();
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid inventory ID',
      data: null,
    });
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const parsed = createInventoryValidationSchema.partial().safeParse(body);
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const validData = parsed.data as Partial<CreateInventoryInput>;
    const updatedInventory = await updateInventory(pool, id, validData);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedInventory,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      data: null,
    });
  }
}

export async function handleDeleteInventory(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const id = req.url?.split('/').pop();
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid inventory ID',
      data: null,
    });
    return;
  }

  try {
    const inventory = await getInventoryById(pool, id);
    if (!inventory) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Inventory item not found',
        data: null,
      });
      return;
    }
    await deleteInventory(pool, id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Inventory item deleted successfully',
      data: null,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      data: null,
    });
  }
}
