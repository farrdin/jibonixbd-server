import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import { parseJsonBody } from '../../utils';
import { CreateReliefRequestInput } from './reliefRequest.interface';
import { sendResponse } from '../../utils/sendResponse';
import {
  assignReliefToVolunteer,
  createReliefRequest,
  getAllReliefRequests,
  getMyReliefRequests,
  getReliefRequestById,
  updateReliefRequest,
} from './reliefRequest.service';
import { createReliefRequestValidationSchema } from './reliefRequest.validation';
import { getAuthUser } from '../../middlewares/auth';
import { notifyUser } from '../../../server';
import { pushNotification } from '../notification/notification.service';

export async function handleCreateReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const body = await parseJsonBody(req);
    const parsed = createReliefRequestValidationSchema.safeParse(body);
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const validData = parsed.data as CreateReliefRequestInput;
    const reliefRequest = await createReliefRequest(pool, validData);

    // Notify Admin Here
    const admins = await pool.query(
      `SELECT id FROM users WHERE role = 'ADMIN'`,
    );
    for (const admin of admins.rows) {
      await pushNotification(
        pool,
        notifyUser,
        admin.id,
        'NEW_RELIEF_REQUEST',
        'relief',
        { reliefRequest },
      );
    }
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Relief request created successfully',
      data: reliefRequest,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null,
    });
  }
}
export async function handleGetAllReliefRequests(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const requests = await getAllReliefRequests(pool);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All relief requests retrieved successfully',
      data: requests,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null,
    });
  }
}
export async function handleGetReliefRequestById(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const id = req.url?.split('/').pop()?.split('?')[0];
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid request ID',
      data: null,
    });
    return;
  }

  try {
    const request = await getReliefRequestById(pool, id);
    if (!request) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Relief request not found',
        data: null,
      });
      return;
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Relief request retrieved successfully',
      data: request,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null,
    });
  }
}
export async function handleGetMyReliefRequests(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const user = getAuthUser(req);
    if (!user || !user.email) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
        data: null,
      });
      return;
    }
    const victimResult = await pool.query(
      `SELECT id FROM victims WHERE user_id = $1`,
      [user.id],
    );
    const victimId = victimResult.rows[0]?.id;
    const requests = await getMyReliefRequests(pool, victimId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Relief requests retrieved successfully',
      data: requests,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal Server Error',
      data: null,
    });
  }
}
export async function handleUpdateReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const id = req.url?.split('/').pop()?.split('?')[0];
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid request ID',
      data: null,
    });
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const parsed = createReliefRequestValidationSchema
      .partial()
      .safeParse(body);
    if (!parsed.success) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Validation failed',
        data: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const validData = parsed.data as Partial<CreateReliefRequestInput>;
    const updatedRequest = await updateReliefRequest(pool, id, validData);

    if (!updatedRequest) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Relief request not found',
        data: null,
      });
      return;
    }
    //* Notify victim when status changes
    if (validData.status) {
      const victimRes = await pool.query(
        `SELECT user_id FROM victims WHERE id = $1`,
        [updatedRequest.victim_id],
      );
      const victimUserId = victimRes.rows[0]?.user_id;
      if (victimUserId) {
        await pushNotification(
          pool,
          notifyUser,
          victimUserId,
          `RELIEF_STATUS_UPDATED_TO ${validData.status}`,
          'relief',
          { status: validData.status, reliefRequest: updatedRequest },
        );
      }

      // Notify Admins if completed
      if (validData.status === 'COMPLETED') {
        const admins = await pool.query(
          `SELECT id FROM users WHERE role = 'ADMIN'`,
        );
        for (const admin of admins.rows) {
          await pushNotification(
            pool,
            notifyUser,
            admin.id,
            `RELIEF_COMPLETED ${id}`,
            'relief',
            { reliefRequest: updatedRequest },
          );
        }
        if (victimUserId) {
          await pushNotification(
            pool,
            notifyUser,
            victimUserId,
            'RELIEF_COMPLETED',
            'relief',
            { reliefRequest: updatedRequest },
          );
        }
      }
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Relief request updated successfully',
      data: updatedRequest,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null,
    });
  }
}
export async function handleDeleteReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const id = req.url?.split('/').pop()?.split('?')[0];
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid relief request ID',
      data: null,
    });
    return;
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM relief_requests WHERE id = $1 RETURNING *',
        [id],
      );

      if (!result.rows.length) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: 'Relief request not found',
          data: null,
        });
        return;
      }

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Relief request deleted successfully',
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null,
    });
  }
}
export async function handleAssignReliefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const match = req.url?.match(
    /^\/api\/relief-request\/([0-9a-fA-F-]{36})\/assign/,
  );
  const id = match?.[1];
  if (!id) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Invalid relief request ID',
      data: null,
    });
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const { volunteerUserId, victimId } = body as {
      volunteerUserId: string;
      victimId: string;
    };

    if (!volunteerUserId || !victimId) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Missing volunteerUserId or victimId',
        data: null,
      });
      return;
    }

    const updatedRequest = await assignReliefToVolunteer(
      pool,
      id,
      volunteerUserId,
      victimId,
      notifyUser,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Relief request assigned successfully',
      data: updatedRequest,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Internal server error',
      data: null,
    });
  }
}
