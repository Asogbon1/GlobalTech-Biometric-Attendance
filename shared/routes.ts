import { z } from 'zod';
import { insertUserSchema, insertFingerprintSchema, insertAttendanceLogSchema, insertSystemSettingsSchema, users, fingerprints, attendanceLogs, systemSettings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  fingerprints: {
    verify: {
      method: 'POST' as const,
      path: '/api/fingerprint/verify',
      input: z.object({
        templateId: z.string(),
      }),
      responses: {
        200: z.object({
          message: z.string(),
          user: z.custom<typeof users.$inferSelect>(),
          action: z.enum(['SIGN_IN', 'SIGN_OUT']),
        }),
        404: errorSchemas.notFound,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/fingerprint/register',
      input: insertFingerprintSchema,
      responses: {
        201: z.custom<typeof fingerprints.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance/logs',
      input: z.object({
        date: z.string().optional(),
        userId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof attendanceLogs.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/attendance/logs', // Manual override
      input: insertAttendanceLogSchema,
      responses: {
        201: z.custom<typeof attendanceLogs.$inferSelect>(),
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/attendance/stats',
      responses: {
        200: z.object({
          totalPresent: z.number(),
          activeStudents: z.number(),
          activeStaff: z.number(),
        }),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof systemSettings.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings',
      input: insertSystemSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof systemSettings.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
