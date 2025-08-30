import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import {
  getAllUsers,
  getUserById,
  updateUser,
  loggedInUser,
  deleteUser,
} from './user.service';
import { parseJsonBody } from '../../utils';
import { sendResponse } from '../../utils/sendResponse';
import { User, UserRole } from './user.interface';
import { getAuthUser, getUserFromCookie } from '../../middlewares/auth';
import { updateVolunteerStatus } from '../volunteer/volunteer.service';
import { updateVerifyVictim } from '../victim/victim.service';
import { updateModeratorCanVerifyVictims } from '../moderator/moderator.service';
import fs from 'fs';
import formidable from 'formidable';
import config from '../../config';

export async function handleGetAllUsers(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const users = await getAllUsers(pool);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users GET successfully',
    data: users,
  });
}

export async function handleGetUserById(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
) {
  try {
    const user = await getUserById(pool, userId);
    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null,
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User retrieved successfully',
      data: user,
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

export async function handleLoggedInUser(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  try {
    const my = getUserFromCookie(req) || getAuthUser(req);
    if (!my || !my.email) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
        data: null,
      });
      return;
    }
    const profile = await pool.query(`SELECT id FROM users WHERE id = $1`, [
      my.id,
    ]);
    const userId = profile.rows[0]?.id;

    const myProfile = await loggedInUser(pool, userId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User profile retrieved successfully',
      data: myProfile,
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

export async function handleUpdateUser(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
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
      const userData: Partial<User> = { ...fields } as unknown as Partial<User>;

      // Handle file upload if photo is provided
      if (files.photo) {
        const file = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        const filePath = file.filepath;

        // Upload to Cloudinary
        const uploaded = await config.cloudinary.uploader.upload(filePath, {
          folder: 'users',
        });
        userData.photo = uploaded.secure_url;

        // Remove temp file
        fs.unlinkSync(filePath);
      }
      const updatedUser = await updateUser(pool, userId, userData);

      if (!updatedUser) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: 'User not found',
          data: null,
        });
      }

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
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

export async function handleUpdateUserRole(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
  role: string,
) {
  try {
    const updatedUser = await updateUser(pool, userId, {
      role: role as UserRole,
    });
    if (!updatedUser) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null,
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User role updated successfully',
      data: updatedUser,
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

export async function handleDeleteUser(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
) {
  try {
    const user = await getUserById(pool, userId);
    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null,
      });
    }
    await deleteUser(pool, userId);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User deleted successfully',
      data: null,
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

export async function handleUpdateVolunteerStatus(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
) {
  try {
    const body = (await parseJsonBody(req)) as {
      status: 'APPROVED' | 'REJECTED';
    };

    const updatedVolunteer = await updateVolunteerStatus(
      pool,
      userId,
      body.status,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Volunteer status updated to ${body.status}`,
      data: updatedVolunteer,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err instanceof Error ? err.message : 'Server Error',
      data: null,
    });
  }
}

export async function handleUpdateModeratorCanVerifyVictims(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
) {
  try {
    const body = (await parseJsonBody(req)) as { canVerify: boolean };
    if (typeof body.canVerify !== 'boolean') {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: '`canVerify` must be a boolean',
        data: null,
      });
    }

    await updateModeratorCanVerifyVictims(pool, userId, body.canVerify);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Moderator permission updated successfully',
      data: { userId, canVerify: body.canVerify },
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

export async function handleVerifyVictim(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
  userId: string,
) {
  try {
    const updatedVictim = await updateVerifyVictim(pool, userId);

    if (!updatedVictim) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Victim not found',
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Victim verified successfully',
      data: updatedVictim,
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
