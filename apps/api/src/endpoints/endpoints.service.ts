import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEndpointDto, ListEndpointsQueryDto, UpdateEndpointDto } from './dto/endpoint.dto';

@Injectable()
export class EndpointsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByService(serviceId: string, query: ListEndpointsQueryDto) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    return this.prisma.endpoint.findMany({
      where: { serviceId },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async create(serviceId: string, dto: CreateEndpointDto) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    return this.prisma.endpoint.create({
      data: {
        serviceId,
        method: dto.method,
        path: dto.path,
        version: dto.version,
        slaMs: dto.slaMs,
        authType: dto.authType,
      },
    });
  }

  async update(id: string, dto: UpdateEndpointDto) {
    const existing = await this.prisma.endpoint.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Endpoint ${id} not found`);
    }

    return this.prisma.endpoint.update({
      where: { id },
      data: {
        method: dto.method,
        path: dto.path,
        version: dto.version,
        slaMs: dto.slaMs,
        authType: dto.authType,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.endpoint.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Endpoint ${id} not found`);
    }

    await this.prisma.endpoint.delete({ where: { id } });

    return {
      message: 'Endpoint deleted',
      id,
    };
  }
}
