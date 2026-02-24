import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

function flattenValidationErrors(errors: ValidationError[], parentPath = ''): string[] {
  return errors.flatMap((error) => {
    const fieldPath = parentPath ? `${parentPath}.${error.property}` : error.property;
    const ownErrors = error.constraints
      ? Object.values(error.constraints).map((message) => `${fieldPath}: ${message}`)
      : [];

    const childErrors = error.children?.length
      ? flattenValidationErrors(error.children, fieldPath)
      : [];

    return [...ownErrors, ...childErrors];
  });
}

describe('Service Catalog API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) =>
          new BadRequestException({
            message: 'Validation failed',
            errors: flattenValidationErrors(errors),
          }),
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.endpoint.deleteMany();
    await prisma.serviceTag.deleteMany();
    await prisma.service.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('POST /api/services should create a service', async () => {
    const payload = {
      name: `Catalog-${Date.now()}`,
      description: 'Catalog service for testing',
      owner: 'team-a',
      status: 'active',
      tags: ['catalog', 'test'],
    };

    const response = await request(app.getHttpServer()).post('/api/services').send(payload).expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(payload.name);
    expect(response.body.tags).toEqual(['catalog', 'test']);
  });

  it('POST /api/services should reject invalid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/services')
      .send({
        name: 'a',
      })
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors[0]).toContain('name');
  });

  it('GET /api/services should support search/filter/pagination', async () => {
    await request(app.getHttpServer()).post('/api/services').send({
      name: `Billing-${Date.now()}`,
      description: 'Billing pipeline',
      status: 'paused',
      tags: ['billing'],
    });

    await request(app.getHttpServer()).post('/api/services').send({
      name: `Orders-${Date.now()}`,
      description: 'Orders processing',
      status: 'active',
      tags: ['orders'],
    });

    const response = await request(app.getHttpServer())
      .get('/api/services')
      .query({ search: 'Billing', status: 'paused', page: 1, limit: 10 })
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(10);
    expect(response.body.data[0].status).toBe('paused');
  });

  it('POST /api/services/:serviceId/endpoints should create endpoint', async () => {
    const serviceResponse = await request(app.getHttpServer()).post('/api/services').send({
      name: `EndpointHost-${Date.now()}`,
      description: 'Service to host endpoints',
      status: 'active',
      tags: ['api'],
    });

    const serviceId = serviceResponse.body.id;

    const endpointPayload = {
      method: 'GET',
      path: '/api/v1/example',
      version: 'v1',
      slaMs: 120,
      authType: 'jwt',
    };

    const endpointResponse = await request(app.getHttpServer())
      .post(`/api/services/${serviceId}/endpoints`)
      .send(endpointPayload)
      .expect(201);

    expect(endpointResponse.body.id).toBeDefined();
    expect(endpointResponse.body.serviceId).toBe(serviceId);
    expect(endpointResponse.body.path).toBe('/api/v1/example');
  });
});
