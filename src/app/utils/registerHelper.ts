import { insertVolunteerWithUser } from '../modules/volunteer/volunteer.service';
import { insertVictimWithUser } from '../modules/victim/victim.service';
import { insertDonorWithUser } from '../modules/donor/donor.service';
import { createDonorValidationSchema } from '../modules/donor/donor.validation';
import { createVictimValidationSchema } from '../modules/victim/victim.validation';
import { createVolunteerValidationSchema } from '../modules/volunteer/volunteer.validation';
import { createAdminValidationSchema } from '../modules/admin/admin.validation';
import { createModeratorValidationSchema } from '../modules/moderator/moderator.validation';
import { insertAdminWithUser } from '../modules/admin/admin.service';
import { insertModeratorWithUser } from '../modules/moderator/moderator.service';

// Role Validation Schemas
export const roleValidationSchemas = {
  ADMIN: createAdminValidationSchema,
  MODERATOR: createModeratorValidationSchema,
  VOLUNTEER: createVolunteerValidationSchema,
  VICTIM: createVictimValidationSchema,
  DONOR: createDonorValidationSchema,
};

// Role Insert Functions
export const roleInsertFunctions = {
  ADMIN: insertAdminWithUser,
  MODERATOR: insertModeratorWithUser,
  VOLUNTEER: insertVolunteerWithUser,
  VICTIM: insertVictimWithUser,
  DONOR: insertDonorWithUser,
};
