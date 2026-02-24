import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AUTH_TYPES,
  AuthType,
  SERVICE_STATUSES,
  ServiceStatus,
} from '../common/constants/catalog.constants';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [totalServices, totalEndpoints, servicesRaw, endpointsRaw] = await this.prisma.$transaction([
      this.prisma.service.count(),
      this.prisma.endpoint.count(),
      this.prisma.service.findMany({
        select: {
          status: true,
        },
      }),
      this.prisma.endpoint.findMany({
        select: {
          authType: true,
        },
      }),
    ]);

    const servicesByStatus = Object.fromEntries(
      SERVICE_STATUSES.map((status) => [status, 0]),
    ) as Record<ServiceStatus, number>;

    for (const row of servicesRaw) {
      if (row.status in servicesByStatus) {
        const key = row.status as ServiceStatus;
        servicesByStatus[key] += 1;
      }
    }

    const endpointsByAuthType = Object.fromEntries(
      AUTH_TYPES.map((authType) => [authType, 0]),
    ) as Record<AuthType, number>;

    for (const row of endpointsRaw) {
      if (row.authType in endpointsByAuthType) {
        const key = row.authType as AuthType;
        endpointsByAuthType[key] += 1;
      }
    }

    return {
      totalServices,
      totalEndpoints,
      servicesByStatus,
      endpointsByAuthType,
    };
  }
}
