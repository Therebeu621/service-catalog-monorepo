import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, ListServicesQueryDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

const DEFAULT_SORT_BY: 'name' | 'createdAt' = 'createdAt';
const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';

type ServiceListRecord = Prisma.ServiceGetPayload<{
  include: {
    tags: true;
    _count: { select: { endpoints: true } };
  };
}>;

type ServiceDetailRecord = Prisma.ServiceGetPayload<{
  include: {
    tags: true;
    endpoints: true;
  };
}>;

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeTags(tags?: string[]): string[] {
    if (!tags) {
      return [];
    }

    return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
  }

  private mapListRecord(record: ServiceListRecord) {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      owner: record.owner,
      status: record.status,
      tags: record.tags.map((tag) => tag.value),
      endpointsCount: record._count.endpoints,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private mapDetailRecord(record: ServiceDetailRecord) {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      owner: record.owner,
      status: record.status,
      tags: record.tags.map((tag) => tag.value),
      endpoints: record.endpoints,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async create(dto: CreateServiceDto) {
    const tags = this.normalizeTags(dto.tags);

    const created = await this.prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description,
        owner: dto.owner,
        status: dto.status ?? 'active',
        tags: {
          create: tags.map((tag) => ({ value: tag })),
        },
      },
      include: {
        tags: true,
        endpoints: true,
      },
    });

    return this.mapDetailRecord(created);
  }

  async findAll(query: ListServicesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: Prisma.ServiceWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.tag) {
      where.tags = {
        some: {
          value: query.tag,
        },
      };
    }

    const sortBy = query.sortBy ?? DEFAULT_SORT_BY;
    const sortOrder = query.sortOrder ?? DEFAULT_SORT_ORDER;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          tags: true,
          _count: {
            select: {
              endpoints: true,
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: items.map((item) => this.mapListRecord(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.service.findUnique({
      where: { id },
      include: {
        tags: true,
        endpoints: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    return this.mapDetailRecord(record);
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    const tags = dto.tags ? this.normalizeTags(dto.tags) : undefined;

    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        owner: dto.owner,
        status: dto.status,
        tags:
          tags !== undefined
            ? {
                deleteMany: {},
                create: tags.map((tag) => ({ value: tag })),
              }
            : undefined,
      },
      include: {
        tags: true,
        endpoints: true,
      },
    });

    return this.mapDetailRecord(updated);
  }

  async remove(id: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    await this.prisma.service.delete({ where: { id } });

    return {
      message: 'Service deleted',
      id,
    };
  }
}
