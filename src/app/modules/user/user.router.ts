import { IncomingMessage, ServerResponse } from 'http';
import { Pool } from 'pg';
import {
  handleGetAllUsers,
  handleUpdateUser,
  handleGetUserById,
  handleDeleteUser,
  handleLoggedInUser,
  handleUpdateUserRole,
  handleUpdateVolunteerStatus,
  handleUpdateModeratorCanVerifyVictims,
  handleVerifyVictim,
} from './user.controller';
import { catchAsync } from '../../utils/catchAsync';
import { authorizeRoles } from '../../middlewares/auth';
import { extractIdFromUrl, parseJsonBody } from '../../utils';
import { UserRole } from './user.interface';

export default async function userRouter(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Pool,
) {
  const url = req.url?.split('?')[0] || '';

  // get all users
  if (url === '/api/users' && req.method === 'GET') {
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync(handleGetAllUsers)(req, res, pool);
      return;
    });
  }
  // get My Profile
  if (url === '/api/users/me' && req.method === 'GET') {
    return await catchAsync(handleLoggedInUser)(req, res, pool);
  }
  // get user by ID
  if (url.startsWith('/api/users/') && req.method === 'GET') {
    const userId = extractIdFromUrl(url, '/api/users/');
    // const userId = url.split('/')[3];
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleGetUserById(req, res, pool, userId),
      )(req, res, pool);
      return;
    });
  }

  // update moderator can verify victims
  if (url.startsWith('/api/users/mods-can-verify/') && req.method === 'PATCH') {
    const userId = extractIdFromUrl(url, '/api/users/mods-can-verify/');
    // const userId = url.split('/')[4];
    return authorizeRoles(['ADMIN'])(req, res, async () =>
      catchAsync((req, res, pool) =>
        handleUpdateModeratorCanVerifyVictims(req, res, pool, userId),
      )(req, res, pool),
    );
  }

  // Verify Victim
  if (
    url.startsWith('/api/users/victim-is-verified/') &&
    req.method === 'PATCH'
  ) {
    const userId = extractIdFromUrl(url, '/api/users/victim-is-verified/');
    // const userId = url.split('/')[4];
    return authorizeRoles(['ADMIN', 'MODERATOR'])(req, res, async () =>
      catchAsync((req, res, pool) =>
        handleVerifyVictim(req, res, pool, userId),
      )(req, res, pool),
    );
  }

  // Update Volunteer Status
  if (url.startsWith('/api/users/status/') && req.method === 'PATCH') {
    const volunteerId = extractIdFromUrl(url, '/api/users/status/');
    // const volunteerId = url.split('/')[4];
    return authorizeRoles(['ADMIN', 'MODERATOR'])(req, res, async () =>
      catchAsync((req, res, pool) =>
        handleUpdateVolunteerStatus(req, res, pool, volunteerId),
      )(req, res, pool),
    );
  }

  // update user role
  if (url.startsWith('/api/users/role/') && req.method === 'PATCH') {
    const userId = extractIdFromUrl(url, '/api/users/role/');
    // const userId = url.split('/')[4];
    const body = (await parseJsonBody(req)) as { role?: string };
    const role = body.role;

    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleUpdateUserRole(req, res, pool, userId, role as UserRole),
      )(req, res, pool);
      return;
    });
  }

  // update user
  if (url.startsWith('/api/users/') && req.method === 'PATCH') {
    const userId = extractIdFromUrl(url, '/api/users/');
    // const userId = url.split('/')[3];
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleUpdateUser(req, res, pool, userId),
      )(req, res, pool);
      return;
    });
  }

  // delete user
  if (url.startsWith('/api/users/') && req.method === 'DELETE') {
    const userId = extractIdFromUrl(url, '/api/users/');
    // const userId = url.split('/')[3];
    return authorizeRoles(['ADMIN'])(req, res, async () => {
      await catchAsync((req, res, pool) =>
        handleDeleteUser(req, res, pool, userId),
      )(req, res, pool);
      return;
    });
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'fail', message: 'User route not found' }));
}
