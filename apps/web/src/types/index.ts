export type ServiceStatus = 'active' | 'paused' | 'deprecated';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type AuthType = 'public' | 'apiKey' | 'jwt';

export type Endpoint = {
  id: string;
  serviceId: string;
  method: HttpMethod;
  path: string;
  version: string;
  slaMs: number;
  authType: AuthType;
  createdAt: string;
  updatedAt: string;
};

export type ServiceListItem = {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  status: ServiceStatus;
  tags: string[];
  endpointsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceDetail = {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  status: ServiceStatus;
  tags: string[];
  endpoints: Endpoint[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DashboardResponse = {
  totalServices: number;
  totalEndpoints: number;
  servicesByStatus: Record<ServiceStatus, number>;
  endpointsByAuthType: Record<AuthType, number>;
};
