import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ServicesModule } from './services/services.module';
import { EndpointsModule } from './endpoints/endpoints.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, ServicesModule, EndpointsModule, DashboardModule],
  controllers: [HealthController],
})
export class AppModule {}
