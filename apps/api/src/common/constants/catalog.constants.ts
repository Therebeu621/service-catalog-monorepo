export const SERVICE_STATUSES = ['active', 'paused', 'deprecated'] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export const AUTH_TYPES = ['public', 'apiKey', 'jwt'] as const;
export type AuthType = (typeof AUTH_TYPES)[number];
