/* eslint-disable @typescript-eslint/no-unused-vars */
import { IncomingMessage } from 'http';
import { ZodSchema } from 'zod';
import { parseJsonBody } from '.';

//  Validate Request BODY using ZOD schema
export async function validateReq(req: IncomingMessage, schema: ZodSchema) {
  try {
    const body = await parseJsonBody(req);
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      return { success: false, error: errorMessages.join(', ') };
    }

    return { success: true, data: parsed.data };
  } catch (err) {
    return { success: false, error: 'Invalid JSON format' };
  }
}
