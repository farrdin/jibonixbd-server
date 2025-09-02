import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import { sendResponse } from '../../utils/sendResponse';
import {
  createDisaster,
  deleteDisaster,
  getAllDisasters,
  getDisasterById,
  updateDisaster,
} from './disaster.service';
import { CreateDisasterInput } from './disaster.interface';
import { createDisasterValidationSchema } from './disaster.validation';
import { pushNotification } from '../notification/notification.service';
import { notifyUser } from '../../../server';
import formidable from 'formidable';

export async function handleCreateDisaster(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const form = formidable({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: err.message,
        data: null,
      });
    }
    try {
      const data = fields as unknown as CreateDisasterInput;
      const parsed = createDisasterValidationSchema.safeParse(data);
      if (!parsed.success) {
        sendResponse(res, {
          statusCode: 400,
          success: false,
          message: 'Validation error',
          data: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const validData = parsed.data as CreateDisasterInput;
      let filePath: string | undefined;

      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        filePath = file.filepath;
      }
      const disaster = await createDisaster(pool, validData, filePath);

      const adminsMods = await pool.query(
        `SELECT id FROM users WHERE role IN ('ADMIN', 'MODERATOR')`,
      );
      for (const user of adminsMods.rows) {
        await pushNotification(
          pool,
          notifyUser,
          user.id,
          'NEW_DISASTER',
          'disaster',
          { disaster },
        );
      }

      // 🔥 Notify Volunteers in disaster area
      const volunteers = await pool.query(
        `SELECT id FROM users WHERE role='VOLUNTEER' AND district = $1`,
        [validData.location],
      );
      for (const user of volunteers.rows) {
        await pushNotification(
          pool,
          notifyUser,
          user.id,
          'NEW_DISASTER',
          'disaster',
          { disaster },
        );
      }

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Disaster recorded successfully',
        data: disaster,
      });
    } catch (err) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: err instanceof Error ? err.message : 'Server Error',
        data: null,
      });
    }
  });
}

export async function handleGetAllDisasters(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const disasters = await getAllDisasters(pool);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All disasters retrieved successfully',
      data: disasters,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null,
    });
  }
}

export async function handleGetDisasterById(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  id: string,
) {
  try {
    const disaster = await getDisasterById(pool, id);
    if (!disaster) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Disaster not found',
        data: null,
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Disaster retrieved successfully',
      data: disaster,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null,
    });
  }
}

export async function handleUpdateDisaster(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  id: string,
) {
  const form = formidable({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err)
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: err.message,
        data: null,
      });
    try {
      const data = fields as Partial<CreateDisasterInput>;
      let filePath: string | undefined;
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        filePath = file.filepath;
      }
      const disaster = await updateDisaster(pool, id, data, filePath);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Disaster updated successfully',
        data: disaster,
      });
    } catch (err) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: err instanceof Error ? err.message : 'Server error',
        data: null,
      });
    }
  });
}

export async function handleDeleteDisaster(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  id: string,
) {
  try {
    const disaster = await deleteDisaster(pool, id);
    if (!disaster) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Disaster not found or already deleted',
        data: null,
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Disaster deleted successfully',
      data: disaster,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server error',
      data: null,
    });
  }
}
