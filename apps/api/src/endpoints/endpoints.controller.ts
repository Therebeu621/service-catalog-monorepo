import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateEndpointDto, ListEndpointsQueryDto, UpdateEndpointDto } from './dto/endpoint.dto';
import { EndpointsService } from './endpoints.service';

@ApiTags('endpoints')
@Controller()
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  @Get('services/:serviceId/endpoints')
  @ApiOkResponse({ description: 'List endpoints for a service.' })
  findByService(@Param('serviceId') serviceId: string, @Query() query: ListEndpointsQueryDto) {
    return this.endpointsService.findByService(serviceId, query);
  }

  @Post('services/:serviceId/endpoints')
  @ApiCreatedResponse({ description: 'Create endpoint for service.' })
  create(@Param('serviceId') serviceId: string, @Body() dto: CreateEndpointDto) {
    return this.endpointsService.create(serviceId, dto);
  }

  @Put('endpoints/:id')
  @ApiOkResponse({ description: 'Update endpoint.' })
  update(@Param('id') id: string, @Body() dto: UpdateEndpointDto) {
    return this.endpointsService.update(id, dto);
  }

  @Delete('endpoints/:id')
  @ApiOkResponse({ description: 'Delete endpoint.' })
  remove(@Param('id') id: string) {
    return this.endpointsService.remove(id);
  }
}
