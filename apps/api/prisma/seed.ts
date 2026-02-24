import { PrismaClient } from '@prisma/client';
import { AuthType, HttpMethod, ServiceStatus } from '../src/common/constants/catalog.constants';

const prisma = new PrismaClient();

type SeedService = {
  name: string;
  description?: string;
  owner?: string;
  status: ServiceStatus;
  tags: string[];
  endpoints: Array<{
    method: HttpMethod;
    path: string;
    version: string;
    slaMs: number;
    authType: AuthType;
  }>;
};

const services: SeedService[] = [
  {
    name: 'Order Service',
    description: 'Handles order lifecycle and order state transitions.',
    owner: 'commerce-team',
    status: 'active',
    tags: ['orders', 'commerce', 'core'],
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/orders',
        version: 'v1',
        slaMs: 120,
        authType: 'jwt',
      },
      {
        method: 'POST',
        path: '/api/v1/orders',
        version: 'v1',
        slaMs: 250,
        authType: 'jwt',
      },
    ],
  },
  {
    name: 'Billing Service',
    description: 'Manages invoices, payment intents and reconciliation.',
    owner: 'finance-platform',
    status: 'paused',
    tags: ['billing', 'payments'],
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/invoices',
        version: 'v1',
        slaMs: 200,
        authType: 'apiKey',
      },
    ],
  },
  {
    name: 'Notification Service',
    description: 'Sends emails, SMS and push notifications.',
    owner: 'eng-experience',
    status: 'deprecated',
    tags: ['notifications'],
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/notifications',
        version: 'v1',
        slaMs: 300,
        authType: 'public',
      },
    ],
  },
];

async function main() {
  for (const service of services) {
    const existing = await prisma.service.findUnique({ where: { name: service.name } });

    if (existing) {
      continue;
    }

    await prisma.service.create({
      data: {
        name: service.name,
        description: service.description,
        owner: service.owner,
        status: service.status,
        tags: {
          create: service.tags.map((tag) => ({ value: tag })),
        },
        endpoints: {
          create: service.endpoints,
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });
